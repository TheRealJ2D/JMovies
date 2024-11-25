document.addEventListener("DOMContentLoaded", function () {
    const movieList = document.getElementById('movie-list');
    const searchButton = document.getElementById('search-button');
    const searchBox = document.getElementById('search-box');
    const genreSelect = document.getElementById('genre-select');
    
    // Event listener for the search button click
    searchButton.addEventListener('click', function () {
        const query = searchBox.value;
        const category = genreSelect.value;

        if (query) {
            fetchMovies(query, category);
        } else {
            movieList.innerHTML = `<p>Please enter a search term!</p>`;
        }
    });

    // Function to fetch movies from OMDB API
    async function fetchMovies(query = '', category = '') {
        try {
            // التأكد من أن الاستعلام والقيم تم ترميزهما بشكل صحيح
            const encodedQuery = encodeURIComponent(query.trim()); // تأكد من أن الاستعلام ليس فارغًا أو يحتوي على مسافات غير ضرورية
            const encodedCategory = encodeURIComponent(category); // ترميز الفئة

            // استخدام HTTPS بشكل دائم في الرابط
            const url = `https://www.omdbapi.com/?s=${encodedQuery}&type=movie&genre=${encodedCategory}&apikey=2375f071`;
            
            // طلب البيانات من API
            const response = await fetch(url);
            const data = await response.json();

            // عرض الأفلام في حالة نجاح الاستعلام
            if (data.Response === "True") {
                displayMovies(data.Search);
            } else {
                movieList.innerHTML = `<p>No movies found!</p>`;
            }
        } catch (error) {
            movieList.innerHTML = `<p>Error fetching data!</p>`;
        }
    }

    // Function to display movies on the page
    function displayMovies(movies) {
        movieList.innerHTML = '';

        movies.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.classList.add('movie-item');
            movieItem.innerHTML = `
                <img src="${movie.Poster}" alt="${movie.Title}" class="movie-poster">
                <h3>${movie.Title}</h3>
                <p><strong>Year:</strong> ${movie.Year}</p>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
            `;
            movieList.appendChild(movieItem);
        });
    }
});
