import { notify } from './notify.js';

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    window.location.href = "/index.html";
    return;
  }
  loadUsers();
  document.getElementById("search").addEventListener("input", loadUsers);
  document.getElementById("sortBy").addEventListener("change", loadUsers);
  document.getElementById("sortOrder").addEventListener("change", loadUsers);
  document.getElementById("role").addEventListener("change", loadUsers);
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    notify("Logged out successfully!", "success");
    window.location.href = "/index.html";
  });
});

async function loadUsers() {
  const token = localStorage.getItem("token");
  if (!token) {
    notify("Please login to access the admin panel.", "error");
    window.location.href = "/index.html";
    return;
  }

  const search = document.getElementById("search").value;
  const sortBy = document.getElementById("sortBy").value;
  const sortOrder = document.getElementById("sortOrder").value;
  const role = document.getElementById("role").value;

  try {
    const url = `/api/admin/users?${search ? `search=${encodeURIComponent(search)}&` : ''}sortBy=${sortBy}&sortOrder=${sortOrder}${role ? `&role=${role}` : ''}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      renderUsers(data.data);
    } else {
      notify(data.error || "Failed to load users", "error");
    }
  } catch (err) {
    notify("An error occurred. Please try again.", "error");
  }
}

function renderUsers(users) {
  const tbody = document.querySelector("#users-table tbody");
  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${user.borrowedBooks.length}</td>
    </tr>
  `).join("");
}