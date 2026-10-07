-- schema_v2.sql
-- EXTENDS existing schema with Adaptive Learning, Multi-Exam, Live Competition, Social/Clan, xAPI, PWA tables

-- Enable pgcrypto for UUIDs if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Adaptive Learning Tables
CREATE TABLE IF NOT EXISTS fsrs_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id),
    question_id UUID REFERENCES past_questions(id),
    stability FLOAT DEFAULT 1.0,
    difficulty FLOAT DEFAULT 5.0,
    retrievability FLOAT DEFAULT 1.0,
    last_review TIMESTAMP WITH TIME ZONE,
    next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reps INT DEFAULT 0,
    lapses INT DEFAULT 0,
    state VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_fsrs_due ON fsrs_cards(student_id, next_review);
CREATE INDEX IF NOT EXISTS idx_fsrs_topic ON fsrs_cards(topic_id);

CREATE TABLE IF NOT EXISTS topic_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id),
    p_known FLOAT DEFAULT 0.3,
    p_transit FLOAT DEFAULT 0.09,
    p_guess FLOAT DEFAULT 0.2,
    p_slip FLOAT DEFAULT 0.1,
    total_attempts INT DEFAULT 0,
    correct_attempts INT DEFAULT 0,
    is_mastered BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, topic_id)
);

-- Multi-Exam Tables
CREATE TABLE IF NOT EXISTS waec_theory_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id),
    topic_id UUID REFERENCES topics(id),
    year INT,
    question_text TEXT NOT NULL,
    model_answer TEXT NOT NULL,
    marking_guide JSONB,
    total_marks INT DEFAULT 10,
    embedding vector(768),
    exam_type VARCHAR(10) DEFAULT 'WAEC'
);
CREATE INDEX IF NOT EXISTS idx_waec_theory_subj_yr ON waec_theory_questions(subject_id, year);

CREATE TABLE IF NOT EXISTS postutme_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_code VARCHAR(20) NOT NULL,
    subject VARCHAR(100),
    year INT,
    question_text TEXT NOT NULL,
    option_a TEXT, option_b TEXT, option_c TEXT, option_d TEXT,
    correct_option CHAR(1),
    explanation TEXT,
    embedding vector(768)
);
CREATE INDEX IF NOT EXISTS idx_postutme_uni ON postutme_questions(university_code);

CREATE TABLE IF NOT EXISTS professional_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_body VARCHAR(50),
    subject VARCHAR(100),
    level VARCHAR(50),
    year INT,
    question_text TEXT NOT NULL,
    option_a TEXT, option_b TEXT, option_c TEXT, option_d TEXT,
    correct_option CHAR(1),
    explanation TEXT,
    embedding vector(768)
);

-- Live Competition Tables
DO $$ BEGIN
    CREATE TYPE room_status AS ENUM ('waiting', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS competition_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(8) UNIQUE NOT NULL,
    name VARCHAR(100),
    host_id UUID REFERENCES users(id),
    subject_id UUID REFERENCES subjects(id),
    exam_type VARCHAR(10) DEFAULT 'JAMB',
    max_players INT DEFAULT 50,
    question_count INT DEFAULT 30,
    time_per_question_seconds INT DEFAULT 30,
    status room_status DEFAULT 'waiting',
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comp_room_code ON competition_rooms(room_code);

CREATE TABLE IF NOT EXISTS competition_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES competition_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    score INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    rank INT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS competition_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES competition_rooms(id),
    user_id UUID REFERENCES users(id),
    question_id UUID REFERENCES past_questions(id),
    selected_option CHAR(1),
    is_correct BOOLEAN,
    time_taken_ms INT,
    score_earned INT,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supabase Realtime for competition tables (assume publications already exist or handle gracefully)
DO $$
BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE competition_rooms';
EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE competition_participants';
EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE competition_answers';
EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL;
END $$;

-- Social / Clan Tables
CREATE TABLE IF NOT EXISTS clans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    emblem VARCHAR(10) DEFAULT '🦁',
    leader_id UUID REFERENCES users(id),
    school_name VARCHAR(255),
    state VARCHAR(100),
    total_xp BIGINT DEFAULT 0,
    weekly_xp INT DEFAULT 0,
    member_count INT DEFAULT 0,
    max_members INT DEFAULT 20,
    invite_code VARCHAR(8) UNIQUE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clan_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clan_id UUID REFERENCES clans(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'member',
    xp_contributed BIGINT DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clan_id, user_id)
);

CREATE TABLE IF NOT EXISTS clan_wars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenger_clan_id UUID REFERENCES clans(id),
    defender_clan_id UUID REFERENCES clans(id),
    subject_id UUID REFERENCES subjects(id),
    challenger_score INT DEFAULT 0,
    defender_score INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    winner_clan_id UUID REFERENCES clans(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- xAPI Learning Record Store
CREATE TABLE IF NOT EXISTS xapi_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id),
    verb VARCHAR(50) NOT NULL,
    object_type VARCHAR(50),
    object_id VARCHAR(255),
    result_score FLOAT,
    result_success BOOLEAN,
    result_duration_seconds INT,
    context_exam VARCHAR(20),
    context_subject VARCHAR(50),
    raw_statement JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_xapi_actor ON xapi_statements(actor_id, created_at);

-- PWA & Multi-Surface Tables
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    platform VARCHAR(20) NOT NULL,
    session_token VARCHAR(255),
    device_info JSONB,
    ip_address INET,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) UNIQUE,
    telegram_enabled BOOLEAN DEFAULT TRUE,
    whatsapp_enabled BOOLEAN DEFAULT FALSE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT FALSE,
    study_reminder_time TIME DEFAULT '22:00:00',
    language VARCHAR(20) DEFAULT 'english',
    timezone VARCHAR(50) DEFAULT 'Africa/Lagos'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_waec_theory_topic ON waec_theory_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_user ON clan_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, last_active);

-- Row Level Security (RLS) for Competition Rooms
ALTER TABLE competition_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for active and waiting rooms"
ON competition_rooms FOR SELECT
USING (status IN ('waiting', 'active'));

CREATE POLICY "Authenticated users can create rooms"
ON competition_rooms FOR INSERT
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update their room"
ON competition_rooms FOR UPDATE
USING (auth.uid() = host_id);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION join_clan(p_user_id UUID, p_clan_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO clan_members (clan_id, user_id, role)
    VALUES (p_clan_id, p_user_id, 'member');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_clan_rank()
RETURNS TABLE(clan_id UUID, rank INT) AS $$
BEGIN
    RETURN QUERY
    SELECT id, RANK() OVER (ORDER BY total_xp DESC)::INT
    FROM clans;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_competition_leaderboard(p_room_id UUID)
RETURNS TABLE(user_id UUID, score INT, correct_count INT, rank INT) AS $$
BEGIN
    RETURN QUERY
    SELECT cp.user_id, cp.score, cp.correct_count,
           RANK() OVER (ORDER BY cp.score DESC)::INT as rank
    FROM competition_participants cp
    WHERE cp.room_id = p_room_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_update_clan_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE clans SET member_count = member_count + 1 WHERE id = NEW.clan_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE clans SET member_count = member_count - 1 WHERE id = OLD.clan_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clan_member_count_trigger ON clan_members;
CREATE TRIGGER update_clan_member_count_trigger
AFTER INSERT OR DELETE ON clan_members
FOR EACH ROW EXECUTE FUNCTION trigger_update_clan_member_count();
