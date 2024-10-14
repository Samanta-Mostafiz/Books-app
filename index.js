const apiUrl = 'https://gutendex.com/books';
let books = [];
let filteredBooks = [];
let currentPage = 1;
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Fetch books from API
async function fetchBooks(page = 1) {
  const response = await fetch(`${apiUrl}?page=${page}`);
  const data = await response.json();
  books = data.results;
  filteredBooks = books;
  displayBooks(books);
}

// Display books in DOM
function displayBooks(books) {
  const booksList = document.getElementById('books-list');
  booksList.innerHTML = '';
  books.forEach((book) => {
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

// Search books by title
document.getElementById('search').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm)
  );
  displayBooks(filteredBooks);
});

// Filter books by genre
document.getElementById('genre-filter').addEventListener('change', (e) => {
  const selectedGenre = e.target.value;
  filteredBooks = selectedGenre
    ? books.filter((book) => book.subjects.includes(selectedGenre))
    : books;
  displayBooks(filteredBooks);
});

// Pagination
document.getElementById('next-page').addEventListener('click', () => {
  currentPage++;
  fetchBooks(currentPage);
  document.getElementById('page-number').textContent = `Page ${currentPage}`;
});

document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchBooks(currentPage);
    document.getElementById('page-number').textContent = `Page ${currentPage}`;
  }
});

//  fetching books
fetchBooks();

// Wishlist
document.getElementById('wishlist-link').addEventListener('click', () => {
  const wishlistBooks = books.filter((book) => wishlist.includes(book.id));
  displayBooks(wishlistBooks);
});

document.getElementById('home-link').addEventListener('click', () => {
  displayBooks(filteredBooks);
});
