import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        from urllib.parse import urlparse
        parsed = urlparse(database_url)
        return mysql.connector.connect(
            host=parsed.hostname,
            port=parsed.port or 3306,
            user=parsed.username,
            password=parsed.password,
            database=parsed.path.lstrip('/')
        )
    else:
        return mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", 3306)),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "library_db")
        )

def run_migration():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255),
            google_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Check if user_id column exists in books
    cursor.execute("SHOW COLUMNS FROM books LIKE 'user_id'")
    result = cursor.fetchone()
    
    if not result:
        print("Adding user_id column to books table...")
        cursor.execute("ALTER TABLE books ADD COLUMN user_id INT")
        # Optional: Add foreign key
        # cursor.execute("ALTER TABLE books ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE")
        print("Done.")
    else:
        print("user_id column already exists.")

    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    run_migration()
