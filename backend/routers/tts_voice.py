"""
FastAPI Router for Authentic Nigerian Voice Synthesis & Indigenous Speech Lab.
Unifies:
1. Nigerian English & Pidgin Neural Voices (Uncle Emeka, Auntie Bola, Broda Wazobia)
2. Indigenous Nigerian Tonal Voices (Bàbá Àgbà, Àǹtí Bọ́lá, Nna Anyị, Nneoma, Malam Danladi, Gwaggo Hadiza)
3. Warri & Edo / Delta Pidgin Personas (Bros Oghene & Queen Esosa)
4. Automatic Diacritic & Tone Restoration (ADR) Engine
5. Golden Audio Vault phrasebook and real-time Do-Re-Mi tonal pitch analysis.
"""

import logging
from fastapi import APIRouter, Query, Response, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from backend.services.nigerian_tts_service import tts_service, VOICE_PROFILES
from backend.services.indigenous_tts_service import (
    indigenous_tts_service,
    INDIGENOUS_PERSONAS,
    extract_yoruba_tones,
    normalize_indigenous_text,
    restore_indigenous_diacritics
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tts", tags=["Authentic Nigerian Voice & Indigenous Speech Lab"])

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Text to synthesize")
    persona: str = Field("uncle_emeka", description="Target voice persona key")
    speed: Optional[str] = Field("normal", description="'slow', 'normal', or 'brisk'")
    language: Optional[str] = Field("english", description="'english', 'pidgin', 'yoruba', 'igbo', 'hausa', 'warri_pidgin', or 'edo_pidgin'")

class DiacriticRestorationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Text to restore diacritics for")
    language: str = Field("yoruba", description="'yoruba', 'igbo', 'hausa', 'warri_pidgin', or 'edo_pidgin'")

@router.get("/personas")
def get_voice_personas():
    """Returns all available authentic Nigerian voice personas categorized by language and gender."""
    all_personas = {}
    
    # English & General Pidgin personas
    for k, v in VOICE_PROFILES.items():
        all_personas[k] = {
            "id": k,
            "name": v["name"],
            "gender": v["gender"],
            "language": v.get("language", "English"),
            "title": v["title"],
            "description": v["description"],
            "type": "Neural Edge Voice"
        }
        
    # Indigenous Personas (Yorùbá, Igbo, Hausa, Warri / Edo Pidgin)
    for k, v in INDIGENOUS_PERSONAS.items():
        all_personas[k] = {
            "id": k,
            "name": v["name"],
            "gender": v["gender"],
            "language": v["language"],
            "title": v["archetype"],
            "description": v["description"],
            "type": "Indigenous Tonal Engine",
            "accent": v["accent"],
            "pitch_tier": v["pitch_tier"],
            "signature_greeting": v["signature_greeting"]
        }
        
    return {
        "status": "success",
        "default": "uncle_emeka",
        "total_personas": len(all_personas),
        "personas": all_personas
    }

@router.get("/languages")
def get_supported_languages():
    """Returns rich linguistic meta for Yorùbá, Igbo, Hausa, and Warri/Edo Pidgin."""
    return {
        "status": "success",
        "total_languages": 5,
        "languages": [
            {
                "id": "yoruba",
                "name": "Yorùbá",
                "flag": "🟢",
                "type": "Tonal Language (3 Register Levels: Dò, Re, Mí)",
                "orthography": "25 letters with under-dots (ẹ, ọ, ṣ) and combining tone marks (◌̀, ◌́)",
                "personas": ["baba_agba", "anti_bola_yoruba"],
                "sample": "Ẹ kú àárọ̀ o, gbogbo ilé!"
            },
            {
                "id": "igbo",
                "name": "Igbo",
                "flag": "🔴",
                "type": "Tonal with Advanced Tongue Root (ATR) Vowel Harmony",
                "orthography": "36 letters with under-dots (ị, ọ, ụ, ṅ), digraphs (kp, gb, nw, ny), and downstep terrace",
                "personas": ["nna_anyi", "nneoma"],
                "sample": "Ụtụtụ ọma nụ o! Kedu ka unu mere taa?"
            },
            {
                "id": "hausa",
                "name": "Hausa",
                "flag": "🟡",
                "type": "Tonal (High, Low, Falling) with Contrastive Vowel Duration",
                "orthography": "Boko script with hooked implosives/ejectives (ɓ, ɗ, ƙ, 'y, ts)",
                "personas": ["malam_danladi", "gwaggo_hadiza"],
                "sample": "Ina kwana? Fatan kowa yana lafiya ƙalau."
            },
            {
                "id": "warri_pidgin",
                "name": "Warri / Delta Pidgin",
                "flag": "⚓",
                "type": "Creolized Syllable-Timed Dialect with Emphatic Terminal Rise",
                "orthography": "Delta Creolized English with Urhobo/Itsekiri/Edo substrate particles (nor, dey, abeg, wetin, kpatakpata)",
                "personas": ["warri_bros_oghene"],
                "sample": "Warri no dey carry last! My area broda, shine your eye well-well!"
            },
            {
                "id": "edo_pidgin",
                "name": "Edo / Benin Pidgin",
                "flag": "👑",
                "type": "Ancient Kingdom Scholastic Creole with Melodious Cadence",
                "orthography": "Benin City Pidgin with Edo royal honorifics (Kọyo, Oba gha tọ́ kpere)",
                "personas": ["edo_queen_esosa"],
                "sample": "Kọyo o, ègbe nọ́khuā! How family and reading dey move today?"
            }
        ]
    }

@router.post("/restore-diacritics")
def restore_diacritics_endpoint(req: DiacriticRestorationRequest):
    """
    Automatic Diacritic & Tone Restoration (ADR) Engine.
    Takes plain unaccented text in Yorùbá, Igbo, Hausa, or Warri/Edo Pidgin,
    and returns canonical tone marks, sub-dots, IPA transcription, and English gloss.
    """
    return indigenous_tts_service.restore_diacritics(text=req.text, language=req.language)

@router.get("/audio")
async def stream_audio_get(
    text: str = Query(..., min_length=1, max_length=2000, description="Text to narrate"),
    persona: str = Query("uncle_emeka", description="Persona identifier"),
    speed: str = Query("normal", description="'slow', 'normal', or 'brisk'"),
    language: str = Query("english", description="'english', 'pidgin', 'yoruba', 'igbo', 'hausa', 'warri_pidgin', or 'edo_pidgin'")
):
    """
    Direct audio streaming endpoint for browser <audio> and HTML5 Audio objects.
    Intelligently routes between Edge-TTS (English/Pidgin) and Indigenous Tonal Synthesizer (Yorùbá/Igbo/Hausa/Warri/Edo).
    """
    clean_persona = persona.lower().strip()
    norm_text = normalize_indigenous_text(text)
    
    try:
        eff_lang = language.lower()
        if clean_persona in ["baba_agba", "anti_bola_yoruba"]:
            eff_lang = "yoruba"
        elif clean_persona in ["nna_anyi", "nneoma"]:
            eff_lang = "igbo"
        elif clean_persona in ["malam_danladi", "gwaggo_hadiza"]:
            eff_lang = "hausa"
        elif clean_persona == "warri_bros_oghene":
            eff_lang = "warri_pidgin"
        elif clean_persona == "edo_queen_esosa":
            eff_lang = "edo_pidgin"
        elif clean_persona == "wazobia_broda":
            eff_lang = "pidgin"

        if clean_persona in VOICE_PROFILES:
            effective_persona = clean_persona
            audio_bytes, media_type = await tts_service.synthesize_speech(
                text=norm_text,
                persona=effective_persona,
                speed=speed,
                language=eff_lang
            )
            filename = "speech.mp3"
        elif clean_persona in INDIGENOUS_PERSONAS:
            audio_bytes, media_type = indigenous_tts_service.synthesize_indigenous_speech(
                text=norm_text,
                persona=clean_persona,
                speed=speed
            )
            filename = "speech.wav"
        else:
            effective_persona = "uncle_emeka"
            audio_bytes, media_type = await tts_service.synthesize_speech(
                text=norm_text,
                persona=effective_persona,
                speed=speed,
                language=eff_lang
            )
            filename = "speech.mp3"
            
        return Response(
            content=audio_bytes,
            media_type=media_type,
            headers={
                "Content-Disposition": f"inline; filename={filename}",
                "Cache-Control": "public, max-age=86400",
                "Accept-Ranges": "bytes"
            }
        )
    except Exception as e:
        logger.error(f"Audio stream error: {e}")
        # Graceful fallback to indigenous tonal synthesizer
        try:
            audio_bytes, media_type = indigenous_tts_service.synthesize_indigenous_speech(
                text=norm_text,
                persona="baba_agba",
                speed=speed
            )
            return Response(
                content=audio_bytes,
                media_type=media_type,
                headers={"Content-Disposition": "inline; filename=fallback.wav"}
            )
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e2)}")

@router.post("/speak")
async def stream_audio_post(req: TTSRequest):
    """POST variant for longer passages of text."""
    clean_persona = req.persona.lower().strip()
    norm_text = normalize_indigenous_text(req.text)
    req_lang = (req.language or "english").lower()
    
    try:
        if clean_persona in INDIGENOUS_PERSONAS or req_lang in ["yoruba", "igbo", "hausa", "yorùbá", "warri_pidgin", "edo_pidgin"]:
            effective_persona = clean_persona if clean_persona in INDIGENOUS_PERSONAS else "baba_agba"
            audio_bytes, media_type = indigenous_tts_service.synthesize_indigenous_speech(
                text=norm_text,
                persona=effective_persona,
                speed=req.speed or "normal"
            )
            filename = "speech.wav"
        else:
            effective_persona = clean_persona if clean_persona in VOICE_PROFILES else "uncle_emeka"
            audio_bytes, media_type = await tts_service.synthesize_speech(
                text=norm_text,
                persona=effective_persona,
                speed=req.speed or "normal",
                language=req_lang
            )
            filename = "speech.mp3"
            
        return Response(
            content=audio_bytes,
            media_type=media_type,
            headers={
                "Content-Disposition": f"inline; filename={filename}",
                "Cache-Control": "public, max-age=86400"
            }
        )
    except Exception as e:
        logger.error(f"TTS POST error: {e}")
        raise HTTPException(status_code=500, detail=f"Voice synthesis failed: {str(e)}")

@router.get("/indigenous/phrasebook")
def get_indigenous_phrasebook(
    language: Optional[str] = Query(None, description="Yorùbá, Igbo, Hausa, Warri, Edo, or All"),
    category: Optional[str] = Query(None, description="Category filter")
):
    """Returns curated Golden Audio Vault assets with translations and phonetic guides."""
    vault = indigenous_tts_service.get_golden_vault(language=language, category=category)
    return {
        "status": "success",
        "total_phrases": len(vault),
        "phrases": vault
    }

@router.get("/indigenous/tonal-analysis")
def analyze_tonal_contour(
    text: str = Query(..., min_length=1, max_length=500, description="Word or phrase to analyze")
):
    """
    Performs real-time Do-Re-Mi (High-Mid-Low) tonal analysis on input Yorùbá / Igbo text.
    Returns syllable decomposition and pitch frequency multiplier for visual waveform matching.
    """
    normalized = normalize_indigenous_text(text)
    words = normalized.split()
    analysis = []
    
    for w in words:
        syllables = extract_yoruba_tones(w)
        analysis.append({
            "word": w,
            "syllables": syllables,
            "tones": [s["tone"] for s in syllables],
            "solfege": [s["solfege"] for s in syllables]
        })
        
    return {
        "status": "success",
        "text": normalized,
        "word_count": len(words),
        "analysis": analysis
    }
