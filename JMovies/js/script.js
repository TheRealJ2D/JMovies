const apiKey = "2375f071"; // استبدلها بـ API Key الخاص بك من OMDb API
const movieList = document.getElementById("movie-list");
const searchBox = document.getElementById("search-box");
const categorySelect = document.getElementById("category-select");

// دالة لعرض الأفلام في الموقع
async function fetchMovies(query = '', category = '') {
    try {
        // بناء الرابط بناءً على المدخلات
        const url = `https://www.omdbapi.com/?s=${query}&type=movie&genre=${category}&apikey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.Response === "True") {
            displayMovies(data.Search);
        } else {
            movieList.innerHTML = `<p>No movies found!</p>`;
        }
    } catch (error) {
        movieList.innerHTML = `<p>Error fetching data!</p>`;
    }
}

// دالة لعرض الأفلام في الصفحة
function displayMovies(movies) {
    movieList.innerHTML = "";
    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("col-md-3", "movie-card");

        movieCard.innerHTML = `
            <img src="${movie.Poster}" alt="${movie.Title}" class="img-fluid">
            <h3>${movie.Title}</h3>
            <p>${movie.Year}</p>
            <button class="btn btn-primary" onclick="showMovieDetails('${movie.imdbID}')">Details</button>
        `;

        movieList.appendChild(movieCard);
    });
}

// دالة لعرض تفاصيل الفلم عند النقر
async function showMovieDetails(imdbID) {
    try {
        const response = await fetch(`http://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`);
        const movie = await response.json();
        alert(`Title: ${movie.Title}\nPlot: ${movie.Plot}\nRating: ${movie.imdbRating}`);
    } catch (error) {
        alert("Error fetching movie details.");
    }
}

// حدث عند الكتابة في مربع البحث
function searchMovies() {
    const query = searchBox.value;
    const category = categorySelect.value;
    fetchMovies(query, category);
}

// حدث عند تغيير التصنيف
categorySelect.addEventListener("change", () => {
    const query = searchBox.value;
    const category = categorySelect.value;
    fetchMovies(query, category);
});

// عند تحميل الصفحة، يتم جلب الأفلام
document.addEventListener("DOMContentLoaded", fetchMovies);
