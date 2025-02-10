document.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  // Раскрытие деталей книги при клике на карточку (не на кнопку Borrow)
  document.getElementById("books-container").addEventListener("click", (e) => {
    const card = e.target.closest(".book-card");
    if (card && !e.target.classList.contains("btn-borrow")) {
      const details = card.querySelector(".book-details");
      if (details) {
        details.style.display = details.style.display === "block" ? "none" : "block";
      }
    }
  });
  // Обработчик формы поиска
  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    loadBooks();
  });
});

async function loadBooks(page = 1) {
  const search = document.getElementById("search-input").value;
  const genre = document.getElementById("genre-select").value;
  try {
    const response = await fetch(`/api/books?page=${page}&search=${search}&genre=${genre}`);
    const data = await response.json();
    if (data.success) {
      renderBooks(data.data);
      renderPagination(page, data.pages);
    } else {
      notify("Failed to load books", "error");
    }
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

function renderBooks(books) {
  const container = document.getElementById("books-container");
  container.innerHTML = books.map(book => `
    <div class="book-card">
      <img src="${book.coverUrl}" alt="${book.title} cover">
      <h3>${book.title}</h3>
      <p>By ${book.authors.join(", ")}</p>
      <button class="btn-borrow" data-id="${book._id}">Borrow</button>
      <div class="book-details">
        <p><strong>Publisher:</strong> ${book.publisher}</p>
        <p><strong>Year:</strong> ${book.publishedYear}</p>
        <p><strong>Genres:</strong> ${book.genres.join(", ")}</p>
        <p><strong>Description:</strong> ${book.description || "No description available."}</p>
      </div>
    </div>
  `).join("");
}

async function borrowBook(bookId) {
  const token = localStorage.getItem("token");
  if (!token) {
    notify("Please login to borrow a book.", "error");
    return;
  }
  try {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    console.error("Error borrowing book:", error);
    notify("An error occurred. Please try again.", "error");
  }
}

function renderPagination(currentPage, totalPages) {
  const pagination = document.getElementById("pagination");
  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `<button onclick="loadBooks(${i})" ${i === currentPage ? "disabled" : ""}>${i}</button>`;
  }
  pagination.innerHTML = html;
}
