const apiUrl = 'https://gutendex.com/books';
let books = [];
let filteredBooks = [];
let currentPage = 1;
const booksPerPage = 10; // Show 10 books per page
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Debounce function to limit search API calls
function debounce(func, delay) {
  let debounceTimer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

// Fetch books from API
async function fetchBooks(page = 1) {
  const response = await fetch(`${apiUrl}?page=${page}`);
  const data = await response.json();
  books = data.results;
  filteredBooks = books;
  displayBooks(filteredBooks);
}

// Display books in DOM with pagination
function displayBooks(books) {
  const booksList = document.getElementById('books-list');
  booksList.innerHTML = '';

  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const booksToShow = books.slice(startIndex, endIndex);

  booksToShow.forEach((book) => {
    const bookCard = document.createElement('div');
    bookCard.classList.add('book-card');

    bookCard.innerHTML = `
      <img src="${book.formats['image/jpeg']}" alt="${book.title}" />
      <h3>${book.title}</h3>
      <p>Author: ${book.authors.length > 0 ? book.authors[0].name : 'Unknown'}</p>
      <p>Genre: ${book.subjects.length > 0 ? book.subjects[0] : 'N/A'}</p>
      <button onclick="toggleWishlist(${book.id})">${wishlist.includes(book.id) ? '💖' : '🤍'}</button>
    `;
    booksList.appendChild(bookCard);
  });

  updatePaginationControls(books.length);
}

// Update pagination controls (enable/disable buttons based on current page)
function updatePaginationControls(totalBooks) {
  document.getElementById('page-number').textContent = `Page ${currentPage}`;
  
  const totalPages = Math.ceil(totalBooks / booksPerPage);
  
  document.getElementById('prev-page').disabled = currentPage === 1;
  document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Toggle wishlist
function toggleWishlist(bookId) {
  if (wishlist.includes(bookId)) {
    wishlist = wishlist.filter((id) => id !== bookId);
  } else {
    wishlist.push(bookId);
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  displayBooks(filteredBooks);
}

// Search books by title with debounce
document.getElementById('search').addEventListener('input', debounce((e) => {
  const searchTerm = e.target.value.toLowerCase();
  saveSearchHistory(searchTerm);
  filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm)
  );
  currentPage = 1; // Reset to first page after search
  displayBooks(filteredBooks);
}, 300));

// Filter books by genre
document.getElementById('genre-filter').addEventListener('change', (e) => {
  const selectedGenre = e.target.value;
  filteredBooks = selectedGenre
    ? books.filter((book) => book.subjects.includes(selectedGenre))
    : books;
  currentPage = 1; // Reset to first page after filter change
  displayBooks(filteredBooks);
});

// Pagination - Next and Previous buttons
document.getElementById('next-page').addEventListener('click', () => {
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayBooks(filteredBooks);
  }
});

document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayBooks(filteredBooks);
  }
});

// Save search term to localStorage and update UI
function saveSearchHistory(searchTerm) {
  if (searchTerm && !searchHistory.includes(searchTerm)) {
    searchHistory.push(searchTerm);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }
}

// Fetch books
fetchBooks();

// Wishlist
document.getElementById('wishlist-link').addEventListener('click', () => {
  const wishlistBooks = books.filter((book) => wishlist.includes(book.id));
  currentPage = 1; // Reset to first page when displaying wishlist
  displayBooks(wishlistBooks);
});

// Home link restores filteredBooks
document.getElementById('home-link').addEventListener('click', () => {
  currentPage = 1; // Reset to first page when displaying home
  displayBooks(filteredBooks);
});

// Retrieve search history from localStorage
function loadSearchHistory() {
  if (searchHistory.length > 0) {
    const lastSearch = searchHistory[searchHistory.length - 1];
    document.getElementById('search').value = lastSearch;
    filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(lastSearch)
    );
    displayBooks(filteredBooks);
  }
}

// Load search history on page load
window.onload = () => {
  loadSearchHistory();
};
