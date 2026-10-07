"""
Oral English & Phonetics Audio Examiner Router
Provides JAMB-standard phonetics drills, vowel/consonant discrimination,
rhyme patterns, and emphatic stress exercises.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/oral-english", tags=["Oral English & Phonetics Examiner"])

ORAL_DRILLS = [
    {
        "id": "oe-1",
        "category": "vowels",
        "sub_category": "Short vs Long Vowels",
        "phonetic_symbol": "/i:/ vs /ɪ/",
        "question_text": "Which of the following words contains the long vowel sound /i:/ as in 'FLEET'?",
        "options": [
            {"label": "A", "text": "Sit"},
            {"label": "B", "text": "Ceiling"},
            {"label": "C", "text": "Pretty"},
            {"label": "D", "text": "Women"}
        ],
        "correct_option": "B",
        "ipa_pronunciation": "/ˈsiː.lɪŋ/",
        "audio_phoneme_tip": "The 'ei' in 'ceiling' produces the long /i:/ sound. 'Sit', 'pretty' (/ɪ/), and 'women' (/ɪ/) have short /ɪ/.",
        "exam_year": "JAMB 2024"
    },
    {
        "id": "oe-2",
        "category": "vowels",
        "sub_category": "Diphthongs",
        "phonetic_symbol": "/eɪ/",
        "question_text": "Select the word that contains the same vowel sound as represented in 'GREAT':",
        "options": [
            {"label": "A", "text": "Threat"},
            {"label": "B", "text": "Break"},
            {"label": "C", "text": "Bread"},
            {"label": "D", "text": "Beast"}
        ],
        "correct_option": "B",
        "ipa_pronunciation": "/breɪk/",
        "audio_phoneme_tip": "'Great' and 'break' both contain the closing diphthong /eɪ/. 'Threat' and 'bread' have /e/, while 'beast' has /i:/.",
        "exam_year": "JAMB 2023"
    },
    {
        "id": "oe-3",
        "category": "consonants",
        "sub_category": "Silent Letters",
        "phonetic_symbol": "Silent 'b'",
        "question_text": "In which of the following words is the letter 'b' completely SILENT?",
        "options": [
            {"label": "A", "text": "Subtle"},
            {"label": "B", "text": "Thimble"},
            {"label": "C", "text": "Number"},
            {"label": "D", "text": "Member"}
        ],
        "correct_option": "A",
        "ipa_pronunciation": "/ˈsʌt.əl/",
        "audio_phoneme_tip": "In 'subtle', 'debt', and 'doubt', the 'b' is completely silent. It is pronounced /ˈsʌt.əl/.",
        "exam_year": "JAMB 2024"
    },
    {
        "id": "oe-4",
        "category": "consonants",
        "sub_category": "Dental Fricatives",
        "phonetic_symbol": "/θ/ vs /ð/",
        "question_text": "Identify the word that contains the VOICED dental fricative /ð/ as in 'FATHER':",
        "options": [
            {"label": "A", "text": "Cloth"},
            {"label": "B", "text": "Breathe"},
            {"label": "C", "text": "Wrath"},
            {"label": "D", "text": "Growth"}
        ],
        "correct_option": "B",
        "ipa_pronunciation": "/briːð/",
        "audio_phoneme_tip": "'Breathe' (verb) ends with the voiced /ð/ sound. 'Cloth', 'wrath', and 'growth' all end with voiceless /θ/.",
        "exam_year": "JAMB 2022"
    },
    {
        "id": "oe-5",
        "category": "stress",
        "sub_category": "Emphatic Stress",
        "phonetic_symbol": "CAPITALIZED WORD = FOCUS",
        "question_text": "The sentence is: 'CHISOM bought a brand new laptop yesterday.' Which question below does this sentence answer?",
        "options": [
            {"label": "A", "text": "Did Chisom steal a brand new laptop yesterday?"},
            {"label": "B", "text": "Did Chisom buy a brand new phone yesterday?"},
            {"label": "C", "text": "Did Emeka buy a brand new laptop yesterday?"},
            {"label": "D", "text": "When did Chisom buy the brand new laptop?"}
        ],
        "correct_option": "C",
        "ipa_pronunciation": "/ˈtʃiː.sɒm/",
        "audio_phoneme_tip": "When emphatic stress is placed on CHISOM, the sentence refutes that ANYONE ELSE (e.g. Emeka) performed the action.",
        "exam_year": "JAMB 2024"
    },
    {
        "id": "oe-6",
        "category": "stress",
        "sub_category": "Syllable Stress",
        "phonetic_symbol": "Primary Stress (ˈ)",
        "question_text": "Which syllable receives the primary stress in the word 'PHOTOGRAPHY'?",
        "options": [
            {"label": "A", "text": "PHO-to-gra-phy (1st syllable)"},
            {"label": "B", "text": "pho-TO-gra-phy (2nd syllable)"},
            {"label": "C", "text": "pho-to-GRA-phy (3rd syllable)"},
            {"label": "D", "text": "pho-to-gra-PHY (4th syllable)"}
        ],
        "correct_option": "B",
        "ipa_pronunciation": "/fəˈtɒɡ.rə.fi/",
        "audio_phoneme_tip": "Words ending in '-graphy' shift primary stress to the antepenultimate syllable (2nd syllable): pho-TO-graphy.",
        "exam_year": "JAMB 2023"
    },
    {
        "id": "oe-7",
        "category": "rhymes",
        "sub_category": "Rhyme Identification",
        "phonetic_symbol": "Exact Phonetic Rhyme",
        "question_text": "Which of the following words RHYMES with 'SUITE'?",
        "options": [
            {"label": "A", "text": "Suit"},
            {"label": "B", "text": "Sweet"},
            {"label": "C", "text": "Sweat"},
            {"label": "D", "text": "Shoot"}
        ],
        "correct_option": "B",
        "ipa_pronunciation": "/swiːt/",
        "audio_phoneme_tip": "'Suite' (a set of rooms) is pronounced exactly as /swiːt/, rhyming perfectly with 'sweet', NOT 'suit' (/suːt/).",
        "exam_year": "JAMB 2024"
    },
    {
        "id": "oe-8",
        "category": "consonants",
        "sub_category": "Silent Letters",
        "phonetic_symbol": "Silent 'p'",
        "question_text": "In which word is the initial letter 'p' silent?",
        "options": [
            {"label": "A", "text": "Psalm"},
            {"label": "B", "text": "Prism"},
            {"label": "C", "text": "Pulpit"},
            {"label": "D", "text": "Plumber"}
        ],
        "correct_option": "A",
        "ipa_pronunciation": "/sɑːm/",
        "audio_phoneme_tip": "Words beginning with 'ps-' such as 'psalm', 'pseudonym', and 'psychology' have a silent 'p' and start with /s/.",
        "exam_year": "JAMB 2023"
    }
]

@router.get("/drills")
def get_oral_drills(
    category: Optional[str] = Query(None, description="'vowels', 'consonants', 'stress', 'rhymes'"),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Retrieve curated JAMB Oral English drills with phonetic keys, tips, and stress guides.
    """
    drills = ORAL_DRILLS
    if category:
        drills = [d for d in drills if d["category"] == category.lower()]
    
    return {
        "count": len(drills[:limit]),
        "category": category or "all",
        "drills": drills[:limit],
        "audio_engine": "Web Speech Synthesis API + International Phonetic Alphabet (IPA)"
    }
