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

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
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
    // Если логин совпадает с ADMIN_EMAIL – проверяем ADMIN_PASSWORD
    if (email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, error: "Invalid credentials" });
      }
      // Генерируем токен для админа
      const token = jwt.sign({ id: "admin", role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });
      return res.status(200).json({ success: true, token });
    }
    // Иначе ищем пользователя в БД
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    res.status(200).json({ success: true, token });
  } catch (err) {
    next(err);
  }
};
