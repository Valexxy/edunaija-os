-- Migration 202610090002: Server-Authoritative Assessment & Scoring RPCs
-- Provides atomic, tamper-proof functions for attempt lifecycles and mastery updates.

-- 1. Start an assessment attempt
create or replace function public.start_assessment_attempt(p_assessment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_assessment record;
  v_attempt_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required to start assessment';
  end if;

  select id, status, time_limit_seconds into v_assessment
  from public.assessments
  where id = p_assessment_id;

  if not found or v_assessment.status <> 'published' then
    raise exception 'Assessment not found or not published';
  end if;

  insert into public.assessment_attempts (
    assessment_id,
    learner_user_id,
    status,
    started_at
  ) values (
    p_assessment_id,
    v_user_id,
    'in_progress',
    now()
  )
  returning id into v_attempt_id;

  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'assessment_id', p_assessment_id,
    'started_at', now(),
    'time_limit_seconds', v_assessment.time_limit_seconds
  );
end;
$$;

-- 2. Record intermediate answer during an in-progress attempt
create or replace function public.record_attempt_answer(
  p_attempt_id uuid,
  p_question_id uuid,
  p_response jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_attempt record;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select id, learner_user_id, status into v_attempt
  from public.assessment_attempts
  where id = p_attempt_id;

  if not found or v_attempt.learner_user_id <> v_user_id then
    raise exception 'Attempt not found or unauthorized';
  end if;

  if v_attempt.status <> 'in_progress' then
    raise exception 'Attempt is already submitted or closed';
  end if;

  insert into public.attempt_answers (
    attempt_id,
    question_id,
    response,
    answered_at
  ) values (
    p_attempt_id,
    p_question_id,
    p_response,
    now()
  )
  on conflict (attempt_id, question_id)
  do update set
    response = excluded.response,
    answered_at = now();

  return true;
end;
$$;

-- 3. Server-authoritative grading and mastery calculation on submit
create or replace function public.submit_assessment_attempt(p_attempt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_attempt record;
  v_assessment record;
  v_total_score numeric(9,2) := 0;
  v_max_score numeric(9,2) := 0;
  v_item record;
  v_is_correct boolean;
  v_awarded numeric(7,2);
  v_feedback jsonb := '[]'::jsonb;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select id, assessment_id, learner_user_id, status, started_at into v_attempt
  from public.assessment_attempts
  where id = p_attempt_id;

  if not found or v_attempt.learner_user_id <> v_user_id then
    raise exception 'Attempt not found or unauthorized';
  end if;

  if v_attempt.status <> 'in_progress' then
    raise exception 'Attempt is already submitted or closed';
  end if;

  select id, time_limit_seconds into v_assessment
  from public.assessments
  where id = v_attempt.assessment_id;

  -- Iterate through each question in the assessment
  for v_item in (
    select
      aq.question_id,
      aq.points,
      q.topic_id,
      q.prompt,
      q.options,
      q.answer_key,
      q.explanation,
      aa.response
    from public.assessment_questions aq
    join public.questions q on q.id = aq.question_id
    left join public.attempt_answers aa on aa.attempt_id = p_attempt_id and aa.question_id = aq.question_id
    where aq.assessment_id = v_attempt.assessment_id
    order by aq.position asc
  ) loop
    v_max_score := v_max_score + v_item.points;
    v_is_correct := false;

    -- Evaluate single-choice option
    if v_item.response is not null
       and (v_item.response ->> 'selectedOptionId') is not null
       and (v_item.response ->> 'selectedOptionId') = (v_item.answer_key ->> 'correctOptionId') then
      v_is_correct := true;
    end if;

    v_awarded := case when v_is_correct then v_item.points else 0 end;
    v_total_score := v_total_score + v_awarded;

    -- Update answer row
    update public.attempt_answers
    set is_correct = v_is_correct,
        awarded_points = v_awarded
    where attempt_id = p_attempt_id and question_id = v_item.question_id;

    -- Update learner_mastery table for topic
    insert into public.learner_mastery (
      learner_user_id,
      topic_id,
      attempts_count,
      correct_count,
      mastery_score,
      last_practised_at,
      updated_at
    ) values (
      v_user_id,
      v_item.topic_id,
      1,
      case when v_is_correct then 1 else 0 end,
      case when v_is_correct then 100 else 0 end,
      now(),
      now()
    )
    on conflict (learner_user_id, topic_id) do update set
      attempts_count = public.learner_mastery.attempts_count + 1,
      correct_count = public.learner_mastery.correct_count + (case when v_is_correct then 1 else 0 end),
      mastery_score = round(
        ((public.learner_mastery.correct_count + (case when v_is_correct then 1 else 0 end))::numeric /
        (public.learner_mastery.attempts_count + 1)::numeric) * 100, 2
      ),
      last_practised_at = now(),
      updated_at = now();

    -- Append feedback
    v_feedback := v_feedback || jsonb_build_object(
      'question_id', v_item.question_id,
      'is_correct', v_is_correct,
      'awarded_points', v_awarded,
      'max_points', v_item.points,
      'explanation', v_item.explanation,
      'correct_option_id', v_item.answer_key ->> 'correctOptionId'
    );
  end loop;

  -- Finalize attempt
  update public.assessment_attempts
  set status = 'submitted',
      submitted_at = now(),
      score = v_total_score,
      max_score = v_max_score,
      updated_at = now()
  where id = p_attempt_id;

  return jsonb_build_object(
    'attempt_id', p_attempt_id,
    'score', v_total_score,
    'max_score', v_max_score,
    'percentage', case when v_max_score > 0 then round((v_total_score / v_max_score) * 100, 2) else 0 end,
    'feedback', v_feedback
  );
end;
$$;

-- Grant execution to authenticated users
grant execute on function public.start_assessment_attempt(uuid) to authenticated;
grant execute on function public.record_attempt_answer(uuid, uuid, jsonb) to authenticated;
grant execute on function public.submit_assessment_attempt(uuid) to authenticated;
