#!/usr/bin/env python3
"""
EduNaija OS - Standalone Turnkey Offline CBT Server
=====================================================
Designed for Nigerian secondary school labs, WAEC/JAMB CBT training centers,
and remote communities with zero internet or intermittent satellite/cellular connectivity.

Features:
- 100% Zero external pip dependency (Python 3.8+ standard library: http.server, sqlite3, json, hashlib, hmac).
- High-concurrency SQLite WAL (Write-Ahead Logging) storage with atomic transactions.
- Auto-seeds or imports questions from central EduNaija database if available.
- Interactive JAMB/WAEC standard CBT Web UI served directly on local LAN (http://<server-ip>:8080).
- Auto-saves candidate responses question-by-question.
- Supervisor / Invigilator Console with live seat tracking, auto-grading, and statistics.
- Tamper-Evident Sync Bundles signed with HMAC-SHA256 for offloading results via USB flash drive
  or syncing to EduNaija cloud when internet is available.
"""

import sys
import os
import json
import time
import uuid
import hmac
import hashlib
import sqlite3
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime, timezone

# Default configuration
DEFAULT_PORT = 8080
DEFAULT_CENTER_CODE = "CBT-LAG-IKJ-001"
DEFAULT_SECRET_KEY = "edunaija-offline-cbt-secret-key-2026"
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend", "database", "offline_cbt.db")

SAMPLE_QUESTIONS_FALLBACK = [
    {
        "id": "MTH-001",
        "subject": "Mathematics",
        "exam_type": "JAMB",
        "question_text": "If 2^(2x + 1) = 32, find the value of x.",
        "option_a": "1",
        "option_b": "2",
        "option_c": "3",
        "option_d": "4",
        "correct_option": "B",
        "explanation": "32 = 2^5, so 2x + 1 = 5 => 2x = 4 => x = 2."
    },
    {
        "id": "ENG-001",
        "subject": "English Language",
        "exam_type": "JAMB",
        "question_text": "Choose the option nearest in meaning to the italicized word: The speaker gave a *lucid* explanation of the monetary policy.",
        "option_a": "confusing",
        "option_b": "vague",
        "option_c": "clear",
        "option_d": "lengthy",
        "correct_option": "C",
        "explanation": "Lucid means expressed clearly; easy to understand."
    },
    {
        "id": "PHY-001",
        "subject": "Physics",
        "exam_type": "JAMB",
        "question_text": "A car accelerates uniformly from rest at 3 m/s² for 8 seconds. Calculate the total distance covered.",
        "option_a": "48 m",
        "option_b": "96 m",
        "option_c": "192 m",
        "option_d": "24 m",
        "correct_option": "B",
        "explanation": "s = ut + 0.5 * a * t^2. Here u = 0, a = 3, t = 8. s = 0.5 * 3 * 64 = 96 m."
    },
    {
        "id": "CHM-001",
        "subject": "Chemistry",
        "exam_type": "JAMB",
        "question_text": "What is the oxidation state of sulfur in H2SO4?",
        "option_a": "+2",
        "option_b": "+4",
        "option_c": "+6",
        "option_d": "-2",
        "correct_option": "C",
        "explanation": "2(+1) + S + 4(-2) = 0 => 2 + S - 8 = 0 => S = +6."
    },
    {
        "id": "BIO-001",
        "subject": "Biology",
        "exam_type": "JAMB",
        "question_text": "Which organelle is universally known as the powerhouse of the eukaryotic cell?",
        "option_a": "Ribosome",
        "option_b": "Mitochondrion",
        "option_c": "Nucleus",
        "option_d": "Endoplasmic Reticulum",
        "correct_option": "B",
        "explanation": "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions."
    },
    {
        "id": "GOV-001",
        "subject": "Government",
        "exam_type": "JAMB",
        "question_text": "In a parliamentary system of government, who is the head of government?",
        "option_a": "The President",
        "option_b": "The Prime Minister",
        "option_c": "The Chief Justice",
        "option_d": "The Monarch",
        "correct_option": "B",
        "explanation": "In parliamentary democracy, the Prime Minister exercises executive power as head of government."
    },
    {
        "id": "ECO-001",
        "subject": "Economics",
        "exam_type": "JAMB",
        "question_text": "Opportunity cost is best defined as:",
        "option_a": "The total monetary cost of an item",
        "option_b": "The alternative forgone when a choice is made",
        "option_c": "The cost of production plus profit",
        "option_d": "The variable cost per unit",
        "correct_option": "B",
        "explanation": "Opportunity cost represents the benefits an individual misses out on when choosing one alternative over another."
    },
    {
        "id": "LIT-001",
        "subject": "Literature in English",
        "exam_type": "JAMB",
        "question_text": "In Wole Soyinka's 'The Lion and the Jewel', who represents unyielding African tradition?",
        "option_a": "Lakunle",
        "option_b": "Sidi",
        "option_c": "Baroka",
        "option_d": "Sadiku",
        "correct_option": "C",
        "explanation": "Baroka, the Bale of Ilujinle, represents craftiness and steadfast adherence to traditional Yoruba authority."
    }
]


class CBTDatabase:
    """Zero-dependency SQLite manager configured for resilient high-concurrency offline operation."""
    def __init__(self, db_path=None):
        self.db_path = db_path or os.path.abspath(DB_FILE)
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self.init_schema()

    def get_connection(self):
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA synchronous = NORMAL;")
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def init_schema(self):
        with self.get_connection() as conn:
            conn.executescript("""
            CREATE TABLE IF NOT EXISTS cbt_center_info (
                center_code TEXT PRIMARY KEY,
                center_name TEXT NOT NULL,
                state TEXT NOT NULL,
                total_workstations INTEGER DEFAULT 50,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS cbt_offline_questions (
                id TEXT PRIMARY KEY,
                subject TEXT NOT NULL,
                exam_type TEXT NOT NULL,
                question_text TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_option TEXT NOT NULL,
                explanation TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS cbt_candidate_sessions (
                session_id TEXT PRIMARY KEY,
                reg_number TEXT NOT NULL,
                candidate_name TEXT NOT NULL,
                seat_number TEXT NOT NULL,
                subject TEXT NOT NULL,
                total_questions INTEGER DEFAULT 10,
                time_allocated_seconds INTEGER DEFAULT 600,
                time_remaining_seconds INTEGER DEFAULT 600,
                score INTEGER DEFAULT 0,
                percentage REAL DEFAULT 0.0,
                status TEXT CHECK(status IN ('in_progress', 'submitted', 'timed_out')) DEFAULT 'in_progress',
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS cbt_candidate_answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                question_id TEXT NOT NULL,
                chosen_option TEXT,
                is_correct INTEGER DEFAULT 0,
                answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(session_id, question_id),
                FOREIGN KEY(session_id) REFERENCES cbt_candidate_sessions(session_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS cbt_sync_audit (
                sync_id TEXT PRIMARY KEY,
                exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                record_count INTEGER NOT NULL,
                checksum_hmac TEXT NOT NULL,
                status TEXT DEFAULT 'created'
            );
            """)

            cur = conn.cursor()
            cur.execute("SELECT count(*) FROM cbt_center_info WHERE center_code = ?", (DEFAULT_CENTER_CODE,))
            if cur.fetchone()[0] == 0:
                cur.execute("""
                    INSERT INTO cbt_center_info (center_code, center_name, state, total_workstations)
                    VALUES (?, 'EduNaija High-Tech Offline Center 01', 'Lagos', 120)
                """, (DEFAULT_CENTER_CODE,))

            cur.execute("SELECT count(*) FROM cbt_offline_questions")
            if cur.fetchone()[0] == 0:
                self.populate_questions_bank(conn)

    def populate_questions_bank(self, conn):
        edunaija_main = os.path.join(os.path.dirname(self.db_path), "edunaija.db")
        imported_count = 0
        if os.path.exists(edunaija_main):
            try:
                main_conn = sqlite3.connect(edunaija_main)
                main_conn.row_factory = sqlite3.Row
                main_cur = main_conn.cursor()
                main_cur.execute("""
                    SELECT id, subject, exam_type, question_text, option_a, option_b, option_c, option_d, correct_option, explanation
                    FROM questions
                    LIMIT 200
                """)
                rows = main_cur.fetchall()
                for r in rows:
                    conn.execute("""
                        INSERT OR IGNORE INTO cbt_offline_questions
                        (id, subject, exam_type, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        str(r["id"]), r["subject"] or "General", r["exam_type"] or "JAMB",
                        r["question_text"] or "", r["option_a"] or "", r["option_b"] or "",
                        r["option_c"] or "", r["option_d"] or "", r["correct_option"] or "A",
                        r["explanation"] or ""
                    ))
                    imported_count += 1
                main_conn.close()
            except Exception as e:
                pass

        if imported_count == 0:
            for q in SAMPLE_QUESTIONS_FALLBACK:
                conn.execute("""
                    INSERT OR IGNORE INTO cbt_offline_questions
                    (id, subject, exam_type, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    q["id"], q["subject"], q["exam_type"],
                    q["question_text"], q["option_a"], q["option_b"],
                    q["option_c"], q["option_d"], q["correct_option"],
                    q["explanation"]
                ))


class OfflineCBTService:
    """Core logic for candidate exams, marking, and cryptographically verified sync bundles."""
    def __init__(self, db: CBTDatabase, secret_key: str = DEFAULT_SECRET_KEY):
        self.db = db
        self.secret_key = secret_key

    def get_status(self):
        with self.db.get_connection() as conn:
            center = conn.execute("SELECT * FROM cbt_center_info LIMIT 1").fetchone()
            q_count = conn.execute("SELECT count(*) FROM cbt_offline_questions").fetchone()[0]
            session_count = conn.execute("SELECT count(*) FROM cbt_candidate_sessions").fetchone()[0]
            completed_count = conn.execute("SELECT count(*) FROM cbt_candidate_sessions WHERE status IN ('submitted', 'timed_out')").fetchone()[0]
            return {
                "status": "online_offline_standalone",
                "center_code": center["center_code"] if center else DEFAULT_CENTER_CODE,
                "center_name": center["center_name"] if center else "EduNaija CBT Center",
                "workstations": center["total_workstations"] if center else 50,
                "questions_bank_size": q_count,
                "active_sessions": session_count - completed_count,
                "completed_sessions": completed_count,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

    def candidate_login(self, reg_number: str, candidate_name: str, seat_number: str, subject: str = "Mathematics"):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT session_id, status FROM cbt_candidate_sessions
                WHERE reg_number = ? AND subject = ?
                ORDER BY started_at DESC LIMIT 1
            """, (reg_number, subject))
            existing = cur.fetchone()
            if existing and existing["status"] == "in_progress":
                return {"session_id": existing["session_id"], "resumed": True}

            session_id = f"SESS-{uuid.uuid4().hex[:10].upper()}"
            conn.execute("""
                INSERT INTO cbt_candidate_sessions (session_id, reg_number, candidate_name, seat_number, subject)
                VALUES (?, ?, ?, ?, ?)
            """, (session_id, reg_number.strip().upper(), candidate_name.strip(), seat_number.strip().upper(), subject))
            conn.commit()
            return {"session_id": session_id, "resumed": False}

    def get_exam_questions(self, session_id: str, limit: int = 10):
        with self.db.get_connection() as conn:
            sess = conn.execute("SELECT * FROM cbt_candidate_sessions WHERE session_id = ?", (session_id,)).fetchone()
            if not sess:
                return {"error": "Invalid session ID"}

            cur = conn.cursor()
            cur.execute("""
                SELECT id, subject, exam_type, question_text, option_a, option_b, option_c, option_d
                FROM cbt_offline_questions
                WHERE subject = ? OR ? = 'General'
                ORDER BY id ASC
                LIMIT ?
            """, (sess["subject"], sess["subject"], limit))
            questions = [dict(r) for r in cur.fetchall()]

            cur.execute("SELECT question_id, chosen_option FROM cbt_candidate_answers WHERE session_id = ?", (session_id,))
            answers_map = {r["question_id"]: r["chosen_option"] for r in cur.fetchall()}

            for q in questions:
                q["chosen_option"] = answers_map.get(q["id"], None)

            return {
                "session_id": session_id,
                "reg_number": sess["reg_number"],
                "candidate_name": sess["candidate_name"],
                "seat_number": sess["seat_number"],
                "subject": sess["subject"],
                "status": sess["status"],
                "time_remaining_seconds": sess["time_remaining_seconds"],
                "questions": questions
            }

    def save_answer(self, session_id: str, question_id: str, chosen_option: str):
        chosen_option = chosen_option.strip().upper()
        with self.db.get_connection() as conn:
            sess = conn.execute("SELECT status FROM cbt_candidate_sessions WHERE session_id = ?", (session_id,)).fetchone()
            if not sess:
                return {"error": "Session not found"}
            if sess["status"] != "in_progress":
                return {"error": "Exam already submitted or locked"}

            q = conn.execute("SELECT correct_option FROM cbt_offline_questions WHERE id = ?", (question_id,)).fetchone()
            is_correct = 1 if (q and q["correct_option"] == chosen_option) else 0

            conn.execute("""
                INSERT INTO cbt_candidate_answers (session_id, question_id, chosen_option, is_correct, answered_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(session_id, question_id) DO UPDATE SET
                    chosen_option = excluded.chosen_option,
                    is_correct = excluded.is_correct,
                    answered_at = CURRENT_TIMESTAMP
            """, (session_id, question_id, chosen_option, is_correct))
            conn.commit()
            return {"success": True, "saved_option": chosen_option}

    def submit_exam(self, session_id: str, reason: str = "candidate_submitted"):
        with self.db.get_connection() as conn:
            sess = conn.execute("SELECT * FROM cbt_candidate_sessions WHERE session_id = ?", (session_id,)).fetchone()
            if not sess:
                return {"error": "Session not found"}
            if sess["status"] != "in_progress":
                return {
                    "session_id": session_id,
                    "status": sess["status"],
                    "score": sess["score"],
                    "percentage": sess["percentage"],
                    "message": "Already submitted."
                }

            cur = conn.cursor()
            cur.execute("SELECT count(*) as total, sum(is_correct) as score FROM cbt_candidate_answers WHERE session_id = ?", (session_id,))
            res = cur.fetchone()
            score = res["score"] or 0

            cur.execute("SELECT count(*) FROM cbt_offline_questions WHERE subject = ? OR ? = 'General'", (sess["subject"], sess["subject"]))
            total_in_paper = min(cur.fetchone()[0] or 1, sess["total_questions"] or 10)
            percentage = round((score / total_in_paper) * 100, 1)
            status_val = "timed_out" if reason == "timeout" else "submitted"

            conn.execute("""
                UPDATE cbt_candidate_sessions
                SET status = ?, score = ?, percentage = ?, completed_at = CURRENT_TIMESTAMP, time_remaining_seconds = 0
                WHERE session_id = ?
            """, (status_val, score, percentage, session_id))
            conn.commit()

            return {
                "session_id": session_id,
                "reg_number": sess["reg_number"],
                "candidate_name": sess["candidate_name"],
                "subject": sess["subject"],
                "score": score,
                "total_questions": total_in_paper,
                "percentage": percentage,
                "status": status_val,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }

    def get_supervisor_overview(self):
        with self.db.get_connection() as conn:
            sessions = conn.execute("""
                SELECT session_id, reg_number, candidate_name, seat_number, subject, score, percentage, status, started_at, completed_at
                FROM cbt_candidate_sessions
                ORDER BY seat_number ASC, started_at DESC
            """).fetchall()

            cur = conn.cursor()
            cur.execute("SELECT count(*) as total, avg(percentage) as avg_p FROM cbt_candidate_sessions WHERE status IN ('submitted', 'timed_out')")
            agg = cur.fetchone()

            return {
                "center_code": DEFAULT_CENTER_CODE,
                "total_candidates": len(sessions),
                "completed_count": agg["total"] or 0,
                "average_score_percentage": round(agg["avg_p"] or 0.0, 1),
                "candidates": [dict(s) for s in sessions]
            }

    def generate_sync_packet(self):
        with self.db.get_connection() as conn:
            center = conn.execute("SELECT * FROM cbt_center_info LIMIT 1").fetchone()
            sessions = [dict(s) for s in conn.execute("SELECT * FROM cbt_candidate_sessions").fetchall()]
            answers = [dict(a) for a in conn.execute("SELECT * FROM cbt_candidate_answers").fetchall()]

            payload = {
                "center_code": center["center_code"] if center else DEFAULT_CENTER_CODE,
                "exported_at": datetime.now(timezone.utc).isoformat(),
                "sessions": sessions,
                "answers": answers
            }

            canonical_json = json.dumps(payload, sort_keys=True)
            signature = hmac.new(
                self.secret_key.encode("utf-8"),
                canonical_json.encode("utf-8"),
                hashlib.sha256
            ).hexdigest()

            sync_id = f"SYNC-{uuid.uuid4().hex[:8].upper()}"
            conn.execute("""
                INSERT INTO cbt_sync_audit (sync_id, record_count, checksum_hmac)
                VALUES (?, ?, ?)
            """, (sync_id, len(sessions), signature))
            conn.commit()

            return {
                "sync_id": sync_id,
                "payload": payload,
                "hmac_signature": signature,
                "integrity_algorithm": "HMAC-SHA256"
            }

    def verify_and_import_sync_packet(self, packet_dict: dict):
        payload = packet_dict.get("payload")
        signature = packet_dict.get("hmac_signature")
        if not payload or not signature:
            return {"valid": False, "error": "Missing payload or signature"}

        canonical_json = json.dumps(payload, sort_keys=True)
        expected_sig = hmac.new(
            self.secret_key.encode("utf-8"),
            canonical_json.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(signature, expected_sig):
            return {"valid": False, "error": "Cryptographic signature mismatch! Tampered sync file rejected."}

        imported_sessions = 0
        with self.db.get_connection() as conn:
            for s in payload.get("sessions", []):
                conn.execute("""
                    INSERT OR REPLACE INTO cbt_candidate_sessions
                    (session_id, reg_number, candidate_name, seat_number, subject, total_questions,
                     time_allocated_seconds, time_remaining_seconds, score, percentage, status, started_at, completed_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    s["session_id"], s["reg_number"], s["candidate_name"], s["seat_number"],
                    s["subject"], s["total_questions"], s["time_allocated_seconds"],
                    s["time_remaining_seconds"], s["score"], s["percentage"], s["status"],
                    s["started_at"], s["completed_at"]
                ))
                imported_sessions += 1
            conn.commit()

        return {"valid": True, "imported_sessions": imported_sessions, "center_code": payload.get("center_code")}


# =====================================================================
# Built-In Pure HTML5/CSS/JS Offline Candidate & Supervisor Frontend
# =====================================================================

OFFLINE_WEB_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EduNaija OS - Offline CBT Examination Center</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card: #131b2e;
      --border: #1e293b;
      --accent: #00e676;
      --accent-dim: rgba(0, 230, 118, 0.15);
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --warning: #f59e0b;
      --danger: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; }
    header { background: var(--card); border-bottom: 1px solid var(--border); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 1.25rem; font-weight: 800; color: var(--accent); display: flex; align-items: center; gap: 0.5rem; }
    .badge { background: var(--accent-dim); color: var(--accent); padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; border: 1px solid var(--accent); }
    .container { max-width: 1000px; margin: 2rem auto; width: 92%; flex: 1; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
    .btn { background: var(--accent); color: #000; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; transition: 0.2s; }
    .btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-secondary { background: #334155; color: #fff; }
    .btn-danger { background: var(--danger); color: #fff; }
    .btn-group { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
    input, select { width: 100%; padding: 0.75rem 1rem; border-radius: 8px; background: #0f172a; border: 1px solid #334155; color: #fff; margin-top: 0.35rem; margin-bottom: 1rem; font-size: 1rem; }
    .question-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(42px, 1fr)); gap: 0.5rem; margin: 1rem 0; }
    .q-bubble { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer; border: 1px solid #334155; background: #1e293b; color: #94a3b8; }
    .q-bubble.active { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
    .q-bubble.answered { background: var(--accent); color: #000; border-color: var(--accent); }
    .option-row { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 0.85rem 1.2rem; margin: 0.5rem 0; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; transition: 0.2s; }
    .option-row:hover { border-color: var(--accent); }
    .option-row.selected { background: var(--accent-dim); border-color: var(--accent); color: #fff; font-weight: 600; }
    .timer-box { font-size: 1.25rem; font-weight: 800; font-family: monospace; color: var(--warning); padding: 0.4rem 0.8rem; background: rgba(245, 158, 11, 0.1); border: 1px solid var(--warning); border-radius: 6px; }
    .hidden { display: none !important; }
    footer { border-top: 1px solid var(--border); padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.8rem; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>🇳🇬 EduNaija OS</span>
      <span class="badge">OFFLINE LAB SERVER</span>
    </div>
    <div id="header-right" class="hidden" style="display:flex; align-items:center; gap:1rem;">
      <span id="seat-badge" class="badge" style="background:#334155; color:#fff; border:none;">SEAT: 01</span>
      <div id="timer" class="timer-box">10:00</div>
    </div>
  </header>

  <div class="container">
    <div id="login-view" class="card">
      <h2 style="margin-bottom:0.5rem;">CBT Station Workstation Login</h2>
      <p style="color:var(--text-muted); margin-bottom:1.5rem;">Offline Mock CBT Environment. No active internet connection required.</p>
      
      <label>JAMB / Exam Registration Number:</label>
      <input type="text" id="reg-no" placeholder="e.g. 202619482012AB" value="202619482012AB" />

      <label>Candidate Full Name:</label>
      <input type="text" id="cand-name" placeholder="e.g. Babatunde Adeyemi" value="Babatunde Adeyemi" />

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
        <div>
          <label>Assigned Seat Number:</label>
          <input type="text" id="seat-no" placeholder="e.g. SEAT-14" value="SEAT-07" />
        </div>
        <div>
          <label>Target Subject:</label>
          <select id="exam-subject">
            <option value="Mathematics">Mathematics</option>
            <option value="English Language">English Language</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="Government">Government</option>
            <option value="Economics">Economics</option>
            <option value="Literature in English">Literature in English</option>
          </select>
        </div>
      </div>

      <div class="btn-group">
        <button class="btn" onclick="startExam()">Start CBT Examination 🚀</button>
        <button class="btn btn-secondary" onclick="window.location.href='/supervisor'">Supervisor Dashboard 🛡️</button>
      </div>
    </div>

    <div id="exam-view" class="card hidden">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:0.75rem;">
        <div>
          <h3 id="subject-title">Subject: Mathematics</h3>
          <span id="cand-info" style="color:var(--text-muted); font-size:0.85rem;">Candidate: Babatunde</span>
        </div>
        <button class="btn btn-danger" style="padding:0.4rem 1rem;" onclick="submitExam('candidate_submitted')">Submit Exam</button>
      </div>

      <div class="question-grid" id="q-nav-grid"></div>

      <div style="margin-top:1.5rem; min-height:160px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 id="q-number" style="color:var(--accent);">Question 1 of 10</h4>
        </div>
        <p id="q-text" style="font-size:1.15rem; margin:1rem 0; line-height:1.5;"></p>
        
        <div id="options-container"></div>
      </div>

      <div class="btn-group" style="justify-content:space-between;">
        <button class="btn btn-secondary" onclick="prevQuestion()">⬅️ Previous</button>
        <button class="btn" onclick="nextQuestion()">Next ➡️</button>
      </div>
    </div>

    <div id="result-view" class="card hidden" style="text-align:center; padding:3rem 2rem;">
      <div style="font-size:3rem; margin-bottom:1rem;">🎉</div>
      <h2 style="color:var(--accent); margin-bottom:0.5rem;">CBT Examination Completed!</h2>
      <p style="color:var(--text-muted); margin-bottom:2rem;">Your responses have been securely recorded in the local offline database.</p>
      
      <div style="display:flex; justify-content:center; gap:2rem; margin-bottom:2rem;">
        <div class="card" style="min-width:140px;">
          <div style="font-size:2rem; font-weight:800; color:var(--accent);" id="res-score">8/10</div>
          <div style="color:var(--text-muted); font-size:0.85rem;">Raw Score</div>
        </div>
        <div class="card" style="min-width:140px;">
          <div style="font-size:2rem; font-weight:800; color:#38bdf8;" id="res-pct">80%</div>
          <div style="color:var(--text-muted); font-size:0.85rem;">Percentage</div>
        </div>
      </div>

      <button class="btn" onclick="location.reload()">Next Candidate Login</button>
    </div>
  </div>

  <footer>
    EduNaija OS &bull; Offline CBT Engine v2.4 &bull; SQLite WAL Mode &bull; Fully Air-Gapped Capable
  </footer>

  <script>
    let currentSessionId = null;
    let questions = [];
    let currentIndex = 0;
    let timerInterval = null;
    let secondsLeft = 600;

    async function startExam() {
      const reg = document.getElementById('reg-no').value;
      const name = document.getElementById('cand-name').value;
      const seat = document.getElementById('seat-no').value;
      const subject = document.getElementById('exam-subject').value;

      const res = await fetch('/api/candidate/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reg_number: reg, candidate_name: name, seat_number: seat, subject })
      });
      const data = await res.json();
      currentSessionId = data.session_id;

      const qRes = await fetch('/api/exam/questions?session_id=' + currentSessionId);
      const qData = await qRes.json();
      questions = qData.questions || [];

      document.getElementById('login-view').classList.add('hidden');
      document.getElementById('exam-view').classList.remove('hidden');
      document.getElementById('header-right').classList.remove('hidden');
      document.getElementById('seat-badge').innerText = 'SEAT: ' + seat;
      document.getElementById('subject-title').innerText = 'Subject: ' + subject;
      document.getElementById('cand-info').innerText = 'Candidate: ' + name + ' (' + reg + ')';

      renderNavGrid();
      loadQuestion(0);
      startTimer();
    }

    function renderNavGrid() {
      const grid = document.getElementById('q-nav-grid');
      grid.innerHTML = '';
      questions.forEach((q, i) => {
        const b = document.createElement('div');
        b.className = 'q-bubble' + (i === currentIndex ? ' active' : '') + (q.chosen_option ? ' answered' : '');
        b.innerText = i + 1;
        b.onclick = () => loadQuestion(i);
        grid.appendChild(b);
      });
    }

    function loadQuestion(idx) {
      if (idx < 0 || idx >= questions.length) return;
      currentIndex = idx;
      renderNavGrid();

      const q = questions[currentIndex];
      document.getElementById('q-number').innerText = 'Question ' + (currentIndex + 1) + ' of ' + questions.length;
      document.getElementById('q-text').innerText = q.question_text;

      const cont = document.getElementById('options-container');
      cont.innerHTML = '';

      ['A', 'B', 'C', 'D'].forEach(opt => {
        const textKey = 'option_' + opt.toLowerCase();
        if (q[textKey]) {
          const row = document.createElement('div');
          row.className = 'option-row' + (q.chosen_option === opt ? ' selected' : '');
          row.innerHTML = '<strong>' + opt + '.</strong> ' + q[textKey];
          row.onclick = () => selectOption(opt);
          cont.appendChild(row);
        }
      });
    }

    async function selectOption(opt) {
      const q = questions[currentIndex];
      q.chosen_option = opt;
      loadQuestion(currentIndex);

      await fetch('/api/exam/save-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: currentSessionId, question_id: q.id, chosen_option: opt })
      });
    }

    function nextQuestion() {
      if (currentIndex < questions.length - 1) loadQuestion(currentIndex + 1);
    }
    function prevQuestion() {
      if (currentIndex > 0) loadQuestion(currentIndex - 1);
    }

    function startTimer() {
      timerInterval = setInterval(() => {
        secondsLeft--;
        const m = Math.floor(secondsLeft / 60);
        const s = secondsLeft % 60;
        document.getElementById('timer').innerText = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        if (secondsLeft <= 0) {
          clearInterval(timerInterval);
          submitExam('timeout');
        }
      }, 1000);
    }

    async function submitExam(reason) {
      if (reason !== 'timeout' && !confirm('Are you sure you want to finish and submit your exam?')) return;
      clearInterval(timerInterval);

      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: currentSessionId, reason })
      });
      const data = await res.json();

      document.getElementById('exam-view').classList.add('hidden');
      document.getElementById('header-right').classList.add('hidden');
      document.getElementById('result-view').classList.remove('hidden');

      document.getElementById('res-score').innerText = data.score + '/' + data.total_questions;
      document.getElementById('res-pct').innerText = data.percentage + '%';
    }
  </script>
</body>
</html>
"""

OFFLINE_SUPERVISOR_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>EduNaija CBT - Supervisor Console</title>
  <style>
    body { background: #0b0f19; color: #f1f5f9; font-family: system-ui, sans-serif; margin: 0; padding: 2rem; }
    h1 { color: #00e676; margin-bottom: 0.5rem; }
    .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .kpi-card { background: #1e293b; padding: 1rem; border-radius: 8px; text-align: center; }
    .kpi-val { font-size: 1.8rem; font-weight: 800; color: #00e676; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { text-align: left; padding: 0.75rem 1rem; border-bottom: 1px solid #1e293b; }
    th { color: #94a3b8; font-size: 0.85rem; text-transform: uppercase; }
    .btn { background: #00e676; color: #000; font-weight: 700; padding: 0.6rem 1.2rem; border-radius: 6px; border: none; cursor: pointer; }
    .btn-secondary { background: #334155; color: #fff; }
    .status-in_progress { color: #f59e0b; font-weight: bold; }
    .status-submitted { color: #00e676; font-weight: bold; }
    .status-timed_out { color: #ef4444; font-weight: bold; }
  </style>
</head>
<body>
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
    <div>
      <h1>Center Supervisor Command Console 🛡️</h1>
      <p style="color:#94a3b8;">Real-Time Workstation Audit & Tamper-Evident Sync Packaging</p>
    </div>
    <div style="display:flex; gap:0.75rem;">
      <button class="btn btn-secondary" onclick="window.location.href='/'">Candidate View</button>
      <button class="btn" onclick="exportSyncPacket()">Export Sync Packet (HMAC-SHA256) 📦</button>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card"><div class="kpi-val" id="kpi-center">CBT-001</div><small style="color:#94a3b8;">Center Code</small></div>
    <div class="kpi-card"><div class="kpi-val" id="kpi-total">0</div><small style="color:#94a3b8;">Total Candidates</small></div>
    <div class="kpi-card"><div class="kpi-val" id="kpi-completed">0</div><small style="color:#94a3b8;">Completed Exams</small></div>
    <div class="kpi-card"><div class="kpi-val" id="kpi-avg">0%</div><small style="color:#94a3b8;">Average Score</small></div>
  </div>

  <div class="card">
    <h3>Active Workstations & Live Submissions</h3>
    <table>
      <thead>
        <tr>
          <th>Seat</th>
          <th>Reg No</th>
          <th>Candidate</th>
          <th>Subject</th>
          <th>Status</th>
          <th>Score</th>
          <th>%</th>
          <th>Started</th>
        </tr>
      </thead>
      <tbody id="table-body">
        <tr><td colspan="8" style="text-align:center; color:#94a3b8;">Loading candidate records...</td></tr>
      </tbody>
    </table>
  </div>

  <script>
    async function loadOverview() {
      const res = await fetch('/api/supervisor/candidates');
      const data = await res.json();
      document.getElementById('kpi-center').innerText = data.center_code || 'CBT';
      document.getElementById('kpi-total').innerText = data.total_candidates || 0;
      document.getElementById('kpi-completed').innerText = data.completed_count || 0;
      document.getElementById('kpi-avg').innerText = (data.average_score_percentage || 0) + '%';

      const tbody = document.getElementById('table-body');
      tbody.innerHTML = '';
      if (!data.candidates || data.candidates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#94a3b8;">No candidates currently logged in.</td></tr>';
        return;
      }
      data.candidates.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + c.seat_number + '</strong></td>' +
                       '<td>' + c.reg_number + '</td>' +
                       '<td>' + c.candidate_name + '</td>' +
                       '<td>' + c.subject + '</td>' +
                       '<td class="status-' + c.status + '">' + c.status.toUpperCase() + '</td>' +
                       '<td>' + (c.score || 0) + '</td>' +
                       '<td>' + (c.percentage || 0) + '%</td>' +
                       '<td style="color:#94a3b8; font-size:0.8rem;">' + (c.started_at || '') + '</td>';
        tbody.appendChild(tr);
      });
    }

    async function exportSyncPacket() {
      const res = await fetch('/api/supervisor/export-packet');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'edunaija_cbt_sync_' + data.sync_id + '.json';
      a.click();
      alert('Tamper-Evident Sync Packet Exported successfully! SHA-256 HMAC: ' + data.hmac_signature.substring(0, 16) + '...');
    }

    setInterval(loadOverview, 5000);
    loadOverview();
  </script>
</body>
</html>
"""


class CBTRequestHandler(BaseHTTPRequestHandler):
    """Custom HTTP Request Handler serving both HTML interfaces and REST API endpoints."""

    def __init__(self, *args, service: OfflineCBTService = None, **kwargs):
        self.service = service
        super().__init__(*args, **kwargs)

    def _send_json(self, data, status_code=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _send_html(self, html_content, status_code=200):
        body = html_content.encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_body_json(self):
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw) if raw else {}

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        if path == "/" or path == "/index.html":
            self._send_html(OFFLINE_WEB_PAGE)
        elif path == "/supervisor":
            self._send_html(OFFLINE_SUPERVISOR_PAGE)
        elif path == "/api/status":
            self._send_json(self.service.get_status())
        elif path == "/api/exam/questions":
            sess_id = qs.get("session_id", [""])[0]
            limit = int(qs.get("limit", [10])[0])
            self._send_json(self.service.get_exam_questions(sess_id, limit=limit))
        elif path == "/api/supervisor/candidates":
            self._send_json(self.service.get_supervisor_overview())
        elif path == "/api/supervisor/export-packet":
            self._send_json(self.service.generate_sync_packet())
        else:
            self._send_json({"error": "Endpoint not found"}, status_code=404)

    def do_POST(self):
        path = urlparse(self.path).path
        payload = self._read_body_json()

        if path == "/api/candidate/login":
            reg = payload.get("reg_number", "")
            name = payload.get("candidate_name", "")
            seat = payload.get("seat_number", "")
            subject = payload.get("subject", "Mathematics")
            self._send_json(self.service.candidate_login(reg, name, seat, subject))
        elif path == "/api/exam/save-answer":
            sess_id = payload.get("session_id", "")
            q_id = payload.get("question_id", "")
            opt = payload.get("chosen_option", "")
            self._send_json(self.service.save_answer(sess_id, q_id, opt))
        elif path == "/api/exam/submit":
            sess_id = payload.get("session_id", "")
            reason = payload.get("reason", "candidate_submitted")
            self._send_json(self.service.submit_exam(sess_id, reason))
        elif path == "/api/supervisor/import-packet":
            self._send_json(self.service.verify_and_import_sync_packet(payload))
        else:
            self._send_json({"error": "Endpoint not found"}, status_code=404)


class OfflineCBTServer:
    """Wrapper to start and manage the standalone HTTP server."""
    def __init__(self, host="0.0.0.0", port=DEFAULT_PORT, db_path=None, secret_key=DEFAULT_SECRET_KEY):
        self.host = host
        self.port = port
        self.db = CBTDatabase(db_path=db_path)
        self.service = OfflineCBTService(self.db, secret_key=secret_key)
        self.httpd = None

    def create_server(self):
        def handler_factory(*args, **kwargs):
            return CBTRequestHandler(*args, service=self.service, **kwargs)
        self.httpd = HTTPServer((self.host, self.port), handler_factory)
        return self.httpd

    def run(self):
        server = self.create_server()
        print(f"============================================================")
        print(f"🇳🇬 EduNaija OS - Standalone Offline CBT Server Active")
        print(f"============================================================")
        print(f"⚡ Local Server URL:  http://localhost:{self.port}")
        print(f"⚡ LAN Workstation:   http://0.0.0.0:{self.port}")
        print(f"🛡️  Supervisor Panel: http://localhost:{self.port}/supervisor")
        print(f"💾 SQLite Database:   {self.db.db_path} (WAL Mode)")
        print(f"Press Ctrl+C to terminate.")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down CBT Server safely...")
            server.server_close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="EduNaija Offline CBT Server for School Labs")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="Port to listen on (default 8080)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host interface (default 0.0.0.0)")
    parser.add_argument("--center-code", type=str, default=DEFAULT_CENTER_CODE, help="Center identification code")
    args = parser.parse_args()

    cbt_server = OfflineCBTServer(host=args.host, port=args.port)
    cbt_server.run()
