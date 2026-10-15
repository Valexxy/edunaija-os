-- 202610140001_ai_sentinel_and_process_lifecycles.sql
-- Enterprise High-Concurrency Process Lifecycles, AI Sentinel Telemetry & Immutable Cryptographic Ledger

-- 1. System Process Lifecycles (FSM Engine for 1,000,000 daily activities)
CREATE TABLE IF NOT EXISTS public.system_process_lifecycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    current_state VARCHAR(64) NOT NULL,
    state_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    failure_recovery_attempts INT NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_process_lifecycles_type_state 
    ON public.system_process_lifecycles (process_type, current_state);
CREATE INDEX IF NOT EXISTS idx_process_lifecycles_entity 
    ON public.system_process_lifecycles (entity_id);
CREATE INDEX IF NOT EXISTS idx_process_lifecycles_user 
    ON public.system_process_lifecycles (user_id);

-- 2. AI Sentinel 60-Second Health Audits (24/7 Reliability Diagnostic Pulse)
CREATE TABLE IF NOT EXISTS public.ai_sentinel_health_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    db_pool_status VARCHAR(32) NOT NULL DEFAULT 'HEALTHY',
    db_latency_ms NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    active_circuit_breaker VARCHAR(64) NOT NULL DEFAULT 'CLOSED',
    active_concurrent_sessions INT NOT NULL DEFAULT 0,
    anomalies_detected JSONB DEFAULT '[]'::jsonb,
    remediations_triggered JSONB DEFAULT '[]'::jsonb,
    health_score INT NOT NULL DEFAULT 100
);

CREATE INDEX IF NOT EXISTS idx_sentinel_audits_timestamp 
    ON public.ai_sentinel_health_audits (audit_timestamp DESC);

-- 3. Immutable SHA-256 Cryptographic Audit Ledger
CREATE TABLE IF NOT EXISTS public.immutable_audit_ledger (
    sequence_id BIGSERIAL PRIMARY KEY,
    record_uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    event_type VARCHAR(64) NOT NULL,
    actor_id UUID,
    entity_id VARCHAR(128) NOT NULL,
    event_payload JSONB NOT NULL,
    previous_record_hash VARCHAR(64) NOT NULL,
    record_hash VARCHAR(64) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_ledger_event_type 
    ON public.immutable_audit_ledger (event_type, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_ledger_entity 
    ON public.immutable_audit_ledger (entity_id);

-- Security: Enable Row Level Security (RLS)
ALTER TABLE public.system_process_lifecycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sentinel_health_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immutable_audit_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Process Lifecycles: Users view their own processes; Service role and Admins manage all
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can read own process lifecycles" ON public.system_process_lifecycles;
    CREATE POLICY "Users can read own process lifecycles" 
        ON public.system_process_lifecycles 
        FOR SELECT 
        USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Admins have full access to process lifecycles" ON public.system_process_lifecycles;
    CREATE POLICY "Admins have full access to process lifecycles" 
        ON public.system_process_lifecycles 
        FOR ALL 
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

    -- Health Audits: Admins and Service Role only
    DROP POLICY IF EXISTS "Admins can view sentinel health audits" ON public.ai_sentinel_health_audits;
    CREATE POLICY "Admins can view sentinel health audits" 
        ON public.ai_sentinel_health_audits 
        FOR SELECT 
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

    -- Immutable Ledger: Strictly Read-Only for Admins, NO UPDATE, NO DELETE
    DROP POLICY IF EXISTS "Admins can inspect immutable audit ledger" ON public.immutable_audit_ledger;
    CREATE POLICY "Admins can inspect immutable audit ledger" 
        ON public.immutable_audit_ledger 
        FOR SELECT 
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
END $$;

-- Revoke UPDATE and DELETE on immutable ledger to enforce mathematical immutability
REVOKE UPDATE, DELETE ON public.immutable_audit_ledger FROM PUBLIC, authenticated, anon;
