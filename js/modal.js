/**
 * modal.js – MOVIE DETAILS MODAL
 * 
 * This module manages the movie details overlay. 
 * It handles fetching detailed metadata for a specific movie, 
 * populating the responsive modal layout (Desktop & Mobile), 
 * and managing the open/close state logic.
 */

'use strict';

/* ============================================================
   MODAL CORE LOGIC
   ============================================================ */

/**
 * Safely formats a value for display in the UI. 
 * Handles missing values and arrays (joins them with commas).
 * 
 * @param {string|Array|null} val - The raw value from the API.
 * @param {string} [fallback='N/A'] - The string to return if val is null or empty.
 * @returns {string} The display-ready string.
 */
function safe(val, fallback = 'N/A') {
    if (!val) return fallback;
    if (Array.isArray(val)) return val.length ? val.join(', ') : fallback;
    return val;
}

/**
 * Opens the movie detail modal for a specific movie ID.
 * - Displays the overlay and prevents body scrolling.
 * - Shows a loading state while fetching detailed metadata.
 * - Renders both Desktop and Mobile layouts (interchangeable via CSS).
 * 
 * @param {number} id - The unique identifier of the movie.
 */
async function openModal(id) {
    const modal = document.getElementById('movie-modal');
    const content = document.getElementById('modal-content');
    
    // 1. Prepare UI: Show overlay and lock the background scroll
    modal.classList.remove('hidden-element');
    modal.classList.add('flex-element');
    document.body.style.overflow = 'hidden';

    // 2. Initial Loading State: Visual feedback for the fetch duration
    content.innerHTML = '<div class="modal-loading">Chargement...</div>';

    // 3. Data Fetch: Retrieve the exhaustive movie metadata
    const movie = await fetchMovieDetails(id);
    if (!movie) {
        content.innerHTML = '<div class="modal-error">Erreur lors du chargement des détails.</div>';
        return;
    }

    // 4. Accessibility: Update the static persistent title for screen readers
    const staticTitle = document.getElementById('modal-title-desc');
    if (staticTitle) staticTitle.textContent = `Détails du film : ${movie.title}`;

    // 5. DOM Injection: Populate the modal with a responsive-aware HTML structure.
    // CSS media queries handle the switching between .modal-desktop and .modal-mobile.
    content.innerHTML = `
        <!-- DESKTOP MODAL (lg and up: 1024px+) -->
        <div class="modal-desktop modal-desktop-container">
            <div class="modal-inner-row">
                <!-- Left Column: Detailed Info -->
                <div class="modal-info-col">
                    <h2 class="modal-title-text">${movie.title}</h2>
                    <p class="modal-meta">
                        ${movie.date_published.substring(0, 4)} - ${safe(movie.genres)}<br>
                        ${movie.rated} - ${movie.duration} minutes (${safe(movie.countries).split(',').join(' / ')})<br>
                        IMDB score: ${movie.imdb_score}/10<br>
                        Recettes au box-office: ${movie.worldwide_gross_income ? '$' + (movie.worldwide_gross_income / 1000000).toFixed(1) + 'm' : 'N/A'}
                    </p>
                    <div class="modal-dir-section">
                        <p class="mb-1">Réalisé par:</p>
                        <p class="font-normal mb-8">${safe(movie.directors)}</p>
                    </div>
                    
                    <p class="modal-long-desc">${movie.long_description || movie.description}</p>
                    
                    <div class="modal-cast-section">
                        <p class="font-bold mb-1">Avec:</p>
                        <p class="font-normal leading-snug">${safe(movie.actors)}</p>
                    </div>
                </div>
                
                <!-- Right Column: High-Res Poster -->
                <div class="modal-img-col">
                    <img alt="${movie.title}" src="${movie.image_url}" class="modal-poster" onerror="this.src='assets/img/placeholder.png'">
                </div>
            </div>

            <!-- Footer Section with consistent Close button -->
            <div class="modal-footer">
                <button class="modal-close-btn" onclick="closeModal()">
                    Fermer
                </button>
            </div>
        </div>

        <!-- TABLET & MOBILE MODAL (below lg) -->
        <div class="modal-mobile modal-mobile-container">
            <!-- Dedicated close icon for mobile accessibility -->
            <button class="modal-mobile-x" onclick="closeModal()" aria-label="Fermer la fenêtre modale">&times;</button>
            
            <div class="modal-mobile-top">
                <h2 class="modal-mobile-title">${movie.title}</h2>
                <p class="modal-mobile-meta">
                    ${movie.date_published.substring(0, 4)} - ${safe(movie.genres)}<br>
                    ${movie.rated} - ${movie.duration} minutes (${safe(movie.countries).split(',').join(' / ')})<br>
                    IMDB score: ${movie.imdb_score}/10<br>
                    Recettes au box-office: ${movie.worldwide_gross_income ? '$' + (movie.worldwide_gross_income / 1000000).toFixed(1) + 'm' : 'N/A'}
                </p>
                <div class="modal-mobile-dir">
                    <p class="mb-1 leading-snug">Réalisé par:</p>
                    <p class="font-normal leading-snug">${safe(movie.directors)}</p>
                </div>
            </div>
            
            <p class="modal-mobile-desc">${movie.long_description || movie.description}</p>
            
            <!-- Mobile-specific layout: Poster is centered below metadata -->
            <img alt="${movie.title}" src="${movie.image_url}" class="modal-mobile-poster" onerror="this.src='assets/img/placeholder.png'">
            
            <div class="modal-mobile-cast">
                <p class="font-bold mb-1 leading-snug">Avec:</p>
                <p class="font-normal leading-snug">${safe(movie.actors)}</p>
            </div>
        </div>
    `;
}

/**
 * Closes the movie details modal.
 * - Hides the overlay elements.
 * - Re-enables scrolling on the main document body.
 */
function closeModal() {
    const modal = document.getElementById('movie-modal');
    modal.classList.add('hidden-element');
    modal.classList.remove('flex-element');
    document.body.style.overflow = '';
}
