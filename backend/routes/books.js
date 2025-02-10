const express = require("express");
const { getBooks, createBook } = require("../controllers/bookController");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

router.route("/")
  .get(getBooks)
  .post(protect, authorize("admin", "librarian"), createBook);

module.exports = router;
