const Book = require("../models/Book");
const path = require("path");

exports.getBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, genre, author, sortBy = "title", sortOrder = "asc" } = req.query;
    const query = {};

    if (search) {
      query.title = { $regex: new RegExp(search, "i") };
    }
    if (genre) {
      query.genres = genre;
    }
    if (author) {
      query.authors = { $regex: new RegExp(author, "i") };
    }

    const sortOptions = {};
    if (sortBy === "title") sortOptions.title = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "publishedYear") sortOptions.publishedYear = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "authors") sortOptions.authors = sortOrder === "asc" ? 1 : -1;

    const books = await Book.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      count: total,
      data: books,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

// Create a new book
exports.createBook = async (req, res, next) => {
  try {
    const bookData = {
      ...req.body,
      authors: req.body.authors ? JSON.parse(req.body.authors) : ["Unknown Author"],
      genres: req.body.genres ? JSON.parse(req.body.genres) : ["General"],
    };
    if (req.file) {
      bookData.coverUrl = `/uploads/${req.file.filename}`;
    }
    const book = await Book.create(bookData);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// Get a single book by ID
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }
    res.status(200).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const bookData = { ...req.body };
    
    // Handle authors and genres safely
    bookData.authors = req.body.authors && typeof req.body.authors === "string" ? JSON.parse(req.body.authors) : req.body.authors || ["Unknown Author"];
    bookData.genres = req.body.genres && typeof req.body.genres === "string" ? JSON.parse(req.body.genres) : req.body.genres || ["General"];

    if (req.file) {
      bookData.coverUrl = `/uploads/${req.file.filename}`;
    }

    const book = await Book.findByIdAndUpdate(req.params.id, bookData, {
      new: true,
      runValidators: true,
    });
    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }
    res.status(200).json({ success: true, data: book });
  } catch (err) {
    console.error("Error in updateBook:", err);
    next(err);
  }
};

// Delete book by ID
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
