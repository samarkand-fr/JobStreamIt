/* ============================================================
   MODAL
   ============================================================ */

function safe(val, fallback = 'N/A') {
    if (!val) return fallback;
    if (Array.isArray(val)) return val.length ? val.join(', ') : fallback;
    return val;
}

async function openModal(id) {
    const modal = document.getElementById('movie-modal');
    const content = document.getElementById('modal-content');
    modal.classList.remove('hidden-element');
    modal.classList.add('flex-element');
    document.body.style.overflow = 'hidden';

    content.innerHTML = '<div class="modal-loading">Chargement...</div>';

    const movie = await fetchMovieDetails(id);
    if (!movie) {
        content.innerHTML = '<div class="modal-error">Erreur lors du chargement des détails.</div>';
        return;
    }

    content.innerHTML = `
        <!-- DESKTOP MODAL (lg and up) -->
        <div class="modal-desktop modal-desktop-container">
            <div class="modal-inner-row">
                <!-- Top Section -->
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
                        <p class="font-normal">${safe(movie.directors)}</p>
                    </div>
                </div>
                
                <!-- Right Image -->
                <div class="modal-img-col">
                    <img src="${movie.image_url}" class="modal-poster" onerror="this.src='assets/img/placeholder.png'">
                </div>
            </div>

            <!-- Bottom Description -->
            <div class="modal-desc-section">
                <p class="modal-long-desc">${movie.long_description || movie.description}</p>
                <div class="modal-cast-section">
                    <p class="font-bold mb-1">Avec:</p>
                    <p class="font-normal leading-snug">${safe(movie.actors)}</p>
                </div>
            </div>

            <!-- Bottom Button -->
            <div class="modal-footer">
                <button class="modal-close-btn" onclick="closeModal()">
                    Fermer
                </button>
            </div>
        </div>

        <!-- TABLET & MOBILE MODAL (below lg) -->
        <div class="modal-mobile modal-mobile-container">
            <!-- X Button top right -->
            <button class="modal-mobile-x" onclick="closeModal()">&times;</button>
            
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
            
            <img src="${movie.image_url}" class="modal-mobile-poster" onerror="this.src='assets/img/placeholder.png'">
            
            <div class="modal-mobile-cast">
                <p class="font-bold mb-1 leading-snug">Avec:</p>
                <p class="font-normal leading-snug">${safe(movie.actors)}</p>
            </div>
        </div>
    `;
}

function closeModal() {
    const modal = document.getElementById('movie-modal');
    modal.classList.add('hidden-element');
    modal.classList.remove('flex-element');
    document.body.style.overflow = '';
}
