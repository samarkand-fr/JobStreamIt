/**
 * main.js – JUSTSTREAMIT APPLICATION ORCHESTRATOR
 * 
 * This module coordinates the high-level application flow:
 * - Application initialization and DOM loading.
 * - Integration of API fetching with UI rendering.
 * - Event handling for the custom genre selection system.
 * - Global event listeners for modals and responsive resizing.
 */

'use strict';

/* ============================================================
   MAIN ORCHESTRATOR
   ============================================================ */

/**
 * Entry point of the application.
 * Orchestrates the sequence of component initializations (Hero, Static, Dynamic).
 * Wrapped in a global try...catch to handle critical start-up failures.
 */
async function init() {
    try {
        // Initialize the featured hero movie section
        await initHero();
        
        // Initialize the three static category carousels
        await initStaticSections(['top-rated', 'cat1', 'cat2']);
        
        // Populate and set up the interactive genre selector (dropdown)
        await initGenreSelector();
    } catch (error) {
        console.error('Critical initialization failure:', error);
        const dynamicContainer = document.getElementById('dynamic-categories');
        // Show a visual error message to the user if the app fails to start
        if (dynamicContainer) renderError(dynamicContainer, "Une erreur s'est produite lors du chargement de la page.");
    }

    // Set up global UI listeners (modal closing, window resizing)
    setupGlobalListeners();
}

/**
 * Fetches and displays the top-voted movie in the Hero section.
 * Implements a tie-breaking logic by fetching the top 10 rated movies 
 * and then using sortMovies() to find the best one based on rates AND votes.
 */
async function initHero() {
    try {
        // Fetch top rated movies to find a suitable candidate
        let topMovies = await fetchMovies('sort_by=-imdb_score', 10);
        if (!topMovies.length) throw new Error('No movies found for hero');

        // Apply global sorting (Score + Votes) and pick the winner
        const bestMovieSummary = sortMovies(topMovies)[0];
        // Fetch full movie details to get the long description and HQ image
        const movie = await fetchMovieDetails(bestMovieSummary.id);
        
        if (movie) {
            updateHeroDOM(movie);
            // Store the best movie ID globally to filter it out from subsequent grids
            state.bestMovieId = movie.id;
        }
    } catch (err) {
        console.error('Hero initialization failed:', err);
        const titleEl = document.getElementById('best-movie-title');
        if (titleEl) titleEl.textContent = 'Oups ! Impossible de charger le film vedette.';
    }
}

/**
 * Iterates through configured static categories and renders them.
 * @param {Array<string>} keys - List of state keys representing categories (e.g., 'top-rated').
 */
async function initStaticSections(keys) {
    for (const key of keys) {
        try {
            const params = state.sections[key].params;
            // Fetch more movies (12) than displayed (6) to allow for hero-filtering and better sorting
            let movies = await fetchMovies(params, 12);
            movies = sortMovies(movies);
            
            // Avoid showing the hero movie twice on the same page
            if (state.bestMovieId) {
                movies = movies.filter(m => m.id !== state.bestMovieId);
            }
            
            state.sections[key].movies = movies;
            renderSection(key);
        } catch (err) {
            console.error(`Failed to load section: ${key}`, err);
            // renderSection(key, []) will display the "No movies found/Error" UI in that specific grid
            renderSection(key, []);
        }
    }
}

/**
 * Fetches all available genres and populates the custom dropdown selector.
 * Sets up initial click-outside and toggle behaviors.
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
            // Each option contains its label and a container for the "selected" checkmark
            div.innerHTML = `<span>${genre.label}</span><div class="checkmark-container"></div>`;
            div.onclick = () => handleGenreSelection(genre);
            dropdownList.appendChild(div);
        });

        // Trigger logic to open/close the dropdown
        const trigger = document.getElementById('genre-select-trigger');
        if (trigger) {
            trigger.onclick = (e) => {
                e.stopPropagation();
                dropdownList.classList.toggle('hidden-element');
            };
        }
        // Click outside closes the dropdown automatically
        document.addEventListener('click', () => dropdownList.classList.add('hidden-element'));

        // Initialize the "Autres" section with the first genre from the list by default
        await handleGenreSelection(allGenres[0]);
    }
}

/**
 * Logic triggered when a user selects a genre or for default initialization.
 * - Updates the state.
 * - Flashes the selected indicator (checkmark).
 * - Fetches and renders the results.
 * @param {Object} genre - The genre data object { apiName, label }.
 */
async function handleGenreSelection(genre) {
    try {
        const triggerValue = document.getElementById('genre-select-value');
        if (triggerValue) triggerValue.textContent = genre.label;

        // Visual feedback: Highlight the selected row and show the green checkmark
        document.querySelectorAll('.genre-option').forEach(opt => {
            const isSelected = opt.querySelector('span').textContent === genre.label;
            opt.classList.toggle('selected', isSelected);
            const checkmarkContainer = opt.querySelector('.checkmark-container');
            if (checkmarkContainer) {
                checkmarkContainer.innerHTML = isSelected ? checkmarkSVG : '';
            }
        });

        // Show a brief loading indicator while the data is being fetched
        prepareCustomGridForLoading();

        const params = `genre=${genre.apiName}&sort_by=-imdb_score`;
        let movies = await fetchMovies(params, 12);
        
        state.sections.custom.movies = sortMovies(movies);
        state.sections.custom.title = genre.label;
        state.sections.custom.showPlaceholder = false;
        
        // Final render of the movie grid for the selected genre
        renderSection('custom');
    } catch (err) {
        console.error('Genre selection update failed:', err);
        renderSection('custom', []);
    }
}

/* ============================================================
   HELPERS & DOM UPDATES
   ============================================================ */

const checkmarkSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#00B900"/><path d="M10 15.172l-3.536-3.536 1.414-1.414L10 12.344l7.071-7.071 1.414 1.414L10 15.172z" fill="#ffffff"/></svg>`;

/**
 * Standardized sorting function used across the app (Hero and Grids).
 * Sorts by Score Descending, then Votes Descending.
 */
function sortMovies(movies) {
    return [...movies].sort((a, b) => {
        const scoreA = parseFloat(a.imdb_score);
        const scoreB = parseFloat(b.imdb_score);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.votes || 0) - (a.votes || 0);
    });
}

/**
 * Updates the Hero section DOM elements with movie data.
 * @param {Object} movie - Full movie details object.
 */
function updateHeroDOM(movie) {
    const heroImg = document.getElementById('best-movie-img');
    if (heroImg) {
        heroImg.src = movie.image_url;
        // Global placeholder fallback if the backend image is missing or broken
        heroImg.onerror = () => { heroImg.src = 'assets/img/placeholder.png'; };
    }
    const titleEl = document.getElementById('best-movie-title');
    const summaryEl = document.getElementById('best-movie-summary');
    const detailsBtn = document.getElementById('best-movie-details');
    
    if (titleEl) titleEl.textContent = movie.title;
    if (summaryEl) summaryEl.textContent = movie.long_description || movie.description;
    if (detailsBtn) detailsBtn.onclick = () => openModal(movie.id);
}

/**
 * Prepares the custom genre grid into a loading state.
 */
function prepareCustomGridForLoading() {
    const grid = document.getElementById('custom-grid');
    const placeholder = document.getElementById('custom-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    if (grid) {
        grid.classList.remove('hidden-element');
        grid.innerHTML = '<p class="loader-text" style="text-align:center; padding:20px; font-family:Oswald; color:var(--brand-dark);">Chargement...</p>';
    }
}

/**
 * Attaches listeners for global UI interactions (modals, scaling).
 */
function setupGlobalListeners() {
    const closeBtn = document.getElementById('close-modal');
    const overlay = document.getElementById('modal-overlay');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (overlay) overlay.onclick = closeModal;
    
    // Performance: Throttle/Optimize re-rendering on window resize to adjust card visibility limits (2, 4, or 6 cards)
    window.onresize = () => {
        ['top-rated', 'cat1', 'cat2', 'custom'].forEach(k => renderSection(k));
    };
}

// Start the application when the DOM is fully loaded and parsed
document.addEventListener('DOMContentLoaded', init);
