document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    window.location.href = role === "librarian" ? "/librarian.html" : "/catalog.html";
    return;
  }
  loadStats();
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    notify("Logged out successfully!", "success");
    window.location.href = "/index.html";
  });
});

async function loadStats() {
  const token = localStorage.getItem("token");
  if (!token) {
    notify("Please login to access the admin panel.", "error");
    window.location.href = "/index.html";
    return;
  }
  try {
    const response = await fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      renderStats(data.data);
    } else {
      notify(data.error || "Failed to load stats", "error");
    }
  } catch (err) {
    notify("An error occurred. Please try again.", "error");
  }
}

function renderStats(stats) {
  const container = document.getElementById("stats");
  container.innerHTML = `
    <h2>Library Statistics</h2>
    <p>Total Books: ${stats.totalBooks}</p>
    <p>Total Users: ${stats.totalUsers}</p>
    <p>Total Transactions: ${stats.totalTransactions}</p>
    <p>Popular Genres: ${stats.popularGenres.join(", ")}</p>
    <p>Overdue Books: ${stats.overdueBooks}</p>
    <h3>Most Borrowed Books</h3>
    <ul>${stats.mostBorrowedBooks.map(book => `<li>${book.title}: ${book.count}</li>`).join('')}</ul>
  `;
}

// Add event listener for logout
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/index.html";
});