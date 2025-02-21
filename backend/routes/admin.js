const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const Book = require("../models/Book");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const router = express.Router();

router.get("/users", protect, authorize("admin"), async (req, res, next) => {
  try {
    const { search, sortBy = "name", sortOrder = "asc", role } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } }
      ];
      console.log("User search query:", query); // Debug log
    }
    if (role) query.role = role;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const users = await User.find(query).sort(sortOptions).populate("borrowedBooks");
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

router.get("/librarians", protect, authorize("admin"), async (req, res, next) => {
  try {
    const { search, sortBy = "name", sortOrder = "asc" } = req.query;
    const query = { role: "librarian" };
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const librarians = await User.find(query).sort(sortOptions);
    res.status(200).json({ success: true, data: librarians });
  } catch (err) {
    next(err);
  }
});

router.get("/books", protect, authorize("admin"), async (req, res, next) => {
  try {
    const { search, sortBy = "title", sortOrder = "asc" } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: new RegExp(search, "i") } },
        { authors: { $regex: new RegExp(search, "i") } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const books = await Book.find(query).sort(sortOptions);
    res.status(200).json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
});

router.get("/transactions", protect, authorize("admin"), async (req, res, next) => {
  try {
    const { search, sortBy = "borrowDate", sortOrder = "desc", status } = req.query;
    const pipeline = [
      { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $lookup: { from: "books", localField: "book", foreignField: "_id", as: "book" } },
      { $unwind: "$book" },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "user.name": { $regex: new RegExp(search, "i") } },
            { "book.title": { $regex: new RegExp(search, "i") } }
          ]
        }
      });
    }
    if (status) {
      pipeline.push({ $match: { status } });
    }

    pipeline.push({
      $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 }
    });

    const transactions = await Transaction.aggregate(pipeline);
    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    console.error("Error in transactions:", err);
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
      avgBorrowDuration: await Transaction.aggregate([
        { $match: { status: "returned" } },
        { $project: { duration: { $divide: [{ $subtract: ["$returnDate", "$borrowDate"] }, 1000 * 60 * 60 * 24] } } },
        { $group: { _id: null, avgDuration: { $avg: "$duration" } } }
      ]).then(result => result[0]?.avgDuration || 0),
      mostActiveUsers: await Transaction.aggregate([
        { $match: { status: "borrowed" } },
        { $group: { _id: "$user", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $project: { name: "$user.name", count: 1 } }
      ])
    };
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;