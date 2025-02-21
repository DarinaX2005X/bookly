import { notify } from './notify.js';

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    window.location.href = "/index.html";
    return;
  }
  loadTransactions();
  document.getElementById("search").addEventListener("input", loadTransactions);
  document.getElementById("sortBy").addEventListener("change", loadTransactions);
  document.getElementById("sortOrder").addEventListener("change", loadTransactions);
  document.getElementById("status").addEventListener("change", loadTransactions);
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    notify("Logged out successfully!", "success");
    window.location.href = "/index.html";
  });
});

async function loadTransactions() {
  const token = localStorage.getItem("token");
  if (!token) {
    notify("Please login to access the admin panel.", "error");
    window.location.href = "/index.html";
    return;
  }

  const search = document.getElementById("search").value;
  const sortBy = document.getElementById("sortBy").value;
  const sortOrder = document.getElementById("sortOrder").value;
  const status = document.getElementById("status").value;

  try {
    const url = `/api/admin/transactions?${search ? `search=${encodeURIComponent(search)}&` : ''}sortBy=${sortBy}&sortOrder=${sortOrder}${status ? `&status=${status}` : ''}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      renderTransactions(data.data);
    } else {
      notify(data.error || "Failed to load transactions", "error");
    }
  } catch (err) {
    notify("An error occurred. Please try again.", "error");
  }
}

function renderTransactions(transactions) {
  const tbody = document.querySelector("#transactions-table tbody");
  tbody.innerHTML = transactions.map(transaction => `
    <tr>
      <td>${transaction.user.name}</td>
      <td>${transaction.book.title}</td>
      <td>${new Date(transaction.borrowDate).toLocaleDateString()}</td>
      <td>${transaction.returnDate ? new Date(transaction.returnDate).toLocaleDateString() : "Not Returned"}</td>
      <td>${transaction.status}</td>
    </tr>
  `).join("");
}