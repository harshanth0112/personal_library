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
    
    # Check existing columns in users
    cursor.execute("SHOW COLUMNS FROM users")
    columns = [row[0] for row in cursor.fetchall()]
    
    queries = []
    if "first_name" not in columns:
        queries.append("ALTER TABLE users ADD COLUMN first_name VARCHAR(100)")
    if "last_name" not in columns:
        queries.append("ALTER TABLE users ADD COLUMN last_name VARCHAR(100)")
    if "gender" not in columns:
        queries.append("ALTER TABLE users ADD COLUMN gender VARCHAR(20)")
    if "date_of_birth" not in columns:
        queries.append("ALTER TABLE users ADD COLUMN date_of_birth DATE")
    if "reset_token" not in columns:
        queries.append("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255)")
    if "reset_token_expiry" not in columns:
        queries.append("ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME")

    for q in queries:
        print(f"Executing: {q}")
        cursor.execute(q)

    conn.commit()
    print("Migration complete.")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    run_migration()
