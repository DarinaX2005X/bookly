const Book = require("../models/Book");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

exports.getStats = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const totalTransactions = await Transaction.countDocuments();
    const popularGenresAgg = await Book.aggregate([
      { $unwind: "$genres" },
      { $group: { _id: "$genres", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const popularGenres = popularGenresAgg.map((g) => g._id);
    res.status(200).json({
      success: true,
      totalBooks,
      totalUsers,
      totalTransactions,
      popularGenres,
    });
  } catch (err) {
    next(err);
  }
};