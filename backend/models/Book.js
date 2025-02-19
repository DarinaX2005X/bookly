const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    authors: [{ type: String, required: true }], // Changed to array of strings for simplicity
    isbn: { type: String, required: true, unique: true },
    publisher: { type: String, required: true },
    publishedYear: { type: Number, required: true },
    genres: [{ type: String, required: true }],
    copies: { type: Number, required: true, default: 1 },
    availableCopies: { type: Number, required: true, default: 1 },
    coverUrl: { type: String, default: "https://via.placeholder.com/150" },
    description: { type: [String], default: ["No description available."] },
  },
  { timestamps: true }
);

bookSchema.index({ title: "text", authors: "text", genres: "text" });

module.exports = mongoose.model("Book", bookSchema);