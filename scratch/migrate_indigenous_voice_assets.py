import sqlite3
import json
from backend.services.indigenous_tts_service import GOLDEN_AUDIO_VAULT

def run_migration():
    conn = sqlite3.connect("backend/database/edunaija.db")
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS indigenous_voice_assets (
        id TEXT PRIMARY KEY,
        language TEXT NOT NULL,
        category TEXT NOT NULL,
        text_indigenous TEXT NOT NULL,
        phonetic_ipa TEXT,
        english_translation TEXT NOT NULL,
        persona_id TEXT NOT NULL,
        cultural_context TEXT,
        tone_sequence_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_indig_lang ON indigenous_voice_assets(language);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_indig_cat ON indigenous_voice_assets(category);")
    
    count = 0
    for item in GOLDEN_AUDIO_VAULT:
        cursor.execute("""
        INSERT OR REPLACE INTO indigenous_voice_assets (
            id, language, category, text_indigenous, phonetic_ipa,
            english_translation, persona_id, cultural_context, tone_sequence_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            item["id"],
            item["language"],
            item["category"],
            item["text_indigenous"],
            item.get("phonetic_ipa", ""),
            item["english_translation"],
            item["persona_id"],
            item.get("cultural_context", ""),
            json.dumps(item.get("tone_sequence", []))
        ))
        count += 1
        
    conn.commit()
    conn.close()
    print(f"Successfully migrated indigenous_voice_assets table and seeded {count} master assets!")

if __name__ == "__main__":
    run_migration()
