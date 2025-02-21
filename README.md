# Bookly - Library Management System

**Bookly** is a web application designed to manage a digital library, allowing users to browse, borrow, and return books, librarians to manage the book catalog, and admins to oversee system statistics and user activity. Built with a RESTful API and MongoDB Atlas, it demonstrates NoSQL capabilities for a real-world application.

## Features

- **User Features:**
  - Register and log in with role-based access (user, librarian, admin).
  - Browse the book catalog with search, genre, and author filters.
  - Borrow and return books, with real-time availability updates.

- **Librarian Features:**
  - Add, edit, and delete books with cover image uploads.
  - Update book availability using intuitive +/- controls.

- **Admin Features:**
  - View and filter user, librarian, book, and transaction tables.
  - Access a dashboard with comprehensive library statistics (e.g., most borrowed books, active users).

- **Technical Highlights:**
  - MongoDB Atlas for scalable NoSQL storage.
  - RESTful API with CRUD operations.
  - Aggregation pipelines for advanced analytics.
  - Compound indexes for query optimization.
  - JWT-based authentication and role-based authorization.

## Technologies

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (NoSQL)
- **Dependencies:** Mongoose, JWT, Bcrypt, Multer, Chart.js

## Prerequisites

- Node.js (v16+ recommended)
- MongoDB Atlas account (free tier sufficient)
- npm (Node Package Manager)
- Git (for cloning the repository)

## Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/DarinaX2005X/bookly.git
   cd bookly
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a .env file in the root directory with:
   ```bash
   MONGODB_ATLAS_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/bookly?retryWrites=true&w=majority
   JWT_SECRET=<your-secret-key>
   PORT=5000
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123
   ```
   Replace <username>, <password>, and <your-secret-key> with your Atlas credentials and a secure key.

4. **Seed the Database:**
   Populate initial data:
   ```bash
   node backend/database/seed.js
   ```
   This fetches books from the Open Library API and adds sample users/transactions.
   
5. **Start the Server:**
   ```bash
   node backend/server.js
   ```
   Open http://localhost:5000 in your browser.
   
