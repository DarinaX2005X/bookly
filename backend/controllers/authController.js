const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Регистрация нового пользователя (админ не регистрируется через этот маршрут)
exports.register = async (req, res, next) => {
  const { name, email, password, role, employeeId } = req.body;

  try {
    // Запрещаем регистрацию, если email равен ADMIN_EMAIL
    if (email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(400).json({ success: false, error: "Cannot register as admin" });
    }
    
    if (role === "librarian") {
      const librarian = await Librarian.findOne({ employeeId });
      if (!librarian) {
        return res.status(400).json({ success: false, error: "Invalid librarian ID" });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user', // default to user if role not specified
      employeeId: role === "librarian" ? employeeId : "",
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(201).json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

// Авторизация пользователя (включая админа)
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, error: "Invalid credentials" });
      }
      const token = jwt.sign({ id: "admin", role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });
      return res.status(200).json({ success: true, token, user: { role: "admin" } });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    res.status(200).json({ success: true, token, user: { role: user.role } });
  } catch (err) {
    next(err);
  }
};