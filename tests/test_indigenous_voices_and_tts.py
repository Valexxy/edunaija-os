import unittest
import json
import urllib.request
import urllib.parse
from backend.services.indigenous_tts_service import (
    normalize_indigenous_text,
    extract_yoruba_tones,
    indigenous_tts_service,
    INDIGENOUS_PERSONAS,
    GOLDEN_AUDIO_VAULT
)
from backend.services.nigerian_tts_service import (
    preprocess_for_nigerian_speech,
    VOICE_PROFILES
)
from backend.database.sqlite_store import get_indigenous_voice_assets

BASE_URL = "http://127.0.0.1:8000"

class TestIndigenousVoicesAndTTS(unittest.TestCase):

    def test_unicode_nfc_normalization(self):
        """Verify that Unicode NFC normalization prevents stripping of African tone diacritics and underdots."""
        text = "ọ̀kọ́ àti ẹgbẹ́"
        normalized = normalize_indigenous_text(text)
        self.assertEqual(normalized, text)
        self.assertIn("ọ̀", normalized)
        self.assertIn("kọ́", normalized)
        self.assertIn("ẹgbẹ́", normalized)

    def test_yoruba_tone_extraction(self):
        """Verify that Do-Re-Mi tone extraction correctly identifies High, Mid, and Low tones."""
        # ọ̀kọ́ has Low on first syllable (ọ̀) and High on second (kọ́)
        syllables = extract_yoruba_tones("ọ̀kọ́")
        self.assertGreaterEqual(len(syllables), 2)
        tones = [s["tone"] for s in syllables]
        self.assertIn("LOW", tones)
        self.assertIn("HIGH", tones)
        solfege = [s["solfege"] for s in syllables]
        self.assertIn("Dò", solfege)
        self.assertIn("Mí", solfege)

    def test_pidgin_phonetic_enhancements(self):
        """Verify fine-tuned Pidgin phonetic replacements in Nigerian English & Pidgin engine."""
        raw_text = "Oya make we sabi wetin dey happen, no be lie"
        processed = preprocess_for_nigerian_speech(raw_text, language="pidgin")
        self.assertIn("oh-yah", processed)
        self.assertIn("sah-bee", processed)
        self.assertIn("weh-tin", processed)
        self.assertIn("deh", processed)
        self.assertIn("noh bee lye", processed)

    def test_voice_profiles_complete(self):
        """Verify all personas are defined across English, Pidgin, and Indigenous languages."""
        self.assertIn("uncle_emeka", VOICE_PROFILES)
        self.assertIn("auntie_bola", VOICE_PROFILES)
        self.assertIn("wazobia_broda", VOICE_PROFILES)
        
        self.assertIn("baba_agba", INDIGENOUS_PERSONAS)
        self.assertIn("anti_bola_yoruba", INDIGENOUS_PERSONAS)
        self.assertIn("nna_anyi", INDIGENOUS_PERSONAS)
        self.assertIn("nneoma", INDIGENOUS_PERSONAS)
        self.assertIn("malam_danladi", INDIGENOUS_PERSONAS)
        self.assertIn("gwaggo_hadiza", INDIGENOUS_PERSONAS)

    def test_direct_db_indigenous_voice_assets(self):
        """Verify database persistence of Golden Audio Vault assets."""
        assets = get_indigenous_voice_assets()
        self.assertGreaterEqual(len(assets), 10)
        languages = {a["language"] for a in assets}
        self.assertIn("Yorùbá", languages)
        self.assertIn("Igbo", languages)
        self.assertIn("Hausa", languages)
        
        proverbs = get_indigenous_voice_assets(category="Proverbs (Òwe)")
        self.assertGreaterEqual(len(proverbs), 1)

    def test_api_personas_endpoint(self):
        """Verify GET /tts/personas returns unified personas with metadata."""
        url = f"{BASE_URL}/tts/personas"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read().decode())
            self.assertEqual(data.get("status"), "success")
            self.assertGreaterEqual(data.get("total_personas", 0), 9)
            personas = data.get("personas", {})
            self.assertIn("baba_agba", personas)
            self.assertIn("wazobia_broda", personas)
            self.assertIn("nna_anyi", personas)
            self.assertIn("malam_danladi", personas)

    def test_api_phrasebook_endpoint(self):
        """Verify GET /tts/indigenous/phrasebook returns master phrases."""
        lang_encoded = urllib.parse.quote("Yorùbá")
        url = f"{BASE_URL}/tts/indigenous/phrasebook?language={lang_encoded}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read().decode())
            self.assertEqual(data.get("status"), "success")
            self.assertGreaterEqual(data.get("total_phrases", 0), 4)

    def test_api_tonal_analysis_endpoint(self):
        """Verify GET /tts/indigenous/tonal-analysis returns Do-Re-Mi breakdown."""
        encoded = urllib.parse.quote("ẹ kú àárọ̀")
        url = f"{BASE_URL}/tts/indigenous/tonal-analysis?text={encoded}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read().decode())
            self.assertEqual(data.get("status"), "success")
            self.assertGreaterEqual(data.get("word_count", 0), 2)
            self.assertGreaterEqual(len(data.get("analysis", [])), 2)

    def test_api_audio_stream_indigenous_wav(self):
        """Verify GET /tts/audio generates valid audio/wav stream for indigenous persona."""
        encoded = urllib.parse.quote("Ẹ kú àárọ̀ o gbogbo ilé")
        url = f"{BASE_URL}/tts/audio?text={encoded}&persona=baba_agba&language=yoruba"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as response:
            self.assertEqual(response.status, 200)
            self.assertEqual(response.headers.get("Content-Type"), "audio/wav")
            audio_bytes = response.read()
            self.assertGreater(len(audio_bytes), 1000)
            # Verify RIFF WAV magic bytes
            self.assertTrue(audio_bytes.startswith(b'RIFF'))

    def test_api_audio_stream_pidgin_broda(self):
        """Verify GET /tts/audio generates valid audio for Broda Wazobia persona."""
        encoded = urllib.parse.quote("Wetin dey happen, make we sabi this math")
        url = f"{BASE_URL}/tts/audio?text={encoded}&persona=wazobia_broda&language=pidgin"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as response:
            self.assertEqual(response.status, 200)
            self.assertEqual(response.headers.get("Content-Type"), "audio/mpeg")
            audio_bytes = response.read()
            self.assertGreater(len(audio_bytes), 1000)

if __name__ == "__main__":
    unittest.main()
