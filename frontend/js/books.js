import { notify } from './notify.js';

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/index.html";
    return;
  }
  loadBooks();
  loadGenres();
  loadAuthors();

  document.getElementById("search-input").addEventListener("input", () => loadBooks());
  document.getElementById("genre-select").addEventListener("change", () => loadBooks());
  document.getElementById("author-select").addEventListener("change", () => loadBooks());
  document.getElementById("sort-select").addEventListener("change", () => loadBooks());

  document.getElementById("books-container").addEventListener("click", (e) => {
    const card = e.target.closest(".book-card");
    if (card && !e.target.classList.contains("btn-borrow")) {
      const details = card.querySelector(".book-details");
      if (details) {
        details.style.display = details.style.display === "block" ? "none" : "block";
      }
    }
  });
});

async function loadBooks(page = 1) {
  const search = document.getElementById("search-input").value;
  const genre = document.getElementById("genre-select").value;
  const author = document.getElementById("author-select").value;
  const sort = document.getElementById("sort-select").value.split("-");
  const sortBy = sort[0];
  const sortOrder = sort[1] || "asc";

  try {
    const response = await fetch(
      `/api/books?page=${page}&search=${encodeURIComponent(search)}&genre=${encodeURIComponent(genre)}&author=${encodeURIComponent(author)}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    const data = await response.json();
    if (data.success) {
      renderBooks(data.data);
      renderPagination(data.page, data.pages);
    } else {
      notify("Failed to load books", "error");
    }
  } catch (error) {
    notify("An error occurred. Please try again.", "error");
  }
}

async function loadGenres() {
  try {
    const response = await fetch("/api/books", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    if (data.success) {
      const genres = [...new Set(data.data.flatMap(book => book.genres))];
      const select = document.getElementById("genre-select");
      select.innerHTML = '<option value="">All Genres</option>' +
        genres.map(genre => `<option value="${genre}">${genre}</option>`).join("");
    }
  } catch (error) {
    notify("Failed to load genres", "error");
  }
}

async function loadAuthors() {
  try {
    const response = await fetch("/api/books", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    if (data.success) {
      const authors = [...new Set(data.data.flatMap(book => book.authors).flat())];
      const select = document.getElementById("author-select");
      select.innerHTML = '<option value="">All Authors</option>' +
        authors.map(author => `<option value="${author}">${author}</option>`).join("");
    }
  } catch (error) {
    notify("Failed to load authors", "error");
  }
}

function renderBooks(books) {
  const container = document.getElementById("books-container");
  container.innerHTML = books.map(book => `
    <div class="book-card" data-id="${book._id}">
      <img src="${book.coverUrl}" alt="${book.title} cover">
      <h3>${book.title.slice(0, 100)}</h3>
      <p>By ${book.authors.join(", ").slice(0, 100)}</p>
      <p>Available: ${book.availableCopies}</p>
      ${book.availableCopies > 0
        ? `<button class="btn-borrow" data-id="${book._id}">Borrow</button>`
        : `<button class="btn-out-of-stock" disabled>Out of Stock</button>`}
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

  document.querySelectorAll(".btn-borrow").forEach(button => {
    button.addEventListener("click", () => borrowBook(button.dataset.id));
  });
}

async function borrowBook(bookId) {
  try {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ bookId }),
    });
    const data = await response.json();
    if (response.ok) {
      notify("Book borrowed successfully!", "success");
      loadBooks();
    } else {
      notify(data.error || "Failed to borrow book", "error");
    }
  } catch (error) {
    notify("An error occurred. Please try again.", "error");
  }
}

function renderPagination(currentPage, totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    if (i === currentPage) button.disabled = true;
    button.addEventListener("click", () => loadBooks(i));
    pagination.appendChild(button);
  }
}