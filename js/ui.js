
function createMovieCard(movie) {
    const tpl = document.getElementById('movie-card-tpl');
    const card = tpl.content.cloneNode(true).querySelector('article');
    const img = card.querySelector('.card-img');
    const titleEl = card.querySelector('.card-title');

    img.src = movie.image_url;
    img.alt = movie.title;
    img.onerror = () => { img.src = 'assets/img/placeholder.png'; };
    if (titleEl) titleEl.textContent = movie.title;

    card.addEventListener('click', () => openModal(movie.id));
    return card;
}

function renderSection(sectionId, movies, showPlaceholder) {
    let grid = document.getElementById(sectionId === 'custom' ? 'custom-grid' : `${sectionId}-grid`);
    const placeholder = document.getElementById('custom-placeholder');
    const moreContainer = document.getElementById(`${sectionId}-more-container`);

    // DRY DOM Creation: Instantiating the section via JS templates if missing
    if (!grid && ['top-rated', 'cat1', 'cat2'].includes(sectionId)) {
        const container = document.getElementById('dynamic-categories');
        const tpl = document.getElementById('category-section-tpl');
        if (container && tpl) {
            const clone = tpl.content.cloneNode(true);
            const section = clone.querySelector('section');
            section.id = sectionId;
            section.setAttribute('aria-labelledby', `${sectionId}-title`);
            
            const title = clone.querySelector('.section-heading-text');
            title.id = `${sectionId}-title`;
            title.textContent = state.sections[sectionId].title;
            
            grid = clone.querySelector('.movie-grid');
            grid.id = `${sectionId}-grid`;
            
            const moreContainerClone = clone.querySelector('.more-btn-container');
            moreContainerClone.id = `${sectionId}-more-container`;
            
            const moreBtn = clone.querySelector('.more-btn');
            moreBtn.id = `${sectionId}-more`;
            
            container.appendChild(clone);
        }
    }
    
    if (!grid) return;

    const data = movies || state.sections[sectionId].movies || [];
    const isExpanded = state.sections[sectionId].isExpanded;

    // Toggle Placeholder for custom section
    if (sectionId === 'custom' && state.sections.custom.showPlaceholder && placeholder) {
        grid.classList.add('hidden-element');
        placeholder.style.display = 'flex';
        if (moreContainer) moreContainer.classList.add('hidden-element');
        return;
    } else if (sectionId === 'custom' && placeholder) {
        grid.classList.remove('hidden-element');
        placeholder.style.display = 'none';
    }

    grid.innerHTML = '';
    
    let threshold = 6;
    const width = window.innerWidth;
    if (width < 768) {
        threshold = 2;
    } else if (width < 1024) {
        threshold = 4;
    }
    
    // Slice data if not expanded
    const itemsToDisplay = isExpanded ? data : data.slice(0, threshold);
    
    // Render the grid: Create and append movie cards with staggered animations
    itemsToDisplay.forEach((m, index) => {
        const card = createMovieCard(m);
        card.classList.add('card-animated');
        card.style.animationDelay = `${index * 0.1}s`;
        grid.appendChild(card);
    });


    const moreBtn = document.getElementById(`${sectionId}-more`);
    
    if (moreContainer && moreBtn) {
        // Force hide on desktop (width >= 1024) OR hide if movies count below threshold
        if (data.length <= threshold || width >= 1024) {
            moreContainer.classList.add('hidden-element');
        } else {
            moreContainer.classList.remove('hidden-element');
            moreBtn.textContent = isExpanded ? 'Voir moins' : 'Voir plus';
            moreBtn.onclick = () => {
                state.sections[sectionId].isExpanded = !state.sections[sectionId].isExpanded;
                renderSection(sectionId, data, showPlaceholder);
            };
        }
    }
}
