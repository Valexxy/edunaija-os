import json
import uuid
import random

def generate_waec_seeds():
    subjects = ["English", "Mathematics", "Physics", "Chemistry", "Biology"]
    years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
    
    # Simulate UUIDs for topics and subjects since this is a seed script
    # In a real DB, you would fetch these from the database.
    subject_ids = {s: str(uuid.uuid4()) for s in subjects}
    topic_ids = {s: [str(uuid.uuid4()) for _ in range(3)] for s in subjects}
    
    mcq_queries = []
    theory_queries = []
    
    print("-- Seeding 30 WAEC Questions (15 MCQ, 15 Theory)\n")
    
    for i in range(15):
        # Generate 15 Theory Questions
        subj = random.choice(subjects)
        topic_id = random.choice(topic_ids[subj])
        year = random.choice(years)
        
        question_text = f"Explain the fundamental principles of {subj} in relation to {topic_id[:8]}."
        model_answer = f"The fundamental principle requires understanding of X, Y, and Z. First, X states that... Second, Y implies... Finally, Z concludes..."
        marking_guide = json.dumps({
            "step1": {"marks": 3, "content": "Correctly identifying X"},
            "step2": {"marks": 4, "content": "Explaining relationship with Y"},
            "step3": {"marks": 3, "content": "Conclusion on Z"}
        })
        
        q_uuid = str(uuid.uuid4())
        
        query = f"""
INSERT INTO waec_theory_questions (id, subject_id, topic_id, year, question_text, model_answer, marking_guide, total_marks, exam_type)
VALUES ('{q_uuid}', '{subject_ids[subj]}', '{topic_id}', {year}, '{question_text.replace("'", "''")}', '{model_answer.replace("'", "''")}', '{marking_guide}', 10, 'WAEC');
"""
        theory_queries.append(query.strip())
        
    for i in range(15):
        # Generate 15 MCQ Questions (Assuming past_questions table structure)
        subj = random.choice(subjects)
        topic_id = random.choice(topic_ids[subj])
        year = random.choice(years)
        
        question_text = f"Which of the following best describes an aspect of {subj}?"
        opts = ["Option A", "Option B", "Option C", "Option D"]
        random.shuffle(opts)
        correct_opt = random.choice(['A', 'B', 'C', 'D'])
        
        q_uuid = str(uuid.uuid4())
        
        # We assume a general 'past_questions' table exists for MCQs as implied by foreign keys in schema
        query = f"""
INSERT INTO past_questions (id, subject_id, topic_id, year, question_text, option_a, option_b, option_c, option_d, correct_option, exam_type)
VALUES ('{q_uuid}', '{subject_ids[subj]}', '{topic_id}', {year}, '{question_text.replace("'", "''")}', '{opts[0]}', '{opts[1]}', '{opts[2]}', '{opts[3]}', '{correct_opt}', 'WAEC');
"""
        mcq_queries.append(query.strip())
        
    with open("waec_seed.sql", "w") as f:
        f.write("-- WAEC THEORY SEED\n")
        f.write("\n".join(theory_queries))
        f.write("\n\n-- WAEC MCQ SEED\n")
        f.write("\n".join(mcq_queries))
        
    print("Seed SQL generated in waec_seed.sql")

if __name__ == "__main__":
    generate_waec_seeds()
