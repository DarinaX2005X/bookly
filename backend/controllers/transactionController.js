const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const User = require("../models/User");

// Заимствование книги
exports.borrowBook = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies < 1) {
      return res.status(400).json({ success: false, error: "Book is not available" });
    }
    const transaction = await Transaction.create({
      user: req.user._id,
      book: bookId,
    });
    book.availableCopies -= 1;
    await book.save();
    const user = await User.findById(req.user._id);
    user.borrowedBooks.push(bookId);
    await user.save();
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

// Возврат книги (ищем активную транзакцию по bookId)
exports.returnBook = async (req, res, next) => {
  try {
    const { bookId } = req.query;
    const transaction = await Transaction.findOne({
      user: req.user._id,
      book: bookId,
      status: "borrowed",
    });
    if (!transaction) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }
    const book = await Book.findById(bookId);
    book.availableCopies += 1;
    await book.save();
    const user = await User.findById(req.user._id);
    user.borrowedBooks = user.borrowedBooks.filter(
      (id) => id.toString() !== bookId.toString()
    );
    await user.save();
    transaction.returnDate = Date.now();
    transaction.status = "returned";
    await transaction.save();
    res.status(200).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};
