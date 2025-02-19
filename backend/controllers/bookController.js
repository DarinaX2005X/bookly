const Book = require("../models/Book");

exports.getBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, genre } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (genre) query.genres = genre;

    const books = await Book.find(query)
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
    const book = await Book.create(req.body);
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
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// Update book by ID
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// Delete book by ID
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// Update book copies (assuming you want to modify just the number of copies)
exports.updateBookCopies = async (req, res, next) => {
  try {
    const { availableCopies, copies } = req.body;
    const book = await Book.findByIdAndUpdate(req.params.id, {
      copies: copies || availableCopies,
      availableCopies: availableCopies || copies
    }, { new: true });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};