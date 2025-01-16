# Bookly online library
Bookly is an online service that allows you to explore 1000+ books from around the world and find out if it's available at your local library to borrow it

> Link to presentation --> [click](https://www.canva.com/design/DAGbgPUi92A/0P_sf_5NmAdq7r_Ww9qbsQ/edit?utm_content=DAGbgPUi92A&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

Information about books is taken from the OpenLibrary API and parsed through a python script
<br/><br/>

## About project
My project focuses on building a comprehensive library management system, implemented using a MongoDB database with three primary collections: books, users, and transactions. The system is designed to streamline library operations, from managing book inventory to tracking user borrowing activities efficiently

The books collection contains rich metadata about each book, ensuring detailed and accurate information for users. The users collection represents the library's members, while the transactions collection logs all borrowing activities

This structure is optimized through indexing for fast data retrieval and includes relationships between collections. The project leverages real-world data scraped from OpenLibrary, populating the database with thousand of entries, making it suitable for testing scalability and query performance in a real environment

## UML Use Case
