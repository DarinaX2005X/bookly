const User = require("../models/User");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('borrowedBooks', 'title authors genres description');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};