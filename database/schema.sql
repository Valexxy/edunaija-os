-- schema.sql
-- PostgreSQL / Supabase Schema for JAMB/WAEC AI Tutor Bot

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Enums
CREATE TYPE notification_frequency AS ENUM ('daily', 'weekly');
CREATE TYPE plan_type AS ENUM ('free', 'cram_pass', 'season_pass', 'b2b');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE exam_type_enum AS ENUM ('JAMB', 'WAEC', 'BOTH');
CREATE TYPE exam_type_only AS ENUM ('JAMB', 'WAEC');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE session_type AS ENUM ('practice', 'exam_mode', 'weak_review');
CREATE TYPE referral_status AS ENUM ('pending', 'completed', 'rewarded');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE transaction_type AS ENUM ('daily_refill', 'purchase', 'referral_reward', 'bonus', 'deduction', 'streak_bonus');
CREATE TYPE period_enum AS ENUM ('daily', 'weekly', 'monthly', 'alltime');
CREATE TYPE report_type AS ENUM ('weekly', 'monthly');

-- 1. users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    phone VARCHAR(20),
    hearts INT DEFAULT 20,
    max_hearts INT DEFAULT 20,
    streak_days INT DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    referral_code VARCHAR(50) UNIQUE,
    referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
    total_questions_answered INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    xp_points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. parents
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone_number VARCHAR(20),
    whatsapp_number VARCHAR(20),
    email VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    notification_frequency notification_frequency DEFAULT 'weekly',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type plan_type NOT NULL,
    status subscription_status NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    paystack_reference VARCHAR(255),
    amount_paid NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. tutorial_centers
CREATE TABLE tutorial_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    state VARCHAR(100),
    city VARCHAR(100),
    license_key VARCHAR(100) UNIQUE NOT NULL,
    max_students INT DEFAULT 100,
    active_students INT DEFAULT 0,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. subjects
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(50),
    exam_type exam_type_enum NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. topics
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    year_introduced INT,
    difficulty_level difficulty_level DEFAULT 'medium'
);

-- 7. past_questions
CREATE TABLE past_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    year INT,
    exam_type exam_type_only NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    embedding VECTOR(768),
    difficulty_score FLOAT DEFAULT 0.5,
    times_answered INT DEFAULT 0,
    times_correct INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. quiz_sessions
CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    session_type session_type NOT NULL,
    total_questions INT NOT NULL,
    correct_count INT DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    hearts_used INT DEFAULT 0
);

-- 9. user_answers
CREATE TABLE user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES past_questions(id) ON DELETE CASCADE,
    session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    selected_option CHAR(1) CHECK (selected_option IN ('A', 'B', 'C', 'D', NULL)),
    is_correct BOOLEAN,
    time_taken_seconds INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. weak_topics
CREATE TABLE weak_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    failure_count INT DEFAULT 1,
    last_failed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    mastery_score FLOAT DEFAULT 0.0,
    UNIQUE(user_id, topic_id)
);

-- 11. referrals
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(50) NOT NULL,
    status referral_status DEFAULT 'pending',
    hearts_awarded INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 12. payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    paystack_reference VARCHAR(255) UNIQUE NOT NULL,
    paystack_transaction_id VARCHAR(255),
    amount NUMERIC NOT NULL,
    currency VARCHAR(10) DEFAULT 'NGN',
    plan_type plan_type NOT NULL,
    status payment_status DEFAULT 'pending',
    payment_channel VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. heart_transactions
CREATE TABLE heart_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    transaction_type transaction_type NOT NULL,
    description TEXT,
    balance_after INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. leaderboard_snapshots
CREATE TABLE leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    period period_enum NOT NULL,
    rank INT NOT NULL,
    score INT NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL
);

-- 15. parent_reports
CREATE TABLE parent_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    report_type report_type NOT NULL,
    report_data JSONB NOT NULL,
    sms_sent BOOLEAN DEFAULT FALSE,
    whatsapp_sent BOOLEAN DEFAULT FALSE,
    email_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_past_questions_subject_topic ON past_questions(subject_id, topic_id);
CREATE INDEX idx_past_questions_exam_type ON past_questions(exam_type);
CREATE INDEX idx_past_questions_embedding ON past_questions USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX idx_user_answers_session_id ON user_answers(session_id);
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_leaderboard_snapshots_user_period ON leaderboard_snapshots(user_id, period);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update weak topics
CREATE OR REPLACE FUNCTION update_weak_topics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_correct = FALSE THEN
        INSERT INTO weak_topics (user_id, topic_id, subject_id, failure_count, last_failed_at)
        SELECT NEW.user_id, pq.topic_id, pq.subject_id, 1, NOW()
        FROM past_questions pq
        WHERE pq.id = NEW.question_id
        ON CONFLICT (user_id, topic_id) 
        DO UPDATE SET failure_count = weak_topics.failure_count + 1, last_failed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_answer_weak_topics_trigger
AFTER INSERT ON user_answers
FOR EACH ROW EXECUTE FUNCTION update_weak_topics();

-- Function to calculate leaderboard score
CREATE OR REPLACE FUNCTION calculate_leaderboard_score(p_user_id UUID)
RETURNS INT AS $$
DECLARE
    v_score INT;
BEGIN
    SELECT (correct_answers * 10) + xp_points INTO v_score
    FROM users WHERE id = p_user_id;
    RETURN COALESCE(v_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get user rank
CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID, p_period period_enum)
RETURNS INT AS $$
DECLARE
    v_rank INT;
BEGIN
    SELECT rank INTO v_rank
    FROM leaderboard_snapshots
    WHERE user_id = p_user_id AND period = p_period
    ORDER BY snapshot_date DESC LIMIT 1;
    RETURN COALESCE(v_rank, 0);
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE past_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Note: Supabase uses auth.uid() for authenticated users.
-- For a telegram bot, you might authenticate users via a custom JWT or service role key.
-- Assuming service role for bot operations, RLS could be permissive for service_role.

CREATE POLICY "Enable read for authenticated users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable update for users based on id" ON users FOR UPDATE USING (auth.uid() = id);

-- Past questions are readable by everyone
CREATE POLICY "Past questions are readable by all" ON past_questions FOR SELECT USING (true);

-- ============================================================
-- PGVECTOR: match_questions RPC (called by RAG retriever)
-- ============================================================
-- Must be called with service role key from backend
CREATE OR REPLACE FUNCTION match_questions(
    query_embedding vector(768),
    match_subject_id TEXT,
    match_threshold FLOAT DEFAULT 0.70,
    match_count INT DEFAULT 3
)
RETURNS TABLE (
    id UUID,
    subject_id UUID,
    topic_id UUID,
    year INT,
    exam_type exam_type_only,
    question_text TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option CHAR,
    explanation TEXT,
    difficulty_score FLOAT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pq.id,
        pq.subject_id,
        pq.topic_id,
        pq.year,
        pq.exam_type,
        pq.question_text,
        pq.option_a,
        pq.option_b,
        pq.option_c,
        pq.option_d,
        pq.correct_option,
        pq.explanation,
        pq.difficulty_score,
        1 - (pq.embedding <=> query_embedding) AS similarity
    FROM past_questions pq
    JOIN subjects s ON s.id = pq.subject_id
    WHERE
        s.code = match_subject_id
        AND pq.embedding IS NOT NULL
        AND 1 - (pq.embedding <=> query_embedding) > match_threshold
    ORDER BY pq.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================================
-- PGVECTOR: match_questions_by_topic (for spaced repetition)
-- ============================================================
CREATE OR REPLACE FUNCTION match_questions_by_topic(
    query_embedding vector(768),
    p_topic_id UUID,
    match_threshold FLOAT DEFAULT 0.65,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    question_text TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option CHAR,
    explanation TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pq.id,
        pq.question_text,
        pq.option_a,
        pq.option_b,
        pq.option_c,
        pq.option_d,
        pq.correct_option,
        pq.explanation,
        1 - (pq.embedding <=> query_embedding) AS similarity
    FROM past_questions pq
    WHERE
        pq.topic_id = p_topic_id
        AND pq.embedding IS NOT NULL
        AND 1 - (pq.embedding <=> query_embedding) > match_threshold
    ORDER BY pq.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================================
-- IVFFLAT index for fast approximate nearest neighbor search
-- (Run after initial data load for best performance)
-- ============================================================
-- CREATE INDEX ON past_questions USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

