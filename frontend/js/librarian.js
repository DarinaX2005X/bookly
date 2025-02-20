// Ensure notify is defined or imported from auth.js if shared
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
  }, 5000);
}

function createNotificationContainer() {
  const container = document.createElement("div");
  container.className = "notification-container";
  document.body.appendChild(container);
  return container;
}

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "librarian") {
    window.location.href = role === "admin" ? "/admin.html" : "/catalog.html";
    return;
  }
  setupLibrarianUI();
  viewCatalog(); // Show catalog on page load

  document.getElementById("create-book-btn").addEventListener("click", createBook);
  document.getElementById("view-catalog-btn").addEventListener("click", viewCatalog);
});

function setupLibrarianUI() {
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/index.html";
  });
}

function createBook() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">×</span>
      <h2>Create New Book</h2>
      <form id="create-book-form">
        <input type="text" id="title" placeholder="Title" required>
        <input type="text" id="author" placeholder="Author" required>
        <input type="text" id="isbn" placeholder="ISBN" required>
        <input type="number" id="publishedYear" placeholder="Published Year" required>
        <input type="text" id="publisher" placeholder="Publisher" required>
        <input type="text" id="genres" placeholder="Genres (comma separated)" required>
        <input type="number" id="copies" placeholder="Number of Copies" required>
        <button type="submit">Create Book</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  document.querySelector('.modal .close').addEventListener('click', () => {
    modal.style.display = 'none';
    modal.remove();
  });

  document.getElementById('create-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const bookDetails = {
      title: document.getElementById('title').value,
      authors: [document.getElementById('author').value],
      isbn: document.getElementById('isbn').value,
      publishedYear: parseInt(document.getElementById('publishedYear').value),
      publisher: document.getElementById('publisher').value,
      genres: document.getElementById('genres').value.split(','),
      copies: parseInt(document.getElementById('copies').value),
      availableCopies: parseInt(document.getElementById('copies').value)
    };

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookDetails)
      });
      const data = await response.json();
      if (response.ok) {
        notify("Book created successfully!", "success");
        modal.style.display = 'none';
        modal.remove();
        viewCatalog();
      } else {
        notify(data.error || "Failed to create book", "error");
      }
    } catch (err) {
      notify("An error occurred. Please try again.", "error");
    }
  });

  modal.style.display = "block";
}

async function viewCatalog() {
  const contentArea = document.getElementById('book-management');
  try {
    const response = await fetch('/api/books', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    if (data.success) {
      contentArea.innerHTML = data.data.map(book => `
        <div class="book-card" data-id="${book._id}">
          <img src="${book.coverUrl}" alt="${book.title} cover">
          <h3>${book.title}</h3>
          <p>By ${book.authors.join(", ")}</p>
          <p>Available Copies: ${book.availableCopies}</p>
          <button class="btn-edit">Edit</button>
          <button class="btn-delete">Delete</button>
          <button class="btn-update-copies">Update Copies</button>
        </div>
      `).join('');

      document.querySelectorAll('.book-card').forEach(card => {
        const id = card.dataset.id;
        card.querySelector('.btn-edit').addEventListener('click', () => editBook(id));
        card.querySelector('.btn-delete').addEventListener('click', () => deleteBook(id));
        card.querySelector('.btn-update-copies').addEventListener('click', () => updateCopies(id));
      });
    }
  } catch (error) {
    notify("Failed to fetch books", "error");
  }
}

function editBook(id) {
  // Placeholder for edit functionality
  console.log('Edit book:', id);
}

async function deleteBook(id) {
  if (confirm("Are you sure you want to delete this book?")) {
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        notify("Book deleted successfully!", "success");
        viewCatalog();
      } else {
        notify(data.error || "Failed to delete book", "error");
      }
    } catch (error) {
      notify("An error occurred. Please try again.", "error");
    }
  }
}

function updateCopies(id) {
  const newCopies = prompt("Enter new number of copies:");
  if (newCopies !== null && !isNaN(newCopies)) {
    updateBookCopies(id, parseInt(newCopies));
  }
}

async function updateBookCopies(id, copies) {
  try {
    const response = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ availableCopies: copies, copies: copies })
    });
    const data = await response.json();
    if (response.ok) {
      notify("Book copies updated successfully!", "success");
      viewCatalog();
    } else {
      notify(data.error || "Failed to update book copies", "error");
    }
  } catch (error) {
    notify("An error occurred. Please try again.", "error");
  }
}