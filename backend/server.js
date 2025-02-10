const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

// Загружаем переменные окружения
dotenv.config();

// Подключаемся к базе данных
connectDB();

const app = express();

// Мидлвары
app.use(cors({
  origin: "http://localhost:5000",
  credentials: true,
}));
app.use(express.json());

// API маршруты
app.use("/api/auth", require("./routes/auth"));
app.use("/api/books", require("./routes/books"));
app.use("/api/users", require("./routes/users"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/admin", require("./routes/admin"));

// Статические файлы фронтенда
app.use(express.static("frontend"));

// Обработка ошибок
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
