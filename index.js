const apiUrl = "https://gutendex.com/books";
let books = JSON.parse(localStorage.getItem("books")) || [];
let filteredBooks = [];
let currentPage = 1;
const booksPerPage = 10;
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let isLoading = false;

function debounce(func, delay) {
  let debounceTimer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

function showLoading() {
  const loadingElement = document.getElementById("loading");
  loadingElement.style.display = "block";
  isLoading = true;
}

function hideLoading() {
  const loadingElement = document.getElementById("loading");
  loadingElement.style.display = "none";
  isLoading = false;
}

async function fetchBooks() {
  if (books.length === 0) {
    showLoading();
    const response = await fetch(apiUrl);
    const data = await response.json();
    books = data.results;
    localStorage.setItem("books", JSON.stringify(books)); // Cache data
    hideLoading();
  }

  filteredBooks = books;
  displayBooks(filteredBooks);
}

function displayBooks(books) {
  const booksList = document.getElementById("books-list");
  booksList.innerHTML = "";

  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const booksToShow = books.slice(startIndex, endIndex);

  booksToShow.forEach((book) => {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");

    bookCard.innerHTML = `
      <img src="${book.formats["image/jpeg"]}" alt="${book.title}" />
      <h3>${book.title}</h3>
      <p>Author: ${
        book.authors.length > 0 ? book.authors[0].name : "Unknown"
      }</p>
      <p>Genre: ${
        book.subjects.length > 0 ? book.subjects.join(", ") : "N/A"
      }</p>
      <button onclick="toggleWishlist(${book.id})">${
      wishlist.includes(book.id) ? "💖" : "🤍"
    }</button>
    `;
    booksList.appendChild(bookCard);
  });

  updatePaginationControls(filteredBooks.length);
}

function updatePaginationControls(totalBooks) {
  document.getElementById("page-number").textContent = `Page ${currentPage}`;

  const totalPages = Math.ceil(totalBooks / booksPerPage);

  document.getElementById("prev-page").disabled = currentPage === 1;
  document.getElementById("next-page").disabled = currentPage === totalPages;
}

function toggleWishlist(bookId) {
  if (wishlist.includes(bookId)) {
    wishlist = wishlist.filter((id) => id !== bookId);
  } else {
    wishlist.push(bookId);
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  displayBooks(filteredBooks);
}

const searchInput = document.getElementById("search");
searchInput.addEventListener(
  "input",
  debounce(function () {
    currentPage = 1;
    filterBooks();
  }, 300)
);

const genreFilter = document.getElementById("genre-filter");
genreFilter.addEventListener("change", function () {
  currentPage = 1;
  filterBooks();
});

function filterBooks() {
  const query = searchInput.value.toLowerCase();
  const genre = genreFilter.value.toLowerCase();
  filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(query);
    const matchesGenre = genre
      ? book.subjects.some((subject) => subject.toLowerCase().includes(genre))
      : true;
    return matchesSearch && matchesGenre;
  });

  displayBooks(filteredBooks);
  updatePaginationControls(filteredBooks.length);
  scrollToTop();
}

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayBooks(filteredBooks);
    updatePaginationControls(filteredBooks.length);
    scrollToTop();
  }
});

document.getElementById("next-page").addEventListener("click", () => {
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayBooks(filteredBooks);
    updatePaginationControls(filteredBooks.length);
    scrollToTop();
  }
});

function scrollToTop() {
  window.scrollTo(0, 0);
}

fetchBooks();
