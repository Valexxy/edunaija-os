import os
import random
import uuid
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://xyzcompany.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "public-anon-key")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

SUBJECTS = ["English", "Mathematics", "Physics", "Chemistry", "Biology"]
TOPICS_PER_SUBJECT = {
    "English": ["Lexis and Structure", "Comprehension", "Oral English"],
    "Mathematics": ["Algebra", "Geometry", "Calculus", "Statistics"],
    "Physics": ["Mechanics", "Electricity", "Optics", "Thermodynamics"],
    "Chemistry": ["Organic Chemistry", "Physical Chemistry", "Inorganic Chemistry"],
    "Biology": ["Genetics", "Ecology", "Morphology", "Physiology"]
}

QUESTIONS_DATA = {
    "English": [
        {"q": "Choose the word nearest in meaning: The man was IMPRISONED for his crimes.", "options": ["jailed", "rewarded", "promoted", "exiled"], "ans": "A", "exp": "Imprisoned means to be put in jail."},
        {"q": "Identify the vowel sound in 'Book'.", "options": ["/u:/", "/ʊ/", "/ɔ:/", "/ɒ/"], "ans": "B", "exp": "The double 'o' in book is pronounced with the short 'u' sound /ʊ/."},
        # ... just 2 examples per subject to fit space, but generating 10
    ]
}

def generate_mock_questions():
    questions = []
    
    # 1. Ensure subjects exist
    subject_ids = {}
    for sub in SUBJECTS:
        res = supabase.table("subjects").select("id").eq("name", sub).execute()
        if not res.data:
            ins = supabase.table("subjects").insert({"name": sub, "code": sub[:3].upper(), "exam_type": "JAMB"}).execute()
            subject_ids[sub] = ins.data[0]['id']
        else:
            subject_ids[sub] = res.data[0]['id']

    # 2. Ensure topics exist
    topic_ids = {}
    for sub, topics in TOPICS_PER_SUBJECT.items():
        topic_ids[sub] = {}
        for top in topics:
            res = supabase.table("topics").select("id").eq("name", top).eq("subject_id", subject_ids[sub]).execute()
            if not res.data:
                ins = supabase.table("topics").insert({"name": top, "subject_id": subject_ids[sub], "difficulty_level": "medium"}).execute()
                topic_ids[sub][top] = ins.data[0]['id']
            else:
                topic_ids[sub][top] = res.data[0]['id']

    # 3. Generate questions
    for sub in SUBJECTS:
        for i in range(10):
            topic_name = random.choice(TOPICS_PER_SUBJECT[sub])
            topic_id = topic_ids[sub][topic_name]
            
            # Create some dummy content
            q_text = f"Sample JAMB question {i+1} for {sub} in topic {topic_name}. What is the correct answer?"
            if sub == "Chemistry" and i == 0:
                q_text = "In the equation 2H₂ + O₂ → 2H₂O, how many moles of water are produced from 4 moles of hydrogen?"
                explanation = "From the stoichiometry, 2 moles of H2 produce 2 moles of H2O. Thus 4 moles of H2 produce 4 moles of H2O."
                options = ["2 moles", "4 moles", "6 moles", "8 moles"]
                correct = "B"
            else:
                options = [f"Option {char}" for char in ['A', 'B', 'C', 'D']]
                correct = random.choice(['A', 'B', 'C', 'D'])
                explanation = "This is a dummy explanation for the seeded question."

            q_data = {
                "subject_id": subject_ids[sub],
                "topic_id": topic_id,
                "year": random.choice([2019, 2020, 2021, 2022, 2023]),
                "exam_type": "JAMB",
                "question_text": q_text,
                "option_a": options[0],
                "option_b": options[1],
                "option_c": options[2],
                "option_d": options[3],
                "correct_option": correct,
                "explanation": explanation,
                "embedding": [random.uniform(-1, 1) for _ in range(768)], # dummy embedding 768-dim
                "difficulty_score": random.uniform(0.1, 1.0)
            }
            questions.append(q_data)

    print(f"Inserting {len(questions)} questions...")
    # Batch insert in chunks of 50
    supabase.table("past_questions").insert(questions).execute()
    print("Seeding completed successfully.")

if __name__ == "__main__":
    generate_mock_questions()
