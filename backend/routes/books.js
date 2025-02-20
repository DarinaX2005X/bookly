const express = require("express");
const { getBooks, createBook, getBook, updateBook, deleteBook } = require("../controllers/bookController");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

router.route("/")
  .get(getBooks)
  .post(protect, authorize("admin", "librarian"), createBook);

router.route("/:id")
  .get(getBook)
  .put(protect, authorize("admin", "librarian"), updateBook)
  .delete(protect, authorize("admin", "librarian"), deleteBook);

module.exports = router;