const express = require("express");
const { borrowBook, returnBook } = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/")
  .post(protect, borrowBook);

router.route("/return")
  .put(protect, returnBook);

module.exports = router;
