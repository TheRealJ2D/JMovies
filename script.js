// OMDB API configuration
const API_KEY = '7b1c757';
const API_URL = 'https://www.omdbapi.com/';

// Featured movies IMDb IDs (recent and popular movies)
const featuredMovieIds = [
    'tt15398776', // Oppenheimer
    'tt9362722',  // Spider-Man: Across the Spider-Verse
    'tt1517268',  // Barbie
    'tt15239678', // Mission: Impossible - Dead Reckoning
    'tt13238346', // Poor Things
    'tt14230458', // Napoleon
    'tt6166392',  // Napoleon
    'tt10366206'  // John Wick 4
];

// Cache for movie details
const movieCache = new Map();

// Function to fetch movie details with caching
async function fetchMovieDetails(imdbId) {
    if (movieCache.has(imdbId)) {
        return movieCache.get(imdbId);
    }

    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbId}&plot=full`);
        const data = await response.json();
        if (data.Response === 'True') {
            movieCache.set(imdbId, data);
            return data;
        }
        throw new Error(data.Error);
    } catch (error) {
        console.error(`Error fetching movie ${imdbId}:`, error);
        return null;
    }
}

// Function to search movies
async function searchMovies(searchTerm) {
    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${searchTerm}&type=movie`);
        const data = await response.json();
        return data.Response === 'True' ? data.Search : [];
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// Function to create movie cards
function createMovieCard(movie) {
    const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    const rating = movie.imdbRating !== 'N/A' ? `<div class="rating">★ ${movie.imdbRating}/10</div>` : '';
    
    return `
        <div class="movie-card" data-imdb="${movie.imdbID}">
            <img src="${poster}" alt="${movie.Title}" loading="lazy">
            <div class="movie-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
                ${rating}
            </div>
        </div>
    `;
}

// Function to display movies with loading state
async function displayMovies(movies, category = '') {
    const movieGrid = document.getElementById('movieGrid');
    movieGrid.innerHTML = '<div class="loading"></div>';

    try {
        const movieCards = await Promise.all(
            movies.map(async (movie) => {
                const details = await fetchMovieDetails(movie.imdbID || movie);
                return details ? createMovieCard(details) : '';
            })
        );

        movieGrid.innerHTML = movieCards.filter(card => card).join('');
        attachMovieCardListeners();
    } catch (error) {
        console.error('Error displaying movies:', error);
        movieGrid.innerHTML = '<div class="error">Error loading movies. Please try again later.</div>';
    }
}

// Modal functionality with animations
const modal = document.getElementById('movieModal');
const closeModal = document.querySelector('.close-modal');

function showMovieDetails(movie) {
    const modalTitle = modal.querySelector('.modal-title');
    const modalPoster = modal.querySelector('.modal-poster img');
    const modalMetadata = modal.querySelector('.movie-metadata');
    const modalPlot = modal.querySelector('.movie-plot');
    const modalCast = modal.querySelector('.movie-cast');
    const modalDirector = modal.querySelector('.movie-director');
    const modalAwards = modal.querySelector('.movie-awards');

    modalTitle.textContent = movie.Title;
    modalPoster.src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    modalPoster.alt = movie.Title;

    modalMetadata.innerHTML = `
        <span>${movie.Year}</span>
        <span>${movie.Rated}</span>
        <span>${movie.Runtime}</span>
        <span>${movie.Genre}</span>
        ${movie.imdbRating !== 'N/A' ? `<span>★ ${movie.imdbRating}/10</span>` : ''}
    `;

    modalPlot.textContent = movie.Plot;
    modalCast.textContent = movie.Actors;
    modalDirector.textContent = movie.Director;
    modalAwards.textContent = movie.Awards;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Trigger animation
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
}

function hideModal() {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

function attachMovieCardListeners() {
    const movieCards = document.querySelectorAll('.movie-card');
    movieCards.forEach(card => {
        card.addEventListener('click', async () => {
            const imdbId = card.dataset.imdb;
            const movieDetails = await fetchMovieDetails(imdbId);
            if (movieDetails) {
                showMovieDetails(movieDetails);
            }
        });
    });
}

// Close modal events
closeModal.addEventListener('click', hideModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
    }
});

// Keyboard navigation
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        hideModal();
    }
});

// Search functionality with debounce
let searchTimeout;
const searchInput = document.querySelector('.search-bar input');
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const searchTerm = e.target.value.trim();
    
    if (searchTerm.length >= 3) {
        searchTimeout = setTimeout(async () => {
            const movies = await searchMovies(searchTerm);
            displayMovies(movies, 'search');
        }, 500);
    } else if (searchTerm.length === 0) {
        displayMovies(featuredMovieIds);
    }
});

// Theme and Language Switcher
const translations = {
    en: {
        home: 'Home',
        popular: 'Popular',
        topRated: 'Top Rated',
        upcoming: 'Upcoming',
        search: 'Search movies...',
        loading: 'Loading movies...',
        noResults: 'No movies found',
        overview: 'Overview',
        cast: 'Cast',
        director: 'Director',
        awards: 'Awards'
    },
    ar: {
        home: 'الرئيسية',
        popular: 'الأكثر شعبية',
        topRated: 'الأعلى تقييماً',
        upcoming: 'القادمة',
        search: 'ابحث عن الأفلام...',
        loading: 'جاري تحميل الأفلام...',
        noResults: 'لم يتم العثور على أفلام',
        overview: 'نظرة عامة',
        cast: 'طاقم العمل',
        director: 'المخرج',
        awards: 'الجوائز'
    }
};

let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'dark';

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('theme', currentTheme);
}

themeToggle.addEventListener('click', toggleTheme);

// Language Toggle
const languageToggle = document.getElementById('languageToggle');
const langText = languageToggle.querySelector('.lang-text');

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    document.documentElement.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
    langText.textContent = currentLanguage.toUpperCase();
    updateTranslations();
    localStorage.setItem('language', currentLanguage);
}

function updateTranslations() {
    // Update navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    const navTexts = ['home', 'popular', 'topRated', 'upcoming'];
    navLinks.forEach((link, index) => {
        link.textContent = translations[currentLanguage][navTexts[index]];
    });

    // Update search placeholder
    searchInput.placeholder = translations[currentLanguage].search;

    // Update modal texts if modal is open
    if (modal.style.display === 'block') {
        const modalTexts = modal.querySelectorAll('h3');
        const textKeys = ['overview', 'cast', 'director', 'awards'];
        modalTexts.forEach((text, index) => {
            text.textContent = translations[currentLanguage][textKeys[index]];
        });
    }
}

languageToggle.addEventListener('click', toggleLanguage);

// Scroll buttons functionality
const scrollPrev = document.querySelector('.scroll-btn.prev');
const scrollNext = document.querySelector('.scroll-btn.next');
const movieGrid = document.getElementById('movieGrid');

scrollPrev?.addEventListener('click', () => {
    movieGrid.scrollBy({ left: -300, behavior: 'smooth' });
});

scrollNext?.addEventListener('click', () => {
    movieGrid.scrollBy({ left: 300, behavior: 'smooth' });
});

// Navigation functionality
async function fetchMoviesByCategory(category) {
    const movieGrid = document.getElementById('movieGrid');
    movieGrid.innerHTML = '<div class="loading">Loading movies...</div>';

    try {
        let movies = [];
        const currentYear = new Date().getFullYear();

        switch (category) {
            case 'home':
                return displayMovies(featuredMovieIds);
            case 'popular':
                // Fetch popular movies using search with high ratings
                const popularMovies = [
                    'tt15398776', // Oppenheimer
                    'tt9362722',  // Spider-Man: Across the Spider-Verse
                    'tt1517268',  // Barbie
                    'tt15239678', // Mission: Impossible
                    'tt14230458', // Napoleon
                    'tt10366206', // John Wick 4
                    'tt9764362',  // The Menu
                    'tt1630029',  // Avatar: The Way of Water
                    'tt1745960'   // Top Gun: Maverick
                ];
                return displayMovies(popularMovies);
            case 'top-rated':
                // Fetch top-rated movies
                const topRatedMovies = [
                    'tt0111161', // The Shawshank Redemption
                    'tt0068646', // The Godfather
                    'tt0468569', // The Dark Knight
                    'tt0071562', // The Godfather Part II
                    'tt0050083', // 12 Angry Men
                    'tt0108052', // Schindler's List
                    'tt0167260', // The Lord of the Rings: The Return of the King
                    'tt0110912', // Pulp Fiction
                    'tt0060196'  // The Good, the Bad and the Ugly
                ];
                return displayMovies(topRatedMovies);
            case 'upcoming':
                // Upcoming movies for 2024
                const upcomingMovies = [
                    'tt1517268',  // Barbie
                    'tt15398776', // Oppenheimer
                    'tt9362722',  // Spider-Man: Across the Spider-Verse
                    'tt15239678', // Mission: Impossible - Dead Reckoning
                    'tt14230458', // Napoleon
                    'tt21807222', // Killers of the Flower Moon
                    'tt11304740', // Poor Things
                    'tt11304740'  // Maestro
                ];
                return displayMovies(upcomingMovies);
            default:
                return displayMovies(featuredMovieIds);
        }
    } catch (error) {
        console.error('Error fetching movies by category:', error);
        movieGrid.innerHTML = '<div class="error">Error loading movies. Please try again later.</div>';
    }
}

// Add event listeners to navigation links
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';

    // Initialize language
    document.documentElement.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
    langText.textContent = currentLanguage.toUpperCase();
    updateTranslations();

    // Load featured movies
    displayMovies(featuredMovieIds);

    // Add navigation event listeners
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href').replace('#', '');
            fetchMoviesByCategory(href || 'home');
            
            // Update active state
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Initialize with home page
    fetchMoviesByCategory('home');
});
