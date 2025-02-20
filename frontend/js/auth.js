import { notify } from './notify.js';

const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const loginModal = document.getElementById("login-modal");
const registerModal = document.getElementById("register-modal");
const closeBtns = document.querySelectorAll(".close");

function ensureMainPage() {
  if (!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/") {
    window.location.href = "/index.html?modal=login";
    return false;
  }
  return true;
}

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const token = localStorage.getItem("token");
    if (token) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      notify("Logged out successfully.", "success");
      updateAuthButtons();
      window.location.href = "/index.html";
    } else {
      if (ensureMainPage()) {
        loginModal.style.display = "block";
      }
    }
  });
}

if (registerBtn) {
  registerBtn.addEventListener("click", () => {
    if (ensureMainPage()) {
      registerModal.style.display = "block";
    }
  });
}

closeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    loginModal.style.display = "none";
    registerModal.style.display = "none";
  });
});

window.addEventListener("click", (e) => {
  if (e.target === loginModal || e.target === registerModal) {
    loginModal.style.display = "none";
    registerModal.style.display = "none";
  }
});

if (document.getElementById("login-form")) {
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        notify("Login successful!", "success");
        updateAuthButtons();
        if (data.user.role === "admin") {
          window.location.href = "/admin-users.html";
        } else if (data.user.role === "librarian") {
          window.location.href = "/librarian.html";
        } else {
          window.location.href = "/catalog.html";
        }
      } else {
        notify(data.error || "Login failed", "error");
      }
    } catch (err) {
      notify("An error occurred. Please try again.", "error");
    }
  });
}

if (document.getElementById("register-form")) {
  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const roleSelect = document.getElementById("register-role");
    const role = roleSelect ? roleSelect.value : "user";
    const employeeIdInput = document.getElementById("register-employeeId");
    const employeeId = employeeIdInput ? employeeIdInput.value : "";
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, employeeId }),
      });
      const data = await response.json();
      if (response.ok) {
        notify("Registration successful! Please login.", "success");
        registerModal.style.display = "none";
      } else {
        notify(data.error || "Registration failed", "error");
      }
    } catch (err) {
      notify("An error occurred. Please try again.", "error");
    }
  });
}

function updateAuthButtons() {
  const token = localStorage.getItem("token");
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  if (loginBtn && registerBtn) {
    if (token) {
      loginBtn.textContent = "Logout";
      registerBtn.style.display = "none";
    } else {
      loginBtn.textContent = "Login";
      registerBtn.style.display = "inline-block";
    }
  }
}

async function checkUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const response = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await response.json();
    if (response.ok && user.data) {
      if (user.data.role === "admin" || user.data.id === "admin") {
        document.getElementById("admin-link").style.display = "block";
      } else {
        document.getElementById("admin-link").style.display = "none";
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token && !window.location.pathname.endsWith("index.html")) {
    window.location.href = "/index.html";
  }
  updateAuthButtons();
  checkUserRole();
  const params = new URLSearchParams(window.location.search);
  const modal = params.get("modal");
  if (modal === "login") {
    loginModal.style.display = "block";
  } else if (modal === "register") {
    registerModal.style.display = "block";
  }
});