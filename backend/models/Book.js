const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Please add a title"] },
    authors: { type: [String], required: [true, "Please add at least one author"] },
    isbn: { type: String, required: [true, "Please add an ISBN"], unique: true },
    publisher: { type: String, required: [true, "Please add a publisher"] },
    publishedYear: { type: Number, required: [true, "Please add a published year"] },
    genres: { type: [String], required: [true, "Please add at least one genre"] },
    copies: { type: Number, required: [true, "Please add the number of copies"], default: 1 },
    availableCopies: { type: Number, required: [true, "Please add the number of available copies"], default: 1 },
    coverUrl: { type: String, default: "https://via.placeholder.com/150" },
    description: {
      type: mongoose.Schema.Types.Mixed, // Allow string or array
      default: "No description available.",
      validate: {
        validator: function (v) {
          return typeof v === "string" || (Array.isArray(v) && v.every(item => typeof item === "string"));
        },
        message: "Description must be a string or an array of strings"
      }
    }
  },
  { timestamps: true }
);

// Text index for search
bookSchema.index({ title: "text", authors: "text", description: "text" });
// Compound index for sorting by title and publishedYear
bookSchema.index({ title: 1, publishedYear: -1 });
// Compound index for sorting by authors and genres
bookSchema.index({ authors: 1, genres: 1 });

module.exports = mongoose.model("Book", bookSchema);