import os
import json
import sqlite3
import random

db_dir = os.path.join("backend", "database")
os.makedirs(db_dir, exist_ok=True)
db_path = os.path.join(db_dir, "edunaija.db")

print(f"Target DB path: {db_path}")