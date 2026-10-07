import os
import argparse
import asyncio
from supabase import create_client, Client
import google.generativeai as genai
from dotenv import load_dotenv
import time

load_dotenv()

# Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://xyzcompany.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "public-anon-key")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GEMINI_API_KEY)

async def generate_embeddings_for_batch(questions):
    updates = []
    
    # Text to embed
    texts = [f"Question: {q['question_text']} Options: A) {q['option_a']} B) {q['option_b']} C) {q['option_c']} D) {q['option_d']} Explanation: {q['explanation']}" for q in questions]
    
    try:
        # Call Gemini embedding API
        # Using asynchronous or synchronous (gemini api supports batch)
        # Note: 'models/embedding-001' is being deprecated for 'models/text-embedding-004' but using what user asked
        result = genai.embed_content(
            model="models/embedding-001",
            content=texts,
            task_type="retrieval_document"
        )
        
        embeddings = result['embedding']
        
        for q, emb in zip(questions, embeddings):
            updates.append({
                "id": q['id'],
                "embedding": emb
            })
            
        return updates
    except Exception as e:
        print(f"Error generating embeddings: {e}")
        return None

async def process_missing_embeddings(batch_size, subject_name=None):
    print(f"Starting embedding generation process. Batch size: {batch_size}")
    
    # Get subject id if provided
    subject_id = None
    if subject_name:
        sub_res = supabase.table("subjects").select("id").eq("name", subject_name.capitalize()).execute()
        if sub_res.data:
            subject_id = sub_res.data[0]['id']
            print(f"Filtering by subject: {subject_name}")
        else:
            print(f"Subject {subject_name} not found.")
            return

    query = supabase.table("past_questions").select("id, question_text, option_a, option_b, option_c, option_d, explanation").is_("embedding", "null").limit(batch_size)
    if subject_id:
        query = query.eq("subject_id", subject_id)
        
    while True:
        res = query.execute()
        questions = res.data
        
        if not questions:
            print("No more questions missing embeddings.")
            break
            
        print(f"Fetched {len(questions)} questions. Generating embeddings...")
        updates = await generate_embeddings_for_batch(questions)
        
        if updates:
            print(f"Updating {len(updates)} records in Supabase...")
            # Supabase doesn't have a direct bulk update by ID without upsert, so we upsert
            # Assuming we only need to pass the id and the fields to update
            supabase.table("past_questions").upsert(updates).execute()
            print("Batch update successful.")
        else:
            print("Failed to get embeddings. Retrying after 5 seconds...")
            time.sleep(5)
            continue
            
        time.sleep(1) # Rate limit protection

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate embeddings for JAMB past questions.")
    parser.add_argument("--batch-size", type=int, default=100, help="Number of questions to process per batch")
    parser.add_argument("--subject", type=str, help="Optional subject name to filter by")
    
    args = parser.parse_args()
    
    asyncio.run(process_missing_embeddings(args.batch_size, args.subject))
