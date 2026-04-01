'use strict';
/**
 * Main rendering function for section grids.
 */
function renderSection(sectionId, movies) {
    // 1. Ensure the section and its grid exist in the DOM
    let grid = ensureSectionExists(sectionId);
    if (!grid) return;

    const data = movies || state.sections[sectionId].movies || [];
    const isExpanded = state.sections[sectionId].isExpanded;
    const placeholder = document.getElementById('custom-placeholder');
    const moreContainer = document.getElementById(`${sectionId}-more-container`);

    // 2. Handle specific states: Custom Genre Placeholder and Error/Empty states
    if (handleCustomPlaceholder(sectionId, grid, placeholder, moreContainer)) return;
    
    grid.innerHTML = '';
    if (data.length === 0) {
        renderError(grid, `Aucun film trouvé pour la catégorie "${state.sections[sectionId].title}".`);
        if (moreContainer) moreContainer.classList.add('hidden-element');
        return;
    }

    // 3. Calculate layout and render cards
    const threshold = getResponsiveThreshold();
    const itemsToDisplay = isExpanded ? data : data.slice(0, threshold);
    
    renderGridCards(grid, itemsToDisplay);

    // 4. Update the "Voir plus" button visibility and action
    handleMoreButton(sectionId, data, threshold);
}

/**
 * Creates a movie card from a template.
 */
function createMovieCard(movie) {
    const tpl = document.getElementById('movie-card-tpl');
    const card = tpl.content.cloneNode(true).querySelector('article');
    const img = card.querySelector('.card-img');
    
    img.src = movie.image_url;
    img.alt = movie.title;
    img.onerror = () => { img.src = 'assets/img/placeholder.png'; };
    
    const titleEl = card.querySelector('.card-title');
    if (titleEl) titleEl.textContent = movie.title;

    card.onclick = () => openModal(movie.id);
    return card;
}

/**
 * Displays an error message with a retry button.
 */
function renderError(container, message = 'Échec du chargement.') {
    container.innerHTML = `
        <div class="error-message-container" style="padding: 20px; text-align: center; color: var(--brand-dark); font-family: Oswald;">
            <p>${message}</p>
            <button class="btn-primary" onclick="location.reload()" style="margin-top:10px; padding:5px 15px;">Réessayer</button>
        </div>
    `;
}


/**
 * Ensures the section exists, creating it from a template if needed.
 */
function ensureSectionExists(sectionId) {
    let grid = document.getElementById(sectionId === 'custom' ? 'custom-grid' : `${sectionId}-grid`);
    
    if (!grid && ['top-rated', 'cat1', 'cat2'].includes(sectionId)) {
        const container = document.getElementById('dynamic-categories');
        const tpl = document.getElementById('category-section-tpl');
        if (container && tpl) {
            const clone = tpl.content.cloneNode(true);
            const section = clone.querySelector('section');
            section.id = sectionId;
            section.setAttribute('aria-labelledby', `${sectionId}-title`);
            
            clone.querySelector('.section-heading-text').textContent = state.sections[sectionId].title;
            clone.querySelector('.section-heading-text').id = `${sectionId}-title`;
            
            const gridEl = clone.querySelector('.movie-grid');
            gridEl.id = `${sectionId}-grid`;
            
            clone.querySelector('.more-btn-container').id = `${sectionId}-more-container`;
            clone.querySelector('.more-btn').id = `${sectionId}-more`;
            
            container.appendChild(clone);
            grid = gridEl;
        }
    }
    return grid;
}

/**
 * Returns the card threshold based on viewport width.
 * Mobile: 2, Tablet: 4, Desktop: 6
 */
function getResponsiveThreshold() {
    const width = window.innerWidth;
    if (width < 768) return 2;
    if (width < 1024) return 4;
    return 6;
}

/**
 * Handles the "select a genre" vs results grid toggle for the Custom section.
 * Returns true if the placeholder is currently active.
 */
function handleCustomPlaceholder(sectionId, grid, placeholder, moreContainer) {
    if (sectionId !== 'custom') return false;
    
    const showPlaceholder = state.sections.custom.showPlaceholder;
    if (showPlaceholder && placeholder) {
        grid.classList.add('hidden-element');
        placeholder.style.display = 'flex';
        if (moreContainer) moreContainer.classList.add('hidden-element');
        return true;
    } else if (placeholder) {
        grid.classList.remove('hidden-element');
        placeholder.style.display = 'none';
    }
    return false;
}

/**
 * Instantiates and appends movie cards to the grid with staggered animations.
 */
function renderGridCards(grid, items) {
    items.forEach((m, index) => {
        const card = createMovieCard(m);
        card.classList.add('card-animated');
        card.style.animationDelay = `${index * 0.1}s`;
        grid.appendChild(card);
    });
}

/**
 * Manages the "Voir plus" button visibility and text.
 */
function handleMoreButton(sectionId, totalData, threshold) {
    const moreBtn = document.getElementById(`${sectionId}-more`);
    const moreContainer = document.getElementById(`${sectionId}-more-container`);
    
    if (!moreBtn || !moreContainer) return;

    const isExpanded = state.sections[sectionId].isExpanded;

    if (totalData.length <= threshold) {
        moreContainer.classList.add('hidden-element');
    } else {
        moreContainer.classList.remove('hidden-element');
        moreBtn.textContent = isExpanded ? 'Voir moins' : 'Voir plus';
        moreBtn.onclick = () => {
            state.sections[sectionId].isExpanded = !isExpanded;
            renderSection(sectionId, totalData);
        };
    }
}
