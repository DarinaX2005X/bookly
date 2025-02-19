const mongoose = require('mongoose');
const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const User = require("../models/User");

// Одалживание книги
exports.borrowBook = async (req, res, next) => {
  const { bookId } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const book = await Book.findById(bookId).session(session);
    if (!book || book.availableCopies <= 0) {
      throw new Error("Book is not available");
    }

    const transaction = await Transaction.create([{
      user: req.user._id,
      book: bookId,
      borrowDate: new Date(),
      status: "borrowed",
    }], { session: session });

    book.availableCopies -= 1;
    await book.save({ session });

    const user = await User.findById(req.user._id).session(session);
    user.borrowedBooks.push(bookId);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: transaction[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// Возврат книги (ищем активную транзакцию по bookId)
exports.returnBook = async (req, res, next) => {
  const { bookId } = req.query;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find and update the transaction with the return details
    const transaction = await Transaction.findOneAndUpdate(
      { user: req.user._id, book: bookId, status: "borrowed" },
      { $set: { status: "returned", returnDate: new Date() } },
      { new: true, session }
    );

    if (!transaction) {
      throw new Error("No active transaction found for this book");
    }

    const book = await Book.findByIdAndUpdate(
      bookId,
      { $inc: { availableCopies: 1 } },
      { new: true, session }
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { borrowedBooks: bookId } },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, data: transaction });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
