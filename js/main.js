'use strict';

/* ============================================================
   INIT
   ============================================================ */

function sortMovies(movies) {
    return movies.sort((a, b) => {
        const scoreA = parseFloat(a.imdb_score);
        const scoreB = parseFloat(b.imdb_score);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.votes || 0) - (a.votes || 0);
    });
}

async function init() {
    // 1. Hero Section: Fetch top 10 highest-rated movies to find the most voted among them
    let topMovies = await fetchMovies('sort_by=-imdb_score', 10);
    if (topMovies.length) {
        topMovies = sortMovies(topMovies);
        const bestMovieSummary = topMovies[0];
        const movie = await fetchMovieDetails(bestMovieSummary.id);
        if (movie) {
            // Update Hero DOM elements
            const heroImg = document.getElementById('best-movie-img');
            heroImg.src = movie.image_url;
            heroImg.onerror = () => { heroImg.src = 'assets/img/placeholder.png'; };
            document.getElementById('best-movie-title').textContent = movie.title;
            document.getElementById('best-movie-summary').textContent = movie.long_description || movie.description;
            document.getElementById('best-movie-details').onclick = () => openModal(movie.id);
            state.bestMovieId = movie.id; // Mark as featured to avoid duplication in grids
        }
    }

    // 2. Initial Categories: Fetch and render default sections (Top Rated, Mystery, Adventure)
    const sectionKeys = ['top-rated', 'cat1', 'cat2'];
    for (const key of sectionKeys) {
        // Fetch 12 movies to have enough for sorting and filtering the hero movie
        let movies = await fetchMovies(state.sections[key].params, 12);
        movies = sortMovies(movies);
        
        // Filter out the hero movie if in top-rated, then take top 6
        if (key === 'top-rated') {
            movies = movies.filter(m => m.id !== state.bestMovieId);
        }
        movies = movies.slice(0, 6);
        
        state.sections[key].movies = movies;
        renderSection(key, movies, false);
    }

    // 3. Genre Selector: Handle the dynamic "Autres" section
    const dropdownList = document.getElementById('genre-options-list');
    const checkmarkSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#00B900"/><path d="M10 15.172l-3.536-3.536 1.414-1.414L10 12.344l7.071-7.071 1.414 1.414L10 15.172z" fill="#ffffff"/></svg>`;

    // Populate the custom dropdown with all available genres from the API
    const rawGenres = await fetchAllGenres();
    const allGenres = rawGenres.map(g => ({ apiName: g.name, label: g.name }));

    if (dropdownList) {
        allGenres.forEach(g => {
            const opt = document.createElement('div');
            opt.className = 'genre-option';
            opt.dataset.value = g.apiName;
            opt.innerHTML = `<span>${g.label}</span><div class="checkmark-container"></div>`;
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                selectGenre(g.apiName, g.label); // Change active genre
                dropdownList.classList.add('hidden-element');
            });
            dropdownList.appendChild(opt);
        });
    }

    // Dropdown toggle logic
    const trigger = document.getElementById('genre-select-trigger');
    if (trigger) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownList.classList.toggle('hidden-element');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        if (dropdownList) dropdownList.classList.add('hidden-element');
    });

   
    async function selectGenre(apiName, label) {
        // Update trigger label to current selection
        const valueEl = document.getElementById('genre-select-value');
        if (valueEl) valueEl.textContent = label;

        // Visual feedback: update checkmarks in the list
        document.querySelectorAll('.genre-option .checkmark-container').forEach(el => el.innerHTML = '');
        document.querySelectorAll('.genre-option').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll(`.genre-option[data-value="${apiName}"]`).forEach(opt => {
            opt.classList.add('selected');
            opt.querySelector('.checkmark-container').innerHTML = checkmarkSVG;
        });

        // Load new movies for the selected genre
        let movies = await fetchMovies(`genre=${apiName}&sort_by=-imdb_score`, 12);
        movies = sortMovies(movies).slice(0, 6);
        
        state.sections.custom.movies = movies;
        state.sections.custom.showPlaceholder = false;
        state.sections.custom.isExpanded = false;

        renderSection('custom', movies);
    }

    // Default to the first available genre on load
    if (allGenres.length) selectGenre(allGenres[0].apiName, allGenres[0].label);

    // Global Modal Event Listeners
    document.getElementById('close-modal').onclick = closeModal;
    document.getElementById('modal-overlay').onclick = closeModal;
    
    // Global Resize Listener: re-renders grids to handle responsive card thresholds
    window.onresize = () => {
        ['top-rated', 'cat1', 'cat2', 'custom'].forEach(k => renderSection(k));
    };
}

document.addEventListener('DOMContentLoaded', init);
