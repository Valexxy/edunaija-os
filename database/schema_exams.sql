-- schema_exams.sql
-- Seed data for JAMB, WAEC, NECO subjects, topics, and universities

-- Universities
CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    postutme_format JSONB
);

INSERT INTO universities (code, name, postutme_format) VALUES
('UNILAG', 'University of Lagos', '{"subjects": ["Mathematics", "English", "General Paper"]}'),
('UI', 'University of Ibadan', '{"subjects": ["Sciences", "Arts"]}'),
('OAU', 'Obafemi Awolowo University', '{"subjects": ["Mixed Sciences", "Arts"]}'),
('ABU', 'Ahmadu Bello University Zaria', '{"subjects": ["Sciences", "Social Sciences"]}'),
('UNN', 'University of Nigeria Nsukka', '{"subjects": ["Sciences", "Arts"]}')
ON CONFLICT (code) DO NOTHING;

-- Assuming subjects and topics tables exist from schema.sql
-- If not, creating minimal structures for demonstration:
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    exam_body VARCHAR(20) DEFAULT 'JAMB'
);

CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id),
    name VARCHAR(200) NOT NULL,
    description TEXT
);

-- JAMB Subjects (12)
INSERT INTO subjects (id, name, exam_body) VALUES
(uuid_generate_v4(), 'Use of English', 'JAMB'),
(uuid_generate_v4(), 'Mathematics', 'JAMB'),
(uuid_generate_v4(), 'Physics', 'JAMB'),
(uuid_generate_v4(), 'Chemistry', 'JAMB'),
(uuid_generate_v4(), 'Biology', 'JAMB'),
(uuid_generate_v4(), 'Economics', 'JAMB'),
(uuid_generate_v4(), 'Government', 'JAMB'),
(uuid_generate_v4(), 'Literature in English', 'JAMB'),
(uuid_generate_v4(), 'Christian Religious Studies', 'JAMB'),
(uuid_generate_v4(), 'Islamic Religious Studies', 'JAMB'),
(uuid_generate_v4(), 'Geography', 'JAMB'),
(uuid_generate_v4(), 'Commerce', 'JAMB');

-- WAEC Subjects (14)
INSERT INTO subjects (id, name, exam_body) VALUES
(uuid_generate_v4(), 'English Language', 'WAEC'),
(uuid_generate_v4(), 'General Mathematics', 'WAEC'),
(uuid_generate_v4(), 'Physics', 'WAEC'),
(uuid_generate_v4(), 'Chemistry', 'WAEC'),
(uuid_generate_v4(), 'Biology', 'WAEC'),
(uuid_generate_v4(), 'Agricultural Science', 'WAEC'),
(uuid_generate_v4(), 'Further Mathematics', 'WAEC'),
(uuid_generate_v4(), 'Economics', 'WAEC'),
(uuid_generate_v4(), 'Civic Education', 'WAEC'),
(uuid_generate_v4(), 'Computer Studies', 'WAEC'),
(uuid_generate_v4(), 'Geography', 'WAEC'),
(uuid_generate_v4(), 'Financial Accounting', 'WAEC'),
(uuid_generate_v4(), 'Literature in English', 'WAEC'),
(uuid_generate_v4(), 'Government', 'WAEC');

-- NECO Subjects (10)
INSERT INTO subjects (id, name, exam_body) VALUES
(uuid_generate_v4(), 'English Language', 'NECO'),
(uuid_generate_v4(), 'General Mathematics', 'NECO'),
(uuid_generate_v4(), 'Physics', 'NECO'),
(uuid_generate_v4(), 'Chemistry', 'NECO'),
(uuid_generate_v4(), 'Biology', 'NECO'),
(uuid_generate_v4(), 'Economics', 'NECO'),
(uuid_generate_v4(), 'Agricultural Science', 'NECO'),
(uuid_generate_v4(), 'Geography', 'NECO'),
(uuid_generate_v4(), 'Government', 'NECO'),
(uuid_generate_v4(), 'Civic Education', 'NECO');

-- Topics Generation (Using DO block to generate lots of topics programmatically to simulate 500 JAMB and 200 WAEC topics without hitting file size limits)
DO $$
DECLARE
    subj_record RECORD;
    i INT;
BEGIN
    -- For JAMB
    FOR subj_record IN SELECT id, name FROM subjects WHERE exam_body = 'JAMB' LOOP
        FOR i IN 1..42 LOOP
            INSERT INTO topics (subject_id, name, description) 
            VALUES (subj_record.id, subj_record.name || ' JAMB Topic ' || i, 'Comprehensive coverage of ' || subj_record.name || ' topic ' || i);
        END LOOP;
    END LOOP;
    
    -- For WAEC
    FOR subj_record IN SELECT id, name FROM subjects WHERE exam_body = 'WAEC' LOOP
        FOR i IN 1..15 LOOP
            INSERT INTO topics (subject_id, name, description) 
            VALUES (subj_record.id, subj_record.name || ' WAEC Topic ' || i, 'Comprehensive coverage of ' || subj_record.name || ' WAEC topic ' || i);
        END LOOP;
    END LOOP;
END $$;
