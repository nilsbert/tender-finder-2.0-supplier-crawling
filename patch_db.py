import sqlite3
import os

db_path = "/Users/nilshyoma/Documents/GitHub - Mac Book/tender-finder-2.0/supplier-crawling/supplier_crawling.db"

def patch_db():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Check job_offer
    cursor.execute("PRAGMA table_info(job_offer)")
    columns = [row[1] for row in cursor.fetchall()]
    if "is_public" not in columns:
        print("Adding is_public to job_offer")
        cursor.execute("ALTER TABLE job_offer ADD COLUMN is_public BOOLEAN DEFAULT 1")
    
    if "category" not in columns:
        print("Adding category to job_offer")
        cursor.execute("ALTER TABLE job_offer ADD COLUMN category VARCHAR(100) DEFAULT 'PUBLIC_SECTOR'")

    # Check tender_winning_notice
    cursor.execute("PRAGMA table_info(tender_winning_notice)")
    columns = [row[1] for row in cursor.fetchall()]
    if "is_public" not in columns:
        print("Adding is_public to tender_winning_notice")
        cursor.execute("ALTER TABLE tender_winning_notice ADD COLUMN is_public BOOLEAN DEFAULT 1")

    conn.commit()
    conn.close()
    print("Database patched successfully.")

if __name__ == "__main__":
    patch_db()
