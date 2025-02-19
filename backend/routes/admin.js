const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { getUsers, getTransactions, getLibrarians, getStats } = require("../controllers/adminController");
const router = express.Router();

router.get("/users", protect, authorize("admin"), getUsers);
router.get("/transactions", protect, authorize("admin"), getTransactions);
router.get("/librarians", protect, authorize("admin"), getLibrarians);
router.get("/stats", protect, authorize("admin"), getStats);

module.exports = router;