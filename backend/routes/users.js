const express = require("express");
const { getProfile } = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/me").get(protect, getProfile);

module.exports = router;
