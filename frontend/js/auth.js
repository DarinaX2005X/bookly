function notify(message, type = "success") {
  const container = document.querySelector(".notification-container") || createNotificationContainer();
  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;
  const timer = document.createElement("div");
  timer.className = "timer";
  notif.appendChild(timer);
  container.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = "0";
    setTimeout(() => notif.remove(), 500);
  }, 2000);
}

function createNotificationContainer() {
  const container = document.createElement("div");
  container.className = "notification-container";
  document.body.appendChild(container);
  return container;
}

function ensureMainPage() {
  if (!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/") {
    window.location.href = "/index.html?modal=login";
    return false;
  }
  return true;
}

const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const loginModal = document.getElementById("login-modal");
const registerModal = document.getElementById("register-modal");
const closeBtns = document.querySelectorAll(".close");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const token = localStorage.getItem("token");
    if (token) {
      localStorage.removeItem("token");
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
        notify("Login successful!", "success");
        updateAuthButtons();
        if (data.user && data.user.role === "admin") {
          window.location.href = "/admin.html";
          console.log(data.user);
          console.log(data.user.role);
        } else if (data.user && data.user.role === "librarian") {
          window.location.href = "/librarian.html";
        } else {
          window.location.href = "/catalog.html";
        }
      } else {
        notify(data.error || "Login failed", "error");
      }
    } catch (err) {
      console.error("Error:", err);
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
      console.error("Error:", err);
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

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token && !window.location.pathname.endsWith("index.html")) {
    window.location.href = "/index.html";
  }
  updateAuthButtons();
});