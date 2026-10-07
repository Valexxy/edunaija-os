import sqlite3
import os
import glob
import re

db_path = os.path.join(os.path.dirname(__file__), "..", "backend", "database", "edunaija.db")
db_path = os.path.abspath(db_path)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [row[0] for row in cursor.fetchall()]
print(f"Total tables in {db_path}: {len(tables)}")
for t in sorted(tables):
    try:
        cursor.execute(f"SELECT COUNT(*) FROM {t};")
        cnt = cursor.fetchone()[0]
        print(f" - {t}: {cnt} rows")
    except Exception as e:
        print(f" - {t}: Error: {e}")

# Scan backend/routers for in-memory states
routers_dir = os.path.join(os.path.dirname(__file__), "..", "backend", "routers")
print("\n--- Scanning routers for in-memory dictionaries/lists ---")
for pyfile in glob.glob(os.path.join(routers_dir, "*.py")):
    basename = os.path.basename(pyfile)
    with open(pyfile, "r", encoding="utf-8") as f:
        content = f.read()
    # Check for module level dicts or lists
    matches = re.findall(r"^([a-zA-Z0-9_]+)\s*:\s*(?:dict|List|Dict|set)\s*=\s*(?:\{|\(set\)|\[)", content, re.MULTILINE)
    matches += re.findall(r"^([a-zA-Z0-9_]+)\s*=\s*\{\}", content, re.MULTILINE)
    if matches:
        # filter out false positives
        uniques = sorted(list(set(m for m in matches if m not in ("__all__",))))
        print(f"{basename}: {uniques}")
