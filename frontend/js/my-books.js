document.addEventListener("DOMContentLoaded", () => {
  loadBorrowedBooks();
});

async function loadBorrowedBooks() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to view your books.");
    window.location.href = "/index.html";
    return;
  }
  try {
    const response = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok && data.data) {
      renderBorrowedBooks(data.data.borrowedBooks);
    } else {
      alert(data.error || "Failed to load books");
    }
  } catch (error) {
    console.error("Error fetching borrowed books:", error);
  }
}

function renderBorrowedBooks(books) {
  const container = document.getElementById("borrowed-books");
  container.innerHTML = books.map(book => `
    <div class="book-card">
      <img src="${book.coverUrl}" alt="${book.title} cover">
      <h3>${book.title}</h3>
      <p>By ${book.authors.join(", ")}</p>
      <p>Publisher: ${book.publisher}</p>
      <p>Year: ${book.publishedYear}</p>
      <p>Genres: ${book.genres.join(", ")}</p>
      <p>Description: ${book.description || "No description available."}</p>
      <button class="btn-return" data-id="${book._id}">Return</button>
    </div>
  `).join("");
  document.querySelectorAll(".btn-return").forEach(btn => {
    btn.addEventListener("click", () => {
      returnBook(btn.dataset.id);
    });
  });
}

async function returnBook(bookId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to return a book.");
    return;
  }
  try {
    const response = await fetch(`/api/transactions/return?bookId=${bookId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      alert("Book returned successfully!");
      loadBorrowedBooks();
    } else {
      alert(data.error || "Failed to return book");
    }
  } catch (error) {
    console.error("Error returning book:", error);
    alert("An error occurred. Please try again.");
  }
}
