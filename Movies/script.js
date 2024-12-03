// DOM Elements
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const typeFilter = document.getElementById("typeFilter");
const resultsContainer = document.getElementById("results");
const darkModeToggle = document.getElementById("darkModeToggle");
const languageSelector = document.getElementById("languageSelector");

// OMDB API Key
const API_KEY = "454ece3";

// Fetch Movies or TV Shows
async function fetchMovies(query, type) {
  const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=${type}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "True") {
      displayResults(data.Search);
    } else {
      resultsContainer.innerHTML = `<p>No results found for "${query}".</p>`;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    resultsContainer.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
  }
}

// Display Results
function displayResults(items) {
  resultsContainer.innerHTML = ""; // Clear previous results
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.Poster !== "N/A" ? item.Poster : "https://via.placeholder.com/300x450"}" alt="${item.Title}">
      <div class="details">
        <h2>${item.Title}</h2>
        <p><strong>Year:</strong> ${item.Year}</p>
        <p><strong>Type:</strong> ${item.Type}</p>
        <p><strong>IMDb Rating:</strong> <span class="rating">Fetching...</span></p>
        <p style="display:none;" class="description">Loading description...</p>
        <button class="show-description">Show Description</button>
      </div>
    `;
    resultsContainer.appendChild(card);

    // Fetch detailed info for IMDb Rating and Description
    fetchMovieDetails(item.imdbID, card);
  });
}

// Fetch Movie Details
async function fetchMovieDetails(imdbID, card) {
  const url = `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "True") {
      const ratingElement = card.querySelector(".rating");
      const descriptionElement = card.querySelector(".description");

      ratingElement.textContent = data.imdbRating !== "N/A" ? data.imdbRating : "Not Available";
      descriptionElement.textContent = data.Plot !== "N/A" ? data.Plot : "No description available.";
    }
  } catch (error) {
    console.error("Error fetching details:", error);
  }
}

// Event Listeners
searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  const type = typeFilter.value;

  if (query) {
    fetchMovies(query, type);
  } else {
    resultsContainer.innerHTML = "<p>Please enter a search term.</p>";
  }
});

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

languageSelector.addEventListener("change", (e) => {
  const lang = e.target.value;
  changeLanguage(lang);
});

// Change Language
function changeLanguage(lang) {
  const elements = {
    searchInput: {
      en: "Search for movies or TV shows...",
      ar: "ابحث عن الأفلام أو المسلسلات..."
    },
    searchButton: {
      en: "🔎",
      ar: "🔍"
    },
    typeFilter: {
      en: ["Movies", "TV Shows"],
      ar: ["أفلام", "مسلسلات"]
    }
  };

  searchInput.placeholder = elements.searchInput[lang];
  searchButton.textContent = elements.searchButton[lang];
  const typeOptions = elements.typeFilter[lang];
  typeFilter.options[0].textContent = typeOptions[0];
  typeFilter.options[1].textContent = typeOptions[1];
}

// Show or Hide Description
document.addEventListener("click", (e) => {
  if (e.target && e.target.classList.contains("show-description")) {
    const description = e.target.previousElementSibling;
    if (description.style.display === "none" || !description.style.display) {
      description.style.display = "block"; // Show description
    } else {
      description.style.display = "none"; // Hide description
    }
  }
});
