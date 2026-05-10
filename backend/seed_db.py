"""Run this script to create and seed the SQLite database."""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "mentions.db")

def get_seed_path():
    possible_paths = [
        os.path.join(os.path.dirname(__file__), "..", "seed_data.sql"),
        os.path.join(os.path.dirname(__file__), "seed_data.sql")
    ]
    for path in possible_paths:
        if os.path.exists(path):
            return path
    raise FileNotFoundError("Could not find seed_data.sql")

def seed():
    if os.path.exists(DB_PATH):
        # Don't delete if we already seeded in a persistent volume, 
        # but for Railway ephemeral, it's fine unless we want to avoid overwriting.
        # But if it exists and has data, skip seeding to avoid wiping on every restart.
        conn = sqlite3.connect(DB_PATH)
        try:
            count = conn.execute("SELECT COUNT(*) FROM mentions").fetchone()[0]
            if count > 0:
                print("Database already seeded.")
                conn.close()
                return
        except:
            pass
        conn.close()
        os.remove(DB_PATH)

    SEED_PATH = get_seed_path()
    conn = sqlite3.connect(DB_PATH)
    with open(SEED_PATH) as f:
        conn.executescript(f.read())
    conn.close()

    print(f"Database created at {DB_PATH}")

    # Verify
    conn = sqlite3.connect(DB_PATH)
    count = conn.execute("SELECT COUNT(*) FROM mentions").fetchone()[0]
    print(f"Seeded {count} mention records")
    conn.close()


if __name__ == "__main__":
    seed()
