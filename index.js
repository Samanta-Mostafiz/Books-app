const apiUrl = "https://gutendex.com/books";
let books = JSON.parse(localStorage.getItem("books")) || [];
let filteredBooks = [];
let currentPage = 1;
const booksPerPage = 10;
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let isLoading = false;
let currentState = "home";

function debounce(func, delay) {
  let debounceTimer;
  return function () {
    const context = this;
    const arg = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, arg), delay);
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

// data fetching
async function fetchBooks() {
  if (books.length === 0) {
    showLoading();
    const response = await fetch(apiUrl);
    const data = await response.json();
    books = data.results;
    localStorage.setItem("books", JSON.stringify(books));
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

    const bookImage =
      book.formats["image/jpeg"] || "path/to/placeholder-image.jpg";

    const isInWishlist = wishlist.some(
      (wishlistBook) => wishlistBook.id === book.id
    );

    bookCard.innerHTML = `
      <img src="${bookImage}" alt="${book.title}" />
      <h3>${book.title}</h3>
      <p>Author: ${
        book.authors.length > 0 ? book.authors[0].name : "Unknown"
      }</p>
      <p>Genre: ${
        book.subjects.length > 0 ? book.subjects.join(", ") : "N/A"
      }</p>
      <button onclick="toggleWishlist(${book.id})">${
      isInWishlist ? "📕" : "📖"
    }</button>
    `;
    booksList.appendChild(bookCard);
  });

  updatePaginationControls(filteredBooks.length);
}

function displayWishlist() {
  const booksList = document.getElementById("books-list");
  booksList.innerHTML = "";

  if (wishlist.length === 0) {
    booksList.innerHTML = "<p>No books in your wishlist yet!</p>";
    return;
  }

  wishlist.forEach((book) => {
    if (book && book.formats) {
      const bookCard = document.createElement("div");
      bookCard.classList.add("book-card");

      const bookImage =
        book.formats["image/jpeg"] || "path/to/placeholder-image.jpg";

      bookCard.innerHTML = `
        <img src="${bookImage}" alt="${book.title}" />
        <h3>${book.title}</h3>
        <p>Author: ${
          book.authors.length > 0 ? book.authors[0].name : "Unknown"
        }</p>
        <p>Genre: ${
          book.subjects.length > 0 ? book.subjects.join(", ") : "N/A"
        }</p>
        <button onclick="toggleWishlist(${book.id})">💖</button>
      `;
      booksList.appendChild(bookCard);
    } else {
      console.warn("Book is undefined or missing required properties", book);
    }
  });
}

function updatePaginationControls(totalBooks) {
  document.getElementById("page-number").textContent = `Page ${currentPage}`;
  const totalPages = Math.ceil(totalBooks / booksPerPage);

  document.getElementById("prev-page").disabled = currentPage === 1;
  document.getElementById("next-page").disabled = currentPage === totalPages;
}

function toggleWishlist(bookId) {
  const bookToAdd =
    books.find((book) => book.id === bookId) ||
    filteredBooks.find((book) => book.id === bookId);

  if (!bookToAdd) {
    console.error("Book not found");
    return;
  }

  const wishlistIndex = wishlist.findIndex((book) => book.id === bookId);

  if (wishlistIndex !== -1) {
    wishlist.splice(wishlistIndex, 1);
  } else {
    wishlist.push({ ...bookToAdd });
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  console.log("Wishlist updated:", wishlist);

  if (currentState === "home") {
    displayBooks(filteredBooks);
  } else {
    displayWishlist();
  }
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
    const matchedSearch = book.title.toLowerCase().includes(query);
    const matchedGenre = genre
      ? book.subjects.some((subject) => subject.toLowerCase().includes(genre))
      : true;
    return matchedSearch && matchedGenre;
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

document.getElementById("home").addEventListener("click", () => {
  currentState = "home";
  currentPage = 1;
  displayBooks(filteredBooks);
});

document.getElementById("wishlist").addEventListener("click", () => {
  current = "wishlist";
  console.log("Displaying wishlist");
  displayWishlist();
});

fetchBooks();
