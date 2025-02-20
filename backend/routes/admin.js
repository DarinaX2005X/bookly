const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const Book = require("../models/Book");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const router = express.Router();

router.get("/users", protect, authorize("admin"), async (req, res, next) => {
  try {
    const users = await User.find().populate("borrowedBooks");
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

router.get("/librarians", protect, authorize("admin"), async (req, res, next) => {
  try {
    const librarians = await User.find({ role: "librarian" });
    res.status(200).json({ success: true, data: librarians });
  } catch (err) {
    next(err);
  }
});

router.get("/books", protect, authorize("admin"), async (req, res, next) => {
  try {
    const books = await Book.find();
    res.status(200).json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
});

router.get("/transactions", protect, authorize("admin"), async (req, res, next) => {
  try {
    const transactions = await Transaction.find().populate("user book");
    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  }
});

router.get("/stats", protect, authorize("admin"), async (req, res, next) => {
  try {
    const stats = {
      totalBooks: await Book.countDocuments(),
      totalUsers: await User.countDocuments({ role: { $ne: "admin" } }),
      totalTransactions: await Transaction.countDocuments(),
      popularGenres: (await Book.aggregate([
        { $unwind: "$genres" },
        { $group: { _id: "$genres", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])).map(g => g._id),
      overdueBooks: await Transaction.countDocuments({
        status: "borrowed",
        borrowDate: { $lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      }),
      mostBorrowedBooks: (await Transaction.aggregate([
        { $match: { status: "borrowed" } },
        { $group: { _id: "$book", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "books", localField: "_id", foreignField: "_id", as: "book" } },
        { $unwind: "$book" },
        { $project: { title: "$book.title", count: 1 } }
      ])),
    };
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;