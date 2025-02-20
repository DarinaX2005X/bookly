import { notify } from './notify.js';

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    window.location.href = "/index.html";
    return;
  }
  loadLibrarians();
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    notify("Logged out successfully!", "success");
    window.location.href = "/index.html";
  });
});

async function loadLibrarians() {
  const token = localStorage.getItem("token");
  if (!token) {
    notify("Please login to access the admin panel.", "error");
    window.location.href = "/index.html";
    return;
  }
  try {
    const response = await fetch("/api/admin/librarians", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      renderLibrarians(data.data);
    } else {
      notify(data.error || "Failed to load librarians", "error");
    }
  } catch (err) {
    notify("An error occurred. Please try again.", "error");
  }
}

function renderLibrarians(librarians) {
  const tbody = document.querySelector("#librarians-table tbody");
  tbody.innerHTML = librarians.map(librarian => `
    <tr>
      <td>${librarian.name}</td>
      <td>${librarian.email}</td>
      <td>${librarian.employeeId}</td>
    </tr>
  `).join("");
}