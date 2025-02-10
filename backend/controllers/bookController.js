const Book = require("../models/Book");

// Получение списка книг с пагинацией, поиском и фильтрами
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

// Создание книги (только для admin и librarian)
exports.createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};
