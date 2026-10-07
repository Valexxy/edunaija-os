import uuid
import random

def generate_postutme_seeds():
    universities = {
        'UNILAG': ['Mathematics', 'English', 'General Paper'],
        'UI': ['Physics', 'Chemistry', 'Biology'],
        'OAU': ['Mathematics', 'Physics', 'Chemistry'],
        'ABU': ['Government', 'Economics', 'Geography'],
        'UNN': ['Biology', 'Physics', 'English']
    }
    years = [2018, 2019, 2020, 2021, 2022, 2023]
    
    queries = []
    
    print("-- Seeding 20 Post-UTME Questions per university for top 5 universities\n")
    
    for uni, subjects in universities.items():
        for i in range(20):
            subj = random.choice(subjects)
            year = random.choice(years)
            
            question_text = f"Solve the following {subj} problem for {uni} Post-UTME."
            opts = ["Answer 1", "Answer 2", "Answer 3", "Answer 4"]
            correct_opt = random.choice(['A', 'B', 'C', 'D'])
            explanation = f"The correct answer is {correct_opt} because it logically follows the principles of {subj}."
            
            q_uuid = str(uuid.uuid4())
            
            query = f"""
INSERT INTO postutme_questions (id, university_code, subject, year, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
VALUES ('{q_uuid}', '{uni}', '{subj}', {year}, '{question_text.replace("'", "''")}', '{opts[0]}', '{opts[1]}', '{opts[2]}', '{opts[3]}', '{correct_opt}', '{explanation.replace("'", "''")}');
"""
            queries.append(query.strip())
            
    with open("postutme_seed.sql", "w") as f:
        f.write("-- POST-UTME SEED\n")
        f.write("\n".join(queries))
        
    print("Seed SQL generated in postutme_seed.sql")

if __name__ == "__main__":
    generate_postutme_seeds()
