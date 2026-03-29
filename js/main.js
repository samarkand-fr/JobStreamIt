'use strict';

/* ============================================================
   INIT
   ============================================================ */

async function init() {
    // 1. Hero Section Logic - Finding the "True" Top Movie
    // Fetch a pool of top movies (e.g., 20 movies rated 9.0+)
    const topPool = await fetchMovies('imdb_score_min=9.0', 20);
    
    if (topPool.length) {
        // Find the movie with the most votes in this high-score pool
        const bestMovieData = topPool.reduce((prev, current) => {
            return (prev.votes > current.votes) ? prev : current;
        });

        // Fetch full details (for description/long_description)
        const movie = await fetchMovieDetails(bestMovieData.id);
        
        if (movie) {
            state.bestMovieId = movie.id; // Store ID to exclude from grid below
            
            const imgElement = document.getElementById('best-movie-img');
            imgElement.src = movie.image_url || PLACEHOLDER_IMG;
            imgElement.onerror = function() {
                this.src = PLACEHOLDER_IMG;
                this.onerror = null;
            };

            document.getElementById('best-movie-title').textContent = movie.title;
            // Fallback for descriptions
            document.getElementById('best-movie-summary').textContent = 
                movie.long_description || movie.description || "Pas de description disponible.";
            document.getElementById('best-movie-details').onclick = () => openModal(movie.id);
        }
    }

    // 2. Sections Logic - Fetching and Rendering Movie Grids
    const sectionKeys = ['top-rated', 'cat1', 'cat2'];
    for (const key of sectionKeys) {
        // Fetch 8 movies to ensure we have enough after filtering out the Hero movie
        let movies = await fetchMovies(state.sections[key].params, 8);
        
        // Filter out the Hero movie and limit to MOVIES_PER_SECTION (6)
        movies = movies.filter(m => m.id !== state.bestMovieId).slice(0, MOVIES_PER_SECTION);
        
        state.sections[key].movies = movies;
        renderSection(key);
    }


 // 3. Genre Selector — "Autres" section with dynamic category selection
    const dropdownList = document.getElementById('genre-options-list');
    const checkmarkSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#00B900"/><path d="M10 15.172l-3.536-3.536 1.414-1.414L10 12.344l7.071-7.071 1.414 1.414L10 15.172z" fill="#ffffff"/></svg>`;

    // Fetch all genres from API and map to {apiName, label}
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
                selectGenre(g.apiName, g.label);
                dropdownList.classList.add('hidden-element');
            });
            dropdownList.appendChild(opt);
        });
    }

    const trigger = document.getElementById('genre-select-trigger');
    if (trigger) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownList.classList.toggle('hidden-element');
        });
    }

    document.addEventListener('click', () => {
        if (dropdownList) dropdownList.classList.add('hidden-element');
    });

    async function selectGenre(apiName, label) {
        // Update trigger label
        const valueEl = document.getElementById('genre-select-value');
        if (valueEl) valueEl.textContent = label;

        // Update checkmarks
        document.querySelectorAll('.genre-option .checkmark-container').forEach(el => el.innerHTML = '');
        document.querySelectorAll('.genre-option').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll(`.genre-option[data-value="${apiName}"]`).forEach(opt => {
            opt.classList.add('selected');
            opt.querySelector('.checkmark-container').innerHTML = checkmarkSVG;
        });

        // Fetch and render movies for the "Autres" section
        const movies = await fetchMovies(`genre=${apiName}&sort_by=-imdb_score`, 6);
        state.sections.custom.movies = movies;
        state.sections.custom.showPlaceholder = false;
        state.sections.custom.isExpanded = false;

        renderSection('custom', movies);
    }

    // Initial selection — first genre available
    if (allGenres.length) selectGenre(allGenres[0].apiName, allGenres[0].label);

    // Events
    document.getElementById('close-modal').onclick = closeModal;
    document.getElementById('modal-overlay').onclick = closeModal;
    window.onresize = () => {
        ['top-rated', 'cat1', 'cat2', 'custom'].forEach(k => renderSection(k));
    };
}

document.addEventListener('DOMContentLoaded', init);
