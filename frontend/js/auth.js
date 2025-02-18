// Функция уведомлений – уведомление отображается 10 секунд
function notify(message, type = "success") {
  const container = document.querySelector(".notification-container") || createNotificationContainer();
  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;
  // Добавляем таймер (прогресс-бар)
  const timer = document.createElement("div");
  timer.className = "timer";
  notif.appendChild(timer);
  container.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = "0";
    setTimeout(() => notif.remove(), 500);
  }, 10000); // 10 секунд
}

function createNotificationContainer() {
  const container = document.createElement("div");
  container.className = "notification-container";
  document.body.appendChild(container);
  return container;
}

// Если мы не на главной странице (index.html), перенаправляем на главную с query-параметром modal
function ensureMainPage() {
  if (!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/") {
    window.location.href = "/index.html?modal=login";
    return false;
  }
  return true;
}

// DOM Elements
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const loginModal = document.getElementById("login-modal");
const registerModal = document.getElementById("register-modal");
const closeBtns = document.querySelectorAll(".close");

// Если не на главной, при нажатии на кнопки перенаправляем
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

registerBtn.addEventListener("click", () => {
  if (ensureMainPage()) {
    registerModal.style.display = "block";
  }
});

// Закрытие модальных окон
closeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    loginModal.style.display = "none";
    registerModal.style.display = "none";
  });
});

// Закрытие окна при клике вне модального окна
window.addEventListener("click", (e) => {
  if (e.target === loginModal || e.target === registerModal) {
    loginModal.style.display = "none";
    registerModal.style.display = "none";
  }
});

// Обработка формы логина
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
      if (data.user.role === "admin") {
        window.location.href = "/admin.html";
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

// Обработка формы регистрации
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  // Дополнительные поля для библиотекаря
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

// Обновление состояния кнопок авторизации
function updateAuthButtons() {
  const token = localStorage.getItem("token");
  if (token) {
    loginBtn.textContent = "Logout";
    registerBtn.style.display = "none";
  } else {
    loginBtn.textContent = "Login";
    registerBtn.style.display = "inline-block";
  }
}

// Проверка роли пользователя для показа ссылки на админку
async function checkUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const response = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await response.json();
    if (response.ok && user.data) {
      if(user.data.role === "admin" || user.data.id === "admin") {
        document.getElementById("admin-link").style.display = "block";
        // Скрытие ненужных страниц для админа
        document.getElementById("my-books-link").style.display = "none";
        document.querySelector('nav ul').querySelector('li a[href="/catalog.html"]').style.display = "none";
        document.querySelector('nav ul').querySelector('li a[href="/index.html"]').style.display = "none";
      } else {
        document.getElementById("admin-link").style.display = "none";
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

// При загрузке страницы проверяем, нужно ли открыть модальное окно по параметру URL
document.addEventListener("DOMContentLoaded", () => {
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