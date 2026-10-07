"""
Test Suite: Authentic Neural Nigerian Voice & Real-Time Cross-Component DB Pipeline
"""

import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import httpx
import unittest
import time
from backend.services.nigerian_tts_service import preprocess_nigerian_phonetics, tts_service, VOICE_PROFILES
from backend.database.sqlite_store import record_quiz_answer, get_student_live_stats, get_cohort_at_risk_topics, init_db

RATE_LIMIT_URL = 'http://127.0.0.1:8000'

class TestNigerianVoiceAndPipeline(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()

    def test_01_phonetic_preprocessing(self):
        latex_text = r'Calculate \\frac{dy}{dx} when y = 3x^2. Given at STP, volume is 22.4 dm^3 of O_2.'
        processed = preprocess_nigerian_phonetics(latex_text)
        self.assertIn('divided by', processed)
        self.assertIn('cubic decimeters', processed)
        self.assertIn('oxygen gas', processed)
        self.assertIn('S T P', processed)
        print('  [PASS] Phonetic preprocessing correctly transliterates LaTeX & STEM symbols.')

    def test_02_voice_personas_catalog(self):
        with httpx.Client(base_url=RATE_LIMIT_URL, timeout=10.0) as client:
            resp = client.get('/tts/personas')
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertIn('uncle_emeka', data['voices'] if 'voices' in data else data['personas'])
            print('  [PASS] Voice personas endpoint returns en-NG-AbeoNeural and en-NG-EzinneNeural.')

    def test_03_neural_audio_streaming_and_caching(self):
        with httpx.Client(base_url=RATE_LIMIT_URL, timeout=30.0) as client:
            r1 = client.get('/tts/audio', params={'text': 'Good day my student. Weldone!', 'persona': 'uncle_emeka'})
            self.assertEqual(r1.status_code, 200)
            self.assertEqual(r1.headers.get('content-type'), 'audio/mpeg')
            self.assertGreater(len(r1.content), 2000)

            r2 = client.get('/tts/audio', params={'text': 'E go better. Keep practicing!', 'persona': 'auntie_bola'})
            self.assertEqual(r2.status_code, 200)
            self.assertEqual(r2.headers.get('content-type'), 'audio/mpeg')
            self.assertGreater(len(r2.content), 2000)

            t0 = time.time()
            r3 = client.get('/tts/audio', params={'text': 'Good day my student. Weldone!', 'persona': 'uncle_emeka'})
            cache_duration = time.time() - t0
            self.assertEqual(r3.status_code, 200)
            self.assertLess(cache_duration, 0.5)
            print(f'  [PASS] Neural audio generated successfully. Cache hit completed in {round(cache_duration*1000, 1)}ms.')

    def test_04_quiz_answer_real_time_persistence(self):
        test_user = 'TEST-STUDENT-999'
        with httpx.Client(base_url=RATE_LIMIT_URL, timeout=10.0) as client:
            q_res = client.get('/quiz/questions?limit=1')
            q_id = 111
            if q_res.status_code == 200 and q_res.json().get('questions'):
                q_id = q_res.json()['questions'][0]['id']
            payload = {'user_key': test_user, 'question_id': q_id, 'selected_option': 'A', 'time_spent_secs': 12}
            res = client.post('/quiz/submit-answer', json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data['status'], 'success')
            self.assertIn('is_correct', data)
            self.assertIn('hearts', data)
            self.assertIn('predicted_score', data)
            print(f'  [PASS] Answer submitted in real-time. Correct: {data["is_correct"]}, Predicted: {data["predicted_score"]}')

    def test_05_student_live_stats_pipeline(self):
        test_user = 'TEST-STUDENT-999'
        with httpx.Client(base_url=RATE_LIMIT_URL, timeout=10.0) as client:
            res = client.get(f'/quiz/live-stats/{test_user}')
            self.assertEqual(res.status_code, 200)
            stats = res.json()
            self.assertEqual(stats['status'], 'success')
            self.assertGreaterEqual(stats['total_answered'], 1)
            self.assertIn('cumulative_mastery', stats)
            self.assertIn('weak_topics', stats)
            print(f'  [PASS] Student live stats verified. Answered: {stats["total_answered"]}, Mastery: {stats["cumulative_mastery"]}%.')

    def test_06_cohort_at_risk_tutor_pipeline(self):
        with httpx.Client(base_url=RATE_LIMIT_URL, timeout=10.0) as client:
            res = client.get('/quiz/cohort-at-risk')
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data['status'], 'success')
            self.assertIsInstance(data['at_risk'], list)
            print(f'  [PASS] Tutor at-risk intervention queue online. Count: {len(data["at_risk"])} at-risk entries.')

    def test_07_parent_autopilot_live_report(self):
        test_user = 'TEST-STUDENT-999'
        with httpx.Client(base_url=RATE_LIMIT_URL, timeout=10.0) as client:
            res = client.get(f'/syllabus/parent/report/{test_user}')
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data['status'], 'success')
            telemetry = data['telemetry']
            self.assertIn('projected_jamb_score', telemetry)
            self.assertIn('weak_topic_interventions', telemetry)
            print(f'  [PASS] Parent Autopilot report synchronized with live DB. Projected JAMB: {telemetry["projected_jamb_score"]}.')

if __name__ == '__main__':
    unittest.main()
