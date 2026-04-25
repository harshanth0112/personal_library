import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def setup_postgres():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not found in .env")
        return

    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        print("Creating 'books' table in PostgreSQL...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS books (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                published_date VARCHAR(100),
                location VARCHAR(255),
                isbn VARCHAR(50),
                is_favorite SMALLINT DEFAULT 0,
                is_read SMALLINT DEFAULT 0,
                is_reading SMALLINT DEFAULT 0,
                cover_image VARCHAR(500),
                added_date TIMESTAMP
            )
        """)
        conn.commit()
        print("✅ PostgreSQL table 'books' is ready!")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    setup_postgres()
