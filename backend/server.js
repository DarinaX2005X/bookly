const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const multer = require("multer");
const path = require("path");

dotenv.config();

connectDB();

const app = express();

app.use(cors({ origin: "http://localhost:5000", credentials: true }));
app.use(express.json());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "frontend/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

app.use("/api/auth", require("./routes/auth"));
app.use("/api/books", upload.single("coverImage"), require("./routes/books"));
app.use("/api/users", require("./routes/users"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/librarians", require("./routes/librarians"));

// Ensure your static files are served from the correct directory
app.use(express.static("frontend"));
app.use("/uploads", express.static("frontend/uploads"));

// Обработка ошибок
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
