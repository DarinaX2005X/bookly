export function notify(message, type = "success") {
  const container = document.querySelector(".notification-container") || createNotificationContainer();
  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;
  const timer = document.createElement("div");
  timer.className = "timer";
  notif.appendChild(timer);
  container.appendChild(notif);

  const notificationData = { message, type, timestamp: Date.now() };
  let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  notifications.push(notificationData);
  localStorage.setItem("notifications", JSON.stringify(notifications));

  setTimeout(() => {
    notif.style.opacity = "0";
    setTimeout(() => {
      notif.remove();
      notifications = notifications.filter(n => n.timestamp !== notificationData.timestamp);
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }, 500);
  }, 2000);
}

function createNotificationContainer() {
  const container = document.createElement("div");
  container.className = "notification-container";
  document.body.appendChild(container);
  return container;
}

document.addEventListener("DOMContentLoaded", () => {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  notifications.forEach(n => {
    const elapsed = Date.now() - n.timestamp;
    if (elapsed < 5000) {
      notify(n.message, n.type);
      setTimeout(() => {
        const notif = document.querySelector(`.notification:contains("${n.message}")`);
        if (notif) notif.remove();
      }, 2000 - elapsed);
    }
  });
});