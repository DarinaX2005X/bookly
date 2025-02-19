const mongoose = require("mongoose");

const librarianSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String,
  department: String,
  hireDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Librarian", librarianSchema);