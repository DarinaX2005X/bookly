document.addEventListener("DOMContentLoaded", () => {
  loadAdminContent();
  setupTabs();
});

function setupTabs() {
  document.querySelectorAll('.tab-link').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      loadContent(tabName);
    });
  });
}

async function loadAdminContent() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/index.html";
    return;
  }
  loadContent('users');  // Default tab
}

async function loadContent(tab) {
  const contentArea = document.getElementById('content-area');
  switch(tab) {
    case 'users':
      contentArea.innerHTML = await fetchUsersContent();
      break;
    case 'transactions':
      contentArea.innerHTML = await fetchTransactionsContent();
      break;
    case 'librarians':
      contentArea.innerHTML = await fetchLibrariansContent();
      break;
    case 'stats':
      contentArea.innerHTML = await fetchStatsContent();
      setTimeout(renderStatsChart, 0);
      break;
  }
}

async function fetchUsersContent() {
  const response = await fetch("/api/admin/users", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const data = await response.json();
  if (data.success) {
    return data.data.map(user => `<p>${user.name} - ${user.email}</p>`).join('');
  } else {
    return '<p>Failed to load users</p>';
  }
}

// Similar updates for transactions and librarians
async function fetchTransactionsContent() {
  const response = await fetch("/api/admin/transactions", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const data = await response.json();
  if (data.success) {
    return data.data.map(transaction => `<p>User: ${transaction.user.name}, Book: ${transaction.book.title}, Date: ${transaction.borrowDate}</p>`).join('');
  } else {
    return '<p>Failed to load transactions</p>';
  }
}

async function fetchLibrariansContent() {
  const response = await fetch("/api/admin/librarians", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const data = await response.json();
  if (data.success) {
    return data.data.map(librarian => `<p>${librarian.name} - ID: ${librarian.employeeId}</p>`).join('');
  } else {
    return '<p>Failed to load librarians</p>';
  }
}

async function fetchStatsContent() {
  try {
    const response = await fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const { data: stats } = await response.json();
    if (!stats) throw new Error("Stats data missing or empty");
    return `
      <h2>Library Statistics</h2>
      <p>Total Books: ${stats.totalBooks || 'N/A'}</p>
      <p>Total Users: ${stats.totalUsers || 'N/A'}</p>
      <p>Total Transactions: ${stats.totalTransactions || 'N/A'}</p>
      <p>Popular Genres: ${(stats.popularGenres || []).join(", ") || 'N/A'}</p>
      <canvas id="statsChart"></canvas>
    `;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return '<p>Failed to load statistics</p>';
  }
}

function renderStatsChart() {
  const canvas = document.getElementById("statsChart");
  if (canvas) {
    const ctx = canvas.getContext("2d");
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
  } else {
    console.error("Chart canvas not found");
  }
}

// Add event listener for logout
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/index.html";
});