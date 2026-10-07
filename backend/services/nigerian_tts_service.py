"""
OmniLearn Sovereign Autopilot: Neural Nigerian Voice Synthesis Service.
Generates authentic Nigerian English and Naija Pidgin speech using Microsoft Edge Neural Voice models:
- en-NG-AbeoNeural (Male: 'Uncle Emeka' - authoritative, warm West African pedagogical cadence)
- en-NG-EzinneNeural (Female: 'Auntie Bola' - melodic, clear, encouraging West African cadence)
Features two-tier in-memory and persistent disk caching for 0ms latency audio retrieval.
"""

import io
import re
import os
import hashlib
import logging
from typing import Optional, Tuple
import edge_tts

logger = logging.getLogger(__name__)

# Persistent Disk Cache Directory
CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "audio_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# Official Microsoft Edge Neural Nigerian English Voice Models & Indigenous Profiles
VOICE_PROFILES = {
    "uncle_emeka": {
        "model": "en-NG-AbeoNeural",
        "name": "Uncle Emeka",
        "gender": "Male",
        "language": "English",
        "title": "Senior STEM Mentor & Diagnostic Master",
        "description": "Deep, reassuring, authoritative Nigerian pedagogical cadence.",
        "pitch": "-2Hz",
        "rate": "+0%"
    },
    "auntie_bola": {
        "model": "en-NG-EzinneNeural",
        "name": "Auntie Bola",
        "gender": "Female",
        "language": "English",
        "title": "Children's Wonder Lab & Oral English Guide",
        "description": "Melodic, encouraging, high phonetic clarity for West African students.",
        "pitch": "+2Hz",
        "rate": "-3%"
    },
    "wazobia_broda": {
        "model": "en-NG-AbeoNeural",
        "name": "Broda Wazobia",
        "gender": "Male",
        "language": "Nigerian Pidgin",
        "title": "Street-Smart Naija Scholar & Youth Host",
        "description": "High-energy, punchy, authentic Nigerian Pidgin cadence with vibrant street-smart pedagogy.",
        "pitch": "+3Hz",
        "rate": "+4%"
    },
    "baba_agba": {
        "model": "en-NG-AbeoNeural",
        "name": "Bàbá Àgbà",
        "gender": "Male",
        "language": "Yorùbá",
        "title": "Wise Elder & Yoruba Folklore Master",
        "description": "Deep, gravelly baritone with dignified pacing, traditional proverbs and dramatic micro-pauses.",
        "pitch": "-4Hz",
        "rate": "-5%"
    },
    "anti_bola_yoruba": {
        "model": "en-NG-EzinneNeural",
        "name": "Àǹtí Bọ́lá",
        "gender": "Female",
        "language": "Yorùbá",
        "title": "Warm Maternal Storyteller",
        "description": "Melodic, encouraging Yoruba storyteller with joyful honorifics.",
        "pitch": "+2Hz",
        "rate": "-3%"
    },
    "nna_anyi": {
        "model": "en-NG-AbeoNeural",
        "name": "Nna Anyị",
        "gender": "Male",
        "language": "Igbo",
        "title": "Respected Clan Patriarch",
        "description": "Authoritative, dignified bass-baritone with solemn, rhythmic Igbo cadence and cultural gravity.",
        "pitch": "-5Hz",
        "rate": "-4%"
    },
    "nneoma": {
        "model": "en-NG-EzinneNeural",
        "name": "Nneoma",
        "gender": "Female",
        "language": "Igbo",
        "title": "Nurturing Academic Mentor",
        "description": "Lyrical, warm alto with soothing pedagogical cadence.",
        "pitch": "+1Hz",
        "rate": "-3%"
    },
    "malam_danladi": {
        "model": "en-NG-AbeoNeural",
        "name": "Malam Danladi",
        "gender": "Male",
        "language": "Hausa",
        "title": "Revered Scholar & Historian",
        "description": "Articulate, measured baritone with sharp consonant articulation and authentic Northern cadence.",
        "pitch": "-2Hz",
        "rate": "-2%"
    },
    "warri_bros_oghene": {
        "model": "en-NG-AbeoNeural",
        "name": "Bros Oghene",
        "gender": "Male",
        "language": "Warri / Delta Pidgin",
        "title": "Waffi Street Scholar & Arena Pioneer",
        "description": "Punchy, charismatic Delta baritone with sharp syllable-timed rhythm, authentic Warri creole idioms, and infectious momentum.",
        "pitch": "+4Hz",
        "rate": "+6%"
    },
    "edo_queen_esosa": {
        "model": "en-NG-EzinneNeural",
        "name": "Queen Esosa",
        "gender": "Female",
        "language": "Edo / Benin Pidgin",
        "title": "Scholastic Benin Ambassador",
        "description": "Warm, melodious Edo cadence with dignified Benin Kingdom expressions, clear phonetic articulation, and supportive maternal warmth.",
        "pitch": "+1Hz",
        "rate": "-2%"
    }
}

# High-velocity in-memory cache
AUDIO_CACHE = {}
MAX_IN_MEMORY_ENTRIES = 300

def preprocess_for_nigerian_speech(text: str, language: str = "english") -> str:
    """
    Phonetically adapts LaTeX formulas, scientific notation, exam acronyms,
    and Naija Pidgin expressions for natural neural voice delivery.
    """
    clean = text.strip()
    
    # Specific physical and chemical units
    clean = re.sub(r"dm\^?3|dm³", "cubic decimeters", clean, flags=re.IGNORECASE)
    clean = re.sub(r"cm\^?3|cm³", "cubic centimeters", clean, flags=re.IGNORECASE)
    clean = re.sub(r"m\/s\^?2|m\/s²", "meters per second squared", clean, flags=re.IGNORECASE)
    clean = re.sub(r"m\/s", "meters per second", clean, flags=re.IGNORECASE)
    clean = re.sub(r"O_?2|O₂", "oxygen gas", clean)
    clean = re.sub(r"H_?2O|H₂O", "water molecule", clean)
    clean = re.sub(r"CO_?2|CO₂", "carbon dioxide", clean)
    clean = re.sub(r"H_?2SO_?4|H₂SO₄", "sulfuric acid", clean)

    # Mathematical fractions and generic powers
    clean = re.sub(r"\\frac\{([^}]+)\}\{([^}]+)\}", r"\1 divided by \2", clean)
    clean = re.sub(r"(\w+)\^2", r"\1 squared", clean)
    clean = re.sub(r"(\w+)\^3", r"\1 cubed", clean)
    clean = re.sub(r"\\times|\*", " times ", clean)
    clean = re.sub(r"\\pm", " plus or minus ", clean)
    clean = re.sub(r"\\approx", " approximately equal to ", clean)
    clean = re.sub(r"\\le|\\leq", " is less than or equal to ", clean)
    clean = re.sub(r"\\ge|\\geq", " is greater than or equal to ", clean)
    clean = re.sub(r"\\neq", " is not equal to ", clean)
    clean = re.sub(r"\+", " plus ", clean)
    clean = re.sub(r"=", " equals ", clean)
    
    # Nigerian Exam & Statutory Acronyms
    clean = re.sub(r"\bSTP\b", "S T P", clean)
    clean = re.sub(r"\bRTP\b", "R T P", clean)
    clean = re.sub(r"\bJAMB\b", "Jamb", clean)
    clean = re.sub(r"\bWAEC\b", "Waec", clean)
    clean = re.sub(r"\bNECO\b", "Neco", clean)
    clean = re.sub(r"\bUTME\b", "U T M E", clean)
    clean = re.sub(r"\bUNILAG\b", "Uni-lag", clean)
    clean = re.sub(r"\bNERDC\b", "N E R D C", clean)
    clean = re.sub(r"\bCBT\b", "C B T", clean)
    clean = re.sub(r"₦(\d+(?:,\d+)?)", r"\1 Naira", clean)
    
    # Pidgin phonetic cadence smoothing & authentic stress markings
    if language.lower() in ["pidgin", "nigerian pidgin"]:
        pidgin_replacements = [
            (r"\bsabi\b", "sah-bee"),
            (r"\bwetin\b", "weh-tin"),
            (r"\babeg\b", "ah-beg"),
            (r"\bwahala\b", "wah-hah-lah"),
            (r"\bkpatakpata\b", "kpah-tah-kpah-tah"),
            (r"\bpalava\b", "pah-lah-vah"),
            (r"\bdey\b", "deh"),
            (r"\bsef\b", "seh-f"),
            (r"\bsha\b", "shah"),
            (r"\boya\b", "oh-yah"),
            (r"\buna\b", "oo-nah"),
            (r"\bjara\b", "jah-rah"),
            (r"\bkuku\b", "koo-koo"),
            (r"\bgbege\b", "gbeh-geh"),
            (r"\byawa\b", "yah-wah"),
            (r"\bcomot\b", "koh-mot"),
            (r"\bchook\b", "chook"),
            (r"\bdash\b", "dah-sh"),
            (r"\bfashi\b", "fah-shee"),
            (r"\bno be lie\b", "noh bee lye"),
            (r"\bna so\b", "nah soh"),
            (r"\bmake we\b", "mayk wee"),
            (r"\bginger\b", "jeen-jah"),
            (r"\boversabi\b", "oh-vah-sah-bee"),
            (r"\bwaka\b", "wah-kah"),
            (r"\bpikin\b", "pee-kin"),
            (r"\bkorokoro\b", "koh-roh-koh-roh"),
            (r"\bshikena\b", "shee-keh-nah"),
            (r"\bwetin dey happen\b", "weh-tin deh hah-pen"),
            (r"\bcarry go\b", "kah-ree goh"),
            (r"\bgbedu\b", "gbeh-doo"),
            (r"\bjapa\b", "jah-pah"),
            (r"\bsharp sharp\b", "shah-p shah-p"),
            (r"\btor\b", "toh-r"),
            (r"\bwetin dey sup\b", "weh-teen day suhp"),
            (r"\bcarry last\b", "kah-ree lahst"),
            (r"\bwarri\b", "wah-ree"),
            (r"\barea broda\b", "eh-ree-ah braw-dah"),
            (r"\bkpatakpata\b", "kpah-tah-kpah-tah"),
            (r"\bkpoko\b", "kpoh-koh"),
            (r"\bkọyo\b", "kaw-yaw"),
            (r"\bkoyo\b", "kaw-yaw"),
            (r"\boba gha tọ́ kpere\b", "aw-bah gah taw kpeh-reh"),
            (r"\bìsẹ́\b", "ee-seh"),
            (r"\bmẹ n’ọmọ\b", "meh naw-maw"),
            (r"\bshuo\b", "shoo-oh"),
            (r"\bnor\b", "noh"),
            (r",\s*abi\?", ", ah-bee?"),
            (r",\s*no be so\?", ", noh bee soh?"),
            (r",\s*shey you hear\?", ", shay yoo heeah?"),
        ]
        for pattern, repl in pidgin_replacements:
            clean = re.sub(pattern, repl, clean, flags=re.IGNORECASE)
    
    # Indigenous & Pidgin Enterprise G2P Transformation
    # Converts any spelling (seen or unseen) into pure unambiguous phonemes so Edge Neural Voice never mispronounces
    if language.lower() in ["yoruba", "yorùbá", "igbo", "hausa", "warri_pidgin", "edo_pidgin"]:
        try:
            from backend.services.indigenous_tts_service import word_to_phonetic_respelling
            tokens = clean.split()
            processed_tokens = [word_to_phonetic_respelling(tok, language=language) for tok in tokens]
            clean = " ".join(processed_tokens)
        except Exception as e:
            logger.warning(f"Enterprise G2P fallback error: {e}")

    # Remove markdown code formatting
    clean = re.sub(r"```[a-z]*", "", clean)
    clean = re.sub(r"[*_`#]", "", clean)
    
    return clean.strip()

preprocess_nigerian_phonetics = preprocess_for_nigerian_speech

class NigerianTTSService:
    @staticmethod
    async def synthesize_speech(
        text: str,
        persona: str = "uncle_emeka",
        speed: str = "normal",
        language: str = "english"
    ) -> Tuple[bytes, str]:
        """
        Synthesizes text into high-fidelity neural Nigerian speech.
        Returns: (audio_bytes, mime_type)
        Features zero delay via two-tier memory & disk caching.
        """
        persona_key = persona.lower()
        if persona_key not in VOICE_PROFILES:
            persona_key = "uncle_emeka"
            
        profile = VOICE_PROFILES[persona_key]
        voice_model = profile["model"]
        
        spoken_text = preprocess_for_nigerian_speech(text, language=language)
        
        # Calculate speed rate modification
        rate_mod = profile["rate"]
        if speed == "slow":
            rate_mod = "-12%"
        elif speed == "brisk":
            rate_mod = "+12%"
            
        # Check Memory & Disk Cache
        cache_key = hashlib.md5(f"{voice_model}_{rate_mod}_{language}_{spoken_text}".encode("utf-8")).hexdigest()
        
        # 1. Memory Cache
        if cache_key in AUDIO_CACHE:
            logger.debug(f"TTS Memory Cache hit: {cache_key}")
            return AUDIO_CACHE[cache_key], "audio/mpeg"

        # 2. Disk Cache
        disk_path = os.path.join(CACHE_DIR, f"{cache_key}.mp3")
        if os.path.exists(disk_path):
            try:
                with open(disk_path, "rb") as f:
                    audio_bytes = f.read()
                AUDIO_CACHE[cache_key] = audio_bytes
                logger.debug(f"TTS Disk Cache hit: {cache_key}")
                return audio_bytes, "audio/mpeg"
            except Exception as e:
                logger.warning(f"Error reading disk cache: {e}")
            
        # 3. Synthesize via Microsoft Edge Neural Model
        try:
            communicate = edge_tts.Communicate(
                text=spoken_text,
                voice=voice_model,
                rate=rate_mod,
                pitch=profile["pitch"]
            )
            
            audio_stream = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_stream.write(chunk["data"])
                    
            audio_bytes = audio_stream.getvalue()

            # Save to memory and disk cache for instant future retrieval
            if len(AUDIO_CACHE) < MAX_IN_MEMORY_ENTRIES:
                AUDIO_CACHE[cache_key] = audio_bytes

            try:
                with open(disk_path, "wb") as f:
                    f.write(audio_bytes)
            except Exception as e:
                logger.warning(f"Error saving to disk cache: {e}")
                
            return audio_bytes, "audio/mpeg"
        except Exception as e:
            logger.error(f"Edge-TTS synthesis error: {e}")
            # If disk cache has any audio for fallback, or return error
            raise e

tts_service = NigerianTTSService()
