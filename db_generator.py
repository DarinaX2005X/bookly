import requests
import json
import time
from pymongo import MongoClient, ASCENDING, DESCENDING

# Base URL to scrape data from
BASE_URL = "https://openlibrary.org/search.json?q=book"

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client.library_database

# Collections
books_collection = db.books
users_collection = db.users
transactions_collection = db.transactions

# Indexes
books_collection.create_index([("title", ASCENDING)])  # Index for book titles
books_collection.create_index([("borrowed", ASCENDING)])  # Index for borrowing status
users_collection.create_index([("user_id", ASCENDING)], unique=True)  # Unique user IDs
users_collection.create_index([("email", ASCENDING)], unique=True)  # Unique emails
transactions_collection.create_index([("transaction_id", ASCENDING)], unique=True)  # Unique transactions
transactions_collection.create_index([("user_id", ASCENDING)])  # Index for user activity
transactions_collection.create_index([("book_id", ASCENDING)])  # Index for book activity

# Function to get book data
def get_books_from_page(page):
    params = {"page": page}
    response = requests.get(BASE_URL, params=params)
    if response.status_code != 200:
        print(f"Failed to retrieve page {page}")
        return []

    data = response.json()
    books = []

    # Parse book entries
    for book_item in data.get('docs', []):
        title = book_item.get('title', 'Unknown')
        authors = book_item.get('author_name', ['Unknown'])[:10]  # Only first 10 authors
        year = book_item.get('first_publish_year', 'Unknown')
        subjects = book_item.get('subject', [])[:10]  # Only first 10 subjects
        publisher = ", ".join(book_item.get('publisher', ['Unknown'])[:10])  # Only first 10 publishers
        isbn = book_item.get('isbn', ['Unknown'])[0]
        language = ", ".join(book_item.get('language', ['Unknown']))

        # Metadata as a nested document
        metadata = {
            "number_of_pages": book_item.get('number_of_pages_median', 'Unknown'),
            "edition_count": book_item.get('edition_count', 1),
            "publish_place": ", ".join(book_item.get('publish_place', ['Unknown'])[:10]),
            "ebook_access": book_item.get('ebook_access', 'no_access'),
            "cover_i": book_item.get('cover_i', None)
        }

        # Borrowing information
        borrowed = False  # Default value for borrowed status
        borrowed_until = None  # Default value for borrowed until date

        # Prepare the book document
        books.append({
            "title": title,
            "authors": authors,
            "year": year,
            "subjects": subjects,
            "publisher": publisher,
            "isbn": isbn,
            "language": language,
            "metadata": metadata,
            "borrowed": borrowed,
            "borrowed_until": borrowed_until
        })

    return books

# Function to save books to MongoDB
def save_books_to_mongo(books):
    if books:
        result = books_collection.insert_many(books)
        print(f"Inserted {len(result.inserted_ids)} books into MongoDB.")
    else:
        print("No books to save.")

# Generate dummy users
def generate_users():
    users = []
    for i in range(1, 21):  # 20 users
        users.append({
            "user_id": i,
            "name": f"User {i}",
            "email": f"user{i}@example.com",
            "registered_date": time.strftime("%Y-%m-%d"),
            "borrowed_books": []
        })
    users_collection.insert_many(users)
    print("Inserted dummy users.")

# Generate dummy transactions
def generate_transactions():
    transactions = []
    for i in range(1, 11):  # 10 transactions
        transactions.append({
            "transaction_id": i,
            "user_id": i,
            "book_id": i,
            "borrow_date": time.strftime("%Y-%m-%d"),
            "return_date": None
        })
    transactions_collection.insert_many(transactions)
    print("Inserted dummy transactions.")

# Main function to scrape multiple pages and save the data
def scrape_books(num_pages=10):
    for page in range(1, num_pages + 1):
        print(f"Scraping page {page}...")
        books = get_books_from_page(page)
        save_books_to_mongo(books)
        time.sleep(2)
    
    generate_users()
    generate_transactions()
    
    print("All books have been scraped and saved to MongoDB")

# Run the scraper
if __name__ == "__main__":
    scrape_books(num_pages=10)
