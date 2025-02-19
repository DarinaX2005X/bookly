document.addEventListener("DOMContentLoaded", () => {
  fetchBorrowedBooks();
  fetchTransactionHistory();
  updateAuthButtons();
});

async function fetchBorrowedBooks() {
  try {
    const response = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    if (response.ok && data.data) {
      renderBorrowedBooks(data.data.borrowedBooks);
    }
  } catch (error) {
    console.error("Error fetching borrowed books:", error);
  }
}

function renderBorrowedBooks(books) {
  const container = document.getElementById("borrowed-books");
  if (!container) return;
  container.innerHTML = books.map(book => `
    <div class="book-card">
      <img src="${book.coverUrl}" alt="${book.title} cover">
      <h3>${book.title}</h3>
      <p>By ${book.authors.join(", ")}</p>
      <button onclick="returnBook('${book._id}')">Return</button>
    </div>
  `).join("");
}

async function returnBook(bookId) {
  try {
    await fetch(`/api/transactions/return?bookId=${bookId}`, { method: "PUT", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
    fetchBorrowedBooks();
  } catch (error) {
    console.error("Error returning book:", error);
  }
}

function updateAuthButtons() {
  const token = localStorage.getItem("token");
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  if (token) {
    loginBtn.textContent = "Logout";
    loginBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "/index.html";
    });
    registerBtn.style.display = "none";
  } else {
    loginBtn.textContent = "Login";
    registerBtn.style.display = "inline-block";
  }
}