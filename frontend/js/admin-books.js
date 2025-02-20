import { notify } from './notify.js';

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    window.location.href = "/index.html";
    return;
  }
  loadBooks();
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    notify("Logged out successfully!", "success");
    window.location.href = "/index.html";
  });
});

async function loadBooks() {
  const token = localStorage.getItem("token");
  if (!token) {
    notify("Please login to access the admin panel.", "error");
    window.location.href = "/index.html";
    return;
  }
  try {
    const response = await fetch("/api/admin/books", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      renderBooks(data.data);
    } else {
      notify(data.error || "Failed to load books", "error");
    }
  } catch (err) {
    notify("An error occurred. Please try again.", "error");
  }
}

function renderBooks(books) {
  const tbody = document.querySelector("#books-table tbody");
  tbody.innerHTML = books.map(book => `
    <tr>
      <td>${book.title}</td>
      <td>${book.authors.join(", ")}</td>
      <td>${book.availableCopies}/${book.copies}</td>
    </tr>
  `).join("");
}