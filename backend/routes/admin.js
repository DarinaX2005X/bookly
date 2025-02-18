const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

router.get("/stats", protect, authorize("admin"), async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const popularGenres = await Book.aggregate([
      { $unwind: "$genres" },
      { $group: { _id: "$genres", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      totalBooks,
      totalUsers,
      totalTransactions,
      popularGenres: popularGenres.map((g) => g._id),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

module.exports = router;