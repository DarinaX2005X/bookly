import { notify } from './notify.js';

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/index.html";
    return;
  }
  loadBorrowedBooks();

  document.getElementById("borrowed-books").addEventListener("click", (e) => {
    const card = e.target.closest(".book-card");
    if (card && !e.target.classList.contains("btn-return")) {
      const details = card.querySelector(".book-details");
      if (details) {
        details.style.display = details.style.display === "block" ? "none" : "block";
      }
    }
  });
});

async function loadBorrowedBooks() {
  try {
    const response = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    if (response.ok && data.data) {
      renderBorrowedBooks(data.data.borrowedBooks);
    } else {
      notify(data.error || "Failed to load books", "error");
    }
  } catch (error) {
    notify("An error occurred. Please try again.", "error");
  }
}

function renderBorrowedBooks(books) {
  const container = document.getElementById("borrowed-books");
  container.innerHTML = books.map(book => `
    <div class="book-card" data-id="${book._id}">
      <img src="${book.coverUrl}" alt="${book.title} cover">
      <h3>${book.title.slice(0, 100)}</h3>
      <p>By ${book.authors.join(", ").slice(0, 100)}</p>
      <button class="btn-return" data-id="${book._id}">Return</button>
      <div class="book-details">
        <p><strong>ISBN:</strong> ${book.isbn}</p>
        <p><strong>Publisher:</strong> ${book.publisher}</p>
        <p><strong>Published Year:</strong> ${book.publishedYear}</p>
        <p><strong>Genres:</strong> ${book.genres.join(", ")}</p>
        <p><strong>Total Copies:</strong> ${book.copies}</p>
        <p><strong>Available Copies:</strong> ${book.availableCopies}</p>
        <p><strong>Description:</strong> ${book.description || "No description available."}</p>
      </div>
    </div>
  `).join("");
  document.querySelectorAll(".btn-return").forEach(btn => {
    btn.addEventListener("click", () => returnBook(btn.dataset.id));
  });
}

async function returnBook(bookId) {
  try {
    const response = await fetch(`/api/transactions/return?bookId=${bookId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    if (response.ok) {
      notify("Book returned successfully!", "success");
      loadBorrowedBooks();
    } else {
      notify(data.error || "Failed to return book", "error");
    }
  } catch (error) {
    notify("An error occurred. Please try again.", "error");
  }
}
