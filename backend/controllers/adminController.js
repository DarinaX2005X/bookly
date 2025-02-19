const mongoose = require('mongoose');
const Book = require("../models/Book");
const User = require("../models/User");
const Librarian = require("../models/Librarian");
const Transaction = require("../models/Transaction");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find().populate('user book');
    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  }
};

exports.getLibrarians = async (req, res, next) => {
  try {
    const librarians = await Librarian.find();
    res.status(200).json({ success: true, data: librarians });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const stats = {
      totalBooks: await Book.countDocuments(),
      totalUsers: await User.countDocuments(),
      totalTransactions: await Transaction.countDocuments(),
      popularGenres: await Book.aggregate([
        { $unwind: "$genres" },
        { $group: { _id: "$genres", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).exec()  // Use .exec() to get the result of the aggregation
    };

    // Convert the aggregation result to an array of genre names
    stats.popularGenres = stats.popularGenres.map(g => g._id);

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error("Error in getStats:", err);
    next(err);
  }
};