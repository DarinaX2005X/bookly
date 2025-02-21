import { notify } from './notify.js';

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    window.location.href = "/index.html";
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
    <div class="stat-card">
      <h3>Total Books</h3>
      <p>${stats.totalBooks}</p>
    </div>
    <div class="stat-card">
      <h3>Total Users</h3>
      <p>${stats.totalUsers}</p>
    </div>
    <div class="stat-card">
      <h3>Total Transactions</h3>
      <p>${stats.totalTransactions}</p>
    </div>
    <div class="stat-card">
      <h3>Overdue Books</h3>
      <p>${stats.overdueBooks}</p>
    </div>
    <div class="stat-card">
      <h3>Avg Borrow Duration</h3>
      <p>${stats.avgBorrowDuration.toFixed(2)} days</p>
    </div>
    <div class="stat-card">
      <h2>Most Borrowed Books</h2>
      ${stats.mostBorrowedBooks.map(book => `<p>${book.title}: ${book.count}</p>`).join('')}
    </div>
    <div class="stat-card">
      <h2>Most Active Users</h2>
      ${stats.mostActiveUsers.map(user => `<p>${user.name}: ${user.count}</p>`).join('')}
    </div>
    <div class="stat-card">
      <h2>Popular Genres</h2>
      ${stats.popularGenres.map(genre => `<p>${genre}</p>`).join('')}
    </div>
    <canvas id="statsChart" width="400" height="200"></canvas>
  `;

  const ctx = document.getElementById("statsChart").getContext("2d");
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Books', 'Users', 'Transactions', 'Overdue'],
      datasets: [{
        label: 'Total Count',
        data: [stats.totalBooks, stats.totalUsers, stats.totalTransactions, stats.overdueBooks],
        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });
}