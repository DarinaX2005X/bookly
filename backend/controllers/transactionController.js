const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const User = require("../models/User");

exports.borrowBook = async (req, res, next) => {
  const { bookId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user.borrowedBooks.includes(bookId)) {
      return res.status(400).json({ success: false, error: "You have already borrowed this book" });
    }

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

    user.borrowedBooks.push(bookId);
    await user.save();

    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    console.error("Error in borrowBook:", err);
    next(err);
  }
};

exports.returnBook = async (req, res, next) => {
  const { bookId } = req.query;
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { user: req.user._id, book: bookId, status: "borrowed" },
      { $set: { status: "returned", returnDate: new Date() } },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, error: "No active transaction found for this book" });
    }

    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } });

    await User.findByIdAndUpdate(req.user._id, { $pull: { borrowedBooks: bookId } });

    res.status(200).json({ success: true, data: transaction });
  } catch (err) {
    console.error("Error in returnBook:", err);
    next(err);
  }
};