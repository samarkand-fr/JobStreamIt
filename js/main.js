'use strict';

/* ============================================================
   MAIN ORCHESTRATOR
   ============================================================ */

/**
 * Application initialization: Sets up all main components.
 */
async function init() {
    try {
        await initHero();
        await initStaticSections(['top-rated', 'cat1', 'cat2']);
        await initGenreSelector();
    } catch (error) {
        console.error('Critical initialization failure:', error);
        const dynamicContainer = document.getElementById('dynamic-categories');
        if (dynamicContainer) renderError(dynamicContainer, "Une erreur s'est produite lors du chargement de la page.");
    }

    // Global Modal Event Listeners
    setupGlobalListeners();
}

/**
 * Specifically handles the Hero (Meilleur Film) section.
 */
async function initHero() {
    try {
        let topMovies = await fetchMovies('sort_by=-imdb_score', 10);
        if (!topMovies.length) throw new Error('No movies found for hero');

        const bestMovieSummary = sortMovies(topMovies)[0];
        const movie = await fetchMovieDetails(bestMovieSummary.id);
        
        if (movie) {
            updateHeroDOM(movie);
            state.bestMovieId = movie.id;
        }
    } catch (err) {
        console.error('Hero initialization failed:', err);
        const titleEl = document.getElementById('best-movie-title');
        if (titleEl) titleEl.textContent = 'Oups ! Impossible de charger le film vedette.';
    }
}

/**
 * Renders the initial static categories (Top Rated, Mystery, Adventure).
 */
async function initStaticSections(keys) {
    for (const key of keys) {
        try {
            const params = state.sections[key].params;
            let movies = await fetchMovies(params, 12);
            movies = sortMovies(movies);
            
            // Avoid duplicating the hero movie
            if (state.bestMovieId) {
                movies = movies.filter(m => m.id !== state.bestMovieId);
            }
            
            state.sections[key].movies = movies;
            renderSection(key);
        } catch (err) {
            console.error(`Failed to load section: ${key}`, err);
            renderSection(key, []); // Show error in grid
        }
    }
}

const checkmarkSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#00B900"/><path d="M10 15.172l-3.536-3.536 1.414-1.414L10 12.344l7.071-7.071 1.414 1.414L10 15.172z" fill="#ffffff"/></svg>`;

/**
 * Sets up the dynamic genre selector logic.
 */
async function initGenreSelector() {
    const rawGenres = await fetchAllGenres();
    const allGenres = rawGenres.map(g => ({ apiName: g.name, label: g.name }));
    const dropdownList = document.getElementById('genre-options-list');

    if (dropdownList && allGenres.length) {
        dropdownList.innerHTML = '';
        allGenres.forEach(genre => {
            const div = document.createElement('div');
            div.className = 'genre-option';
            div.innerHTML = `<span>${genre.label}</span><div class="checkmark-container"></div>`;
            div.onclick = () => handleGenreSelection(genre);
            dropdownList.appendChild(div);
        });

        // Toggle dropdown logic
        const trigger = document.getElementById('genre-select-trigger');
        if (trigger) {
            trigger.onclick = (e) => {
                e.stopPropagation();
                dropdownList.classList.toggle('hidden-element');
            };
        }
        document.addEventListener('click', () => dropdownList.classList.add('hidden-element'));

        // Load initial "Autres" content (first genre)
        handleGenreSelection(allGenres[0]);
    }
}

/**
 * Handles genre selection and updates the "Autres" grid.
 */
async function handleGenreSelection(genre) {
    try {
        const triggerValue = document.getElementById('genre-select-value');
        if (triggerValue) triggerValue.textContent = genre.label;

        // Visual selection indicator (background + checkmark)
        document.querySelectorAll('.genre-option').forEach(opt => {
            const isSelected = opt.querySelector('span').textContent === genre.label;
            opt.classList.toggle('selected', isSelected);
            const checkmarkContainer = opt.querySelector('.checkmark-container');
            if (checkmarkContainer) {
                checkmarkContainer.innerHTML = isSelected ? checkmarkSVG : '';
            }
        });

        // Set loading state
        prepareCustomGridForLoading();

        const params = `genre=${genre.apiName}&sort_by=-imdb_score`;
        let movies = await fetchMovies(params, 12);
        
        state.sections.custom.movies = sortMovies(movies);
        state.sections.custom.title = genre.label;
        state.sections.custom.showPlaceholder = false;
        
        renderSection('custom');
    } catch (err) {
        console.error('Genre selection update failed:', err);
        renderSection('custom', []);
    }
}

/**
 * Sorts movies by IMDb score and then votes.
 */
function sortMovies(movies) {
    return [...movies].sort((a, b) => {
        const scoreA = parseFloat(a.imdb_score);
        const scoreB = parseFloat(b.imdb_score);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.votes || 0) - (a.votes || 0);
    });
}

function updateHeroDOM(movie) {
    const heroImg = document.getElementById('best-movie-img');
    if (heroImg) {
        heroImg.src = movie.image_url;
        heroImg.onerror = () => { heroImg.src = 'assets/img/placeholder.png'; };
    }
    const titleEl = document.getElementById('best-movie-title');
    const summaryEl = document.getElementById('best-movie-summary');
    const detailsBtn = document.getElementById('best-movie-details');
    
    if (titleEl) titleEl.textContent = movie.title;
    if (summaryEl) summaryEl.textContent = movie.long_description || movie.description;
    if (detailsBtn) detailsBtn.onclick = () => openModal(movie.id);
}

function prepareCustomGridForLoading() {
    const grid = document.getElementById('custom-grid');
    const placeholder = document.getElementById('custom-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    if (grid) {
        grid.classList.remove('hidden-element');
        grid.innerHTML = '<p class="loader-text" style="text-align:center; padding:20px; font-family:Oswald;">Chargement...</p>';
    }
}

function setupGlobalListeners() {
    const closeBtn = document.getElementById('close-modal');
    const overlay = document.getElementById('modal-overlay');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (overlay) overlay.onclick = closeModal;
    
    window.onresize = () => {
        ['top-rated', 'cat1', 'cat2', 'custom'].forEach(k => renderSection(k));
    };
}

document.addEventListener('DOMContentLoaded', init);
