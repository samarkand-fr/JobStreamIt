/* ============================================================
   API SERVICE
   ============================================================ */

async function fetchMovies(params = '', count = MOVIES_PER_SECTION) {
    const collected = [];
    let url = `${API_BASE_URL}/titles/?${params}&page_size=${count}`;
    try {
        while (collected.length < count && url) {
            const response = await fetch(url);
            if (!response.ok) break;
            const data = await response.json();
            collected.push(...data.results);
            url = (collected.length < count) ? data.next : null;
        }
    } catch (err) { console.error('fetchMovies error:', err); }
    return collected.slice(0, count);
}

async function fetchMovieDetails(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/titles/${id}`);
        return response.ok ? await response.json() : null;
    } catch (err) { return null; }
}

async function fetchAllGenres() {
    const genres = [];
    let url = `${API_BASE_URL}/genres/?page_size=20`;
    try {
        while (url) {
            const response = await fetch(url);
            const data = await response.json();
            genres.push(...data.results);
            url = data.next;
        }
    } catch (err) { }
    return genres;
}