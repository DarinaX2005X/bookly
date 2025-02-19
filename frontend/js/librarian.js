import { notify } from './auth.js';

document.addEventListener("DOMContentLoaded", () => {
    setupLibrarianUI();
    viewCatalog(); // Show catalog on page load
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
        <span class="close">&times;</span>
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
          viewCatalog(); // Refresh catalog after creation
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
  
        // Event listeners for buttons
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
    // Implement book editing logic here
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
          viewCatalog(); // Refresh catalog after deletion
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
        viewCatalog(); // Refresh catalog after update
      } else {
        notify(data.error || "Failed to update book copies", "error");
      }
    } catch (error) {
      notify("An error occurred. Please try again.", "error");
    }
  }