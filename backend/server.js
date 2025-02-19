const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

dotenv.config();

connectDB();

const app = express();

// Correct CORS configuration for development
app.use(cors({
  origin: "http://localhost:5000", // Frontend should run on this port
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/books", require("./routes/books"));
app.use("/api/users", require("./routes/users"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/librarians", require("./routes/librarians"));

// Ensure your static files are served from the correct directory
app.use(express.static("frontend"));

// Обработка ошибок
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
