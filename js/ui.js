/**
 * ui.js – USER INTERFACE RENDERER
 * 
 * This module is responsible for the visual representation of movie data.
 * It handles the creation of movie cards, grid rendering, responsive layout 
 * calculation, error state management, and interaction with section templates.
 */

'use strict';

/* ============================================================
   UI COMPONENTS & RENDERING
   ============================================================ */

/**
 * Main rendering function for section grids.
 * Orchestrates the rendering flow by calling specialized internal helpers 
 * for DOM integrity, layout calculation, and card instantiation.
 * 
 * @param {string} sectionId - The unique identifier of the section to render.
 * @param {Array<Object>} [movies] - Optional array of movies to display (overrides state).
 */
function renderSection(sectionId, movies) {
    // 1. Ensure the section and its grid exist in the DOM (lazy-load from template if needed)
    let grid = ensureSectionExists(sectionId);
    if (!grid) return;

    // Determine the source of truth for the movie data
    const data = movies || state.sections[sectionId].movies || [];
    const isExpanded = state.sections[sectionId].isExpanded;
    const placeholder = document.getElementById('custom-placeholder');
    const moreContainer = document.getElementById(`${sectionId}-more-container`);

    // 2. Handle specific UI states: 
    //    - Custom Genre Placeholder (the "Select a genre" message)
    //    - Error/Empty states (when no movies are returned from the API)
    if (handleCustomPlaceholder(sectionId, grid, placeholder, moreContainer)) return;
    
    // Clear existing content before re-rendering
    grid.innerHTML = '';
    
    if (data.length === 0) {
        // Show an error message if the data array is empty
        renderError(grid, `Aucun film trouvé pour la catégorie "${state.sections[sectionId].title}".`);
        if (moreContainer) moreContainer.classList.add('hidden-element');
        return;
    }

    // 3. Calculate responsive layout and render cards
    const threshold = getResponsiveThreshold();
    const itemsToDisplay = isExpanded ? data : data.slice(0, threshold);
    
    // Render the cards with staggered animations
    renderGridCards(grid, itemsToDisplay);

    // 4. Update the "Voir plus" button visibility and click handler
    handleMoreButton(sectionId, data, threshold);
}

/**
 * Creates a single movie card element from the defined HTML template.
 * Sets up properties for images, titles, and click interactions.
 * 
 * @param {Object} movie - The movie summary object from the API results.
 * @returns {HTMLElement} The constructed <article> element for the movie card.
 */
function createMovieCard(movie) {
    const tpl = document.getElementById('movie-card-tpl');
    const card = tpl.content.cloneNode(true).querySelector('article');
    const img = card.querySelector('.card-img');
    
    // Assign data to elements
    img.src = movie.image_url;
    img.alt = movie.title;
    
    // Safety fallback: if the backend image URL is broken, display a local placeholder
    img.onerror = () => { img.src = 'assets/img/placeholder.png'; };
    
    const titleEl = card.querySelector('.card-title');
    // Accessibility: Provide a descriptive label for screen readers
    card.setAttribute('aria-label', `Film : ${movie.title}. Cliquez pour voir les détails.`);
    
    // Open the detailed information modal when the card is clicked
    card.onclick = () => openModal(movie.id);
    return card;
}

/**
 * Displays a professional error message within a grid container.
 * Includes a "Retry" button that reloads the page to attempt a fresh fetch.
 * 
 * @param {HTMLElement} container - The element where the error message should be injected.
 * @param {string} message - The user-friendly error message to display.
 */
function renderError(container, message = 'Échec du chargement.') {
    container.innerHTML = `
        <div class="error-message-container" style="padding: 20px; text-align: center; color: var(--brand-dark); font-family: Oswald;">
            <p>${message}</p>
            <button class="btn-primary" onclick="location.reload()" style="margin-top:10px; padding:5px 15px;">Réessayer</button>
        </div>
    `;
}

/* ============================================================
   INTERNAL HELPERS
   ============================================================ */

/**
 * Verifies if a section grid exists in the DOM. 
 * For dynamic categories, it clones and initializes the section from the template.
 * 
 * @param {string} sectionId - The ID of the section to verify or create.
 * @returns {HTMLElement|null} The grid element of the section, or null if it cannot be found.
 */
function ensureSectionExists(sectionId) {
    let grid = document.getElementById(sectionId === 'custom' ? 'custom-grid' : `${sectionId}-grid`);
    
    // If the section doesn't exist, try to instantiate it from the category template
    if (!grid && ['top-rated', 'cat1', 'cat2'].includes(sectionId)) {
        const container = document.getElementById('dynamic-categories');
        const tpl = document.getElementById('category-section-tpl');
        if (container && tpl) {
            const clone = tpl.content.cloneNode(true);
            const section = clone.querySelector('section');
            section.id = sectionId;
            section.setAttribute('aria-labelledby', `${sectionId}-title`);
            
            // Populate the template with state data
            clone.querySelector('.section-heading-text').textContent = state.sections[sectionId].title;
            clone.querySelector('.section-heading-text').id = `${sectionId}-title`;
            
            const gridEl = clone.querySelector('.movie-grid');
            gridEl.id = `${sectionId}-grid`;
            
            clone.querySelector('.more-btn-container').id = `${sectionId}-more-container`;
            clone.querySelector('.more-btn').id = `${sectionId}-more`;
            
            // Append to the main content area
            container.appendChild(clone);
            grid = gridEl;
        }
    }
    return grid;
}

/**
 * Calculates the appropriate card visibility threshold based on current window width.
 * Follows the design specifications:
 * - Mobile (< 768px): 2 cards
 * - Tablet (768px - 1023px): 4 cards
 * - Desktop (>= 1024px): 6 cards
 * 
 * @returns {number} The maximum number of cards to show in collapsed state.
 */
function getResponsiveThreshold() {
    const width = window.innerWidth;
    if (width < 768) return 2;
    if (width < 1024) return 4;
    return 6;
}

/**
 * Manages the toggle logic for the Custom Genre section (the "Autres" section).
 * Switches visibility between the "Select a genre" placeholder and the actual results grid.
 * 
 * @param {string} sectionId - The section ID.
 * @param {HTMLElement} grid - The grid element.
 * @param {HTMLElement} placeholder - The placeholder element.
 * @param {HTMLElement} moreContainer - The container for the "Voir plus" button.
 * @returns {boolean} True if the placeholder was activated, false otherwise.
 */
function handleCustomPlaceholder(sectionId, grid, placeholder, moreContainer) {
    if (sectionId !== 'custom') return false;
    
    const showPlaceholder = state.sections.custom.showPlaceholder;
    if (showPlaceholder && placeholder) {
        // Display the helpful message to select a genre
        grid.classList.add('hidden-element');
        placeholder.style.display = 'flex';
        if (moreContainer) moreContainer.classList.add('hidden-element');
        return true;
    } else if (placeholder) {
        // Hide the placeholder and prepare for grid rendering
        grid.classList.remove('hidden-element');
        placeholder.style.display = 'none';
    }
    return false;
}

/**
 * Instantiates movie card components and appends them to the target grid.
 * Applies a cumulative animation delay to each card for a staggered reveal effect.
 * 
 * @param {HTMLElement} grid - The grid container to append cards to.
 * @param {Array<Object>} items - The list of movie objects to render.
 */
function renderGridCards(grid, items) {
    items.forEach((m, index) => {
        const card = createMovieCard(m);
        // Sequential reveal animation: Delay increases by 0.1s for each following card
        card.classList.add('card-animated');
        card.style.animationDelay = `${index * 0.1}s`;
        grid.appendChild(card);
    });
}

/**
 * Updates the visibility, label, and event handler of the "Voir plus / Voir moins" button.
 * Only displays the button if the total number of items exceeds the responsive threshold.
 * 
 * @param {string} sectionId - The ID of the section being processed.
 * @param {Array<Object>} totalData - The full list of movies for this section.
 * @param {number} threshold - The current visibility threshold based on screen size.
 */
function handleMoreButton(sectionId, totalData, threshold) {
    const moreBtn = document.getElementById(`${sectionId}-more`);
    const moreContainer = document.getElementById(`${sectionId}-more-container`);
    
    if (!moreBtn || !moreContainer) return;

    const isExpanded = state.sections[sectionId].isExpanded;

    // Toggle container visibility based on data count vs threshold
    if (totalData.length <= threshold) {
        moreContainer.classList.add('hidden-element');
    } else {
        moreContainer.classList.remove('hidden-element');
        // Inline closure handler to maintain context of sectionId and totalData
        moreBtn.onclick = () => {
            state.sections[sectionId].isExpanded = !isExpanded;
            renderSection(sectionId, totalData);
        };

        // Accessibility: Dynamic label that reflects the current toggle state
        const action = isExpanded ? "Voir moins" : "Voir plus";
        moreBtn.textContent = action;
        moreBtn.setAttribute('aria-label', `${action} de films pour la catégorie ${state.sections[sectionId].title}`);
    }
}
