document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
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
    const stats = await response.json();
    if (response.ok) {
      renderStats(stats);
      renderChart(stats);
    } else {
      notify(stats.error || "Failed to load stats", "error");
    }
  } catch (err) {
    console.error("Error:", err);
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
  `;
}

function renderChart(stats) {
  const ctx = document.getElementById("statsChart").getContext("2d");
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Books', 'Users', 'Transactions'],
      datasets: [{
        label: 'Total Count',
        data: [stats.totalBooks, stats.totalUsers, stats.totalTransactions],
        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe'],
      }]
    },
  });
}