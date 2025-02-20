import { notify } from './notify.js';

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "librarian") {
    window.location.href = "/index.html";
    return;
  }
  setupLibrarianUI();
  viewCatalog();
});

function setupLibrarianUI() {
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    notify("Logged out successfully!", "success");
    window.location.href = "/index.html";
  });
  document.querySelector('a[href="#create"]').addEventListener("click", (e) => {
    e.preventDefault();
    createBook();
  });

  document.getElementById("book-management").addEventListener("click", (e) => {
    const card = e.target.closest(".book-card");
    if (card && !e.target.classList.contains("btn-edit") && !e.target.classList.contains("btn-delete") && !e.target.classList.contains("copy-btn")) {
      const details = card.querySelector(".book-details");
      if (details) {
        details.style.display = details.style.display === "block" ? "none" : "block";
      }
    }
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
        <input type="file" id="coverImage" accept="image/*">
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
    const formData = new FormData();
    formData.append("title", document.getElementById('title').value);
    formData.append("authors", JSON.stringify([document.getElementById('author').value]));
    formData.append("isbn", document.getElementById('isbn').value);
    formData.append("publishedYear", parseInt(document.getElementById('publishedYear').value));
    formData.append("publisher", document.getElementById('publisher').value);
    formData.append("genres", JSON.stringify(document.getElementById('genres').value.split(',')));
    formData.append("copies", parseInt(document.getElementById('copies').value));
    formData.append("availableCopies", parseInt(document.getElementById('copies').value));
    const coverImage = document.getElementById('coverImage').files[0];
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` },
        body: formData,
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
          <h3>${book.title.slice(0, 100)}</h3>
          <p>By ${book.authors.join(", ").slice(0, 100)}</p>
          <div class="copy-controls">
            <span>Available Copies:</span>
            <button class="copy-btn" data-action="decrease">-</button>
            <span>${book.availableCopies}</span>
            <button class="copy-btn" data-action="increase">+</button>
          </div>
          <button class="btn-edit">Edit</button>
          <button class="btn-delete">Delete</button>
          <div class="book-details">
            <p><strong>ISBN:</strong> ${book.isbn}</p>
            <p><strong>Publisher:</strong> ${book.publisher}</p>
            <p><strong>Published Year:</strong> ${book.publishedYear}</p>
            <p><strong>Genres:</strong> ${book.genres.join(", ")}</p>
            <p><strong>Total Copies:</strong> ${book.copies}</p>
            <p><strong>Available Copies:</strong> ${book.availableCopies}</p>
            <p><strong>Description:</strong> ${book.description || "No description available."}</p>
          </div>
        </div>
      `).join('');

      document.querySelectorAll('.book-card').forEach(card => {
        const id = card.dataset.id;
        card.querySelector('.btn-edit').addEventListener('click', () => editBook(id));
        card.querySelector('.btn-delete').addEventListener('click', () => deleteBook(id));
        card.querySelectorAll('.copy-btn').forEach(btn => {
          btn.addEventListener('click', () => updateCopies(id, btn.dataset.action));
        });
      });
    }
  } catch (error) {
    notify("Failed to fetch books", "error");
  }
}

function editBook(id) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">×</span>
      <h2>Edit Book</h2>
      <form id="edit-book-form">
        <input type="text" id="edit-title" placeholder="Title" required>
        <input type="text" id="edit-author" placeholder="Author" required>
        <input type="text" id="edit-isbn" placeholder="ISBN" required>
        <input type="number" id="edit-publishedYear" placeholder="Published Year" required>
        <input type="text" id="edit-publisher" placeholder="Publisher" required>
        <input type="text" id="edit-genres" placeholder="Genres (comma separated)" required>
        <input type="number" id="edit-copies" placeholder="Number of Copies" required>
        <input type="file" id="edit-coverImage" accept="image/*">
        <button type="submit">Update Book</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  document.querySelector('.modal .close').addEventListener('click', () => {
    modal.style.display = 'none';
    modal.remove();
  });

  fetch(`/api/books/${id}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        document.getElementById('edit-title').value = data.data.title;
        document.getElementById('edit-author').value = data.data.authors[0];
        document.getElementById('edit-isbn').value = data.data.isbn;
        document.getElementById('edit-publishedYear').value = data.data.publishedYear;
        document.getElementById('edit-publisher').value = data.data.publisher;
        document.getElementById('edit-genres').value = data.data.genres.join(', ');
        document.getElementById('edit-copies').value = data.data.copies;
      }
    });

  document.getElementById('edit-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", document.getElementById('edit-title').value);
    formData.append("authors", JSON.stringify([document.getElementById('edit-author').value]));
    formData.append("isbn", document.getElementById('edit-isbn').value);
    formData.append("publishedYear", parseInt(document.getElementById('edit-publishedYear').value));
    formData.append("publisher", document.getElementById('edit-publisher').value);
    formData.append("genres", JSON.stringify(document.getElementById('edit-genres').value.split(',')));
    formData.append("copies", parseInt(document.getElementById('edit-copies').value));
    formData.append("availableCopies", parseInt(document.getElementById('edit-copies').value));
    const coverImage = document.getElementById('edit-coverImage').files[0];
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        notify("Book updated successfully!", "success");
        modal.style.display = 'none';
        modal.remove();
        viewCatalog();
      } else {
        notify(data.error || "Failed to update book", "error");
      }
    } catch (err) {
      notify("An error occurred. Please try again.", "error");
    }
  });

  modal.style.display = "block";
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

async function updateCopies(id, action) {
  try {
    const response = await fetch(`/api/books/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    if (data.success) {
      let newCopies = data.data.availableCopies;
      if (action === "increase") newCopies += 1;
      if (action === "decrease") newCopies = Math.max(0, newCopies - 1);

      const updateResponse = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          availableCopies: newCopies, 
          copies: newCopies, 
          title: data.data.title, 
          authors: data.data.authors, 
          isbn: data.data.isbn, 
          publishedYear: data.data.publishedYear, 
          publisher: data.data.publisher, 
          genres: data.data.genres 
        })
      });
      const updateData = await updateResponse.json();
      if (updateResponse.ok) {
        notify("Book copies updated successfully!", "success");
        viewCatalog();
      } else {
        notify(updateData.error || "Failed to update book copies", "error");
      }
    } else {
      notify("Failed to fetch book data", "error");
    }
  } catch (error) {
    notify("An error occurred. Please try again.", "error");
  }
}