import argparse
import os
import re
import PyPDF2
import google.generativeai as genai
from typing import Dict, List, Any

def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = text.replace("₦", "NGN")
    return text.strip()

def parse_pdf(file_path: str) -> List[Dict[str, Any]]:
    questions = []
    with open(file_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        full_text = " ".join(page.extract_text() for page in reader.pages if page.extract_text())
        
        full_text = clean_text(full_text)
        # Dummy parsing logic (needs regex tailored to actual PDF structure)
        # E.g., matching "1. What is...? A) ... B) ... C) ... D) ... Answer: B"
        pattern = re.compile(r"(\d+)\.\s+(.*?)\s+A\)\s+(.*?)\s+B\)\s+(.*?)\s+C\)\s+(.*?)\s+D\)\s+(.*?)\s+Answer:\s+([A-D])")
        for match in pattern.finditer(full_text):
            q_num, q_text, opt_a, opt_b, opt_c, opt_d, ans = match.groups()
            questions.append({
                "question": q_text,
                "options": {"A": opt_a, "B": opt_b, "C": opt_c, "D": opt_d},
                "correct_answer": ans
            })
    return questions

def ingest(file_path: str, subject: str, year: int):
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    questions = parse_pdf(file_path)
    print(f"Extracted {len(questions)} questions from {file_path}")
    
    for q in questions:
        q["subject_id"] = subject
        q["year"] = year
        q["exam_type"] = "JAMB"
        
        emb_res = genai.embed_content(
            model="models/text-embedding-004",
            content=q["question"],
            task_type="retrieval_document"
        )
        q["embedding"] = emb_res["embedding"]
        # Upsert to Supabase logic here...
        # supabase.table('past_questions').upsert(q).execute()
        
    print("Ingestion complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest JAMB/WAEC past questions from PDF")
    parser.add_argument("--file", required=True, help="Path to the PDF file")
    parser.add_argument("--subject", required=True, help="Subject ID (e.g., physics, maths)")
    parser.add_argument("--year", required=True, type=int, help="Year of the past question")
    args = parser.parse_args()
    
    ingest(args.file, args.subject, args.year)
