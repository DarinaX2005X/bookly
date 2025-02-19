const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { createBook, updateBook, deleteBook } = require("../controllers/bookController");
const router = express.Router();

router.post("/", protect, authorize("librarian"), createBook);
router.put("/:id", protect, authorize("librarian"), updateBook);
router.delete("/:id", protect, authorize("librarian"), deleteBook);

module.exports = router;