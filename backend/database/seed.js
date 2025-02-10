const mongoose = require("mongoose");
const faker = require("faker");
const axios = require("axios");
const Book = require("../models/Book");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fetchBooks() {
  const response = await axios.get("https://openlibrary.org/search.json?q=book&limit=100");
  return response.data.docs.map(book => {
    const coverUrl = book.cover_i 
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : "https://via.placeholder.com/150";
    return {
      title: book.title,
      authors: book.author_name || ["Unknown"],
      publishedYear: book.first_publish_year || 2000,
      genres: book.subject ? book.subject.slice(0, 3) : ["General"],
      publisher: book.publisher ? book.publisher[0] : "Unknown",
      isbn: book.isbn ? book.isbn[0] : faker.datatype.uuid(),
      coverUrl,
      copies: 5,
      availableCopies: 5,
      description: book.first_sentence ? book.first_sentence : "No description available."
    };
  });
}

async function seedDatabase() {
  await Book.deleteMany({});
  await User.deleteMany({});
  await Transaction.deleteMany({});

  const books = await fetchBooks();
  const savedBooks = await Book.insertMany(books);

  const users = Array.from({ length: 20 }, () => ({
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: "password"  // для простоты – одинаковый пароль
  }));
  const savedUsers = await User.insertMany(users);

  const transactions = [];
  for (let i = 0; i < 50; i++) {
    const user = savedUsers[Math.floor(Math.random() * savedUsers.length)];
    const book = savedBooks[Math.floor(Math.random() * savedBooks.length)];
    if (book.availableCopies > 0) {
      book.availableCopies -= 1;
      await book.save();
      user.borrowedBooks.push(book._id);
      await user.save();
      transactions.push({
        user: user._id,
        book: book._id,
        borrowDate: faker.date.past()
      });
    }
  }
  await Transaction.insertMany(transactions);
  console.log("Database seeded successfully!");
  mongoose.connection.close();
}

seedDatabase();
