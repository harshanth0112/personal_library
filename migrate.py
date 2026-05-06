import mysql.connector
from urllib.parse import urlparse

railway_url = "mysql://root:ZuaTzzHkPZjcdTVuQEvKbZkecFSsRuFM@nozomi.proxy.rlwy.net:30250/railway"
rds_url = "mysql://admin:harsha0112H@database-1.cd46cg02um0h.ap-south-1.rds.amazonaws.com:3306" # no database initially

def migrate():
    print("Connecting to Railway...")
    rail_parsed = urlparse(railway_url)
    rail_conn = mysql.connector.connect(
        host=rail_parsed.hostname,
        port=rail_parsed.port,
        user=rail_parsed.username,
        password=rail_parsed.password,
        database=rail_parsed.path.lstrip('/')
    )
    rail_cursor = rail_conn.cursor()
    rail_cursor.execute("SELECT id, title, author, published_date, location, isbn, is_favorite, is_read, is_reading, cover_image, added_date FROM books")
    books = rail_cursor.fetchall()
    print(f"Fetched {len(books)} books from Railway.")
    rail_cursor.close()
    rail_conn.close()

    print("Connecting to RDS...")
    rds_parsed = urlparse(rds_url)
    rds_conn = mysql.connector.connect(
        host=rds_parsed.hostname,
        port=rds_parsed.port,
        user=rds_parsed.username,
        password=rds_parsed.password
    )
    rds_cursor = rds_conn.cursor()
    
    print("Creating library database and books table...")
    rds_cursor.execute("CREATE DATABASE IF NOT EXISTS library")
    rds_cursor.execute("USE library")
    
    table_schema = """
    CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        published_date VARCHAR(50),
        location VARCHAR(255),
        isbn VARCHAR(50),
        is_favorite BOOLEAN DEFAULT FALSE,
        is_read BOOLEAN DEFAULT FALSE,
        is_reading BOOLEAN DEFAULT FALSE,
        cover_image VARCHAR(500),
        added_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """
    rds_cursor.execute(table_schema)
    
    print("Inserting books...")
    insert_query = """
    INSERT INTO books (id, title, author, published_date, location, isbn, is_favorite, is_read, is_reading, cover_image, added_date)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    # Use executemany
    rds_cursor.executemany(insert_query, books)
    rds_conn.commit()
    print("Migration successful!")
    
    rds_cursor.close()
    rds_conn.close()

if __name__ == "__main__":
    migrate()
