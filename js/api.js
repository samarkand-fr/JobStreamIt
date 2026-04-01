/**
 * api.js – OCMOVIES API SERVICE
 * 
 * Centralized logic for interacting with the OCMovies REST API.
 * Handles pagination automatically to meet the requirements of 
 * fetching specific counts of movies (e.g., 7 or 12).
 */

'use strict';

/**
 * Fetches a list of movies from the API with pagination support.
 * It will iterate through pages until the requested 'count' is reached or no more pages exist.
 * 
 * @param {string} params - Query string parameters (e.g., 'genre=Mystery&sort_by=-imdb_score').
 * @param {number} count - Total number of movie objects to collect.
 * @returns {Promise<Array<Object>>} Resolved promise with an array of movie summaries.
 */
async function fetchMovies(params = '', count = MOVIES_PER_SECTION) {
    const collected = [];
    let url = `${API_BASE_URL}/titles/?${params}&page_size=${count}`;
    
    try {
        // Continue fetching until the buffer is full or the API runs out of pages
        while (collected.length < count && url) {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`API responded with status: ${response.status}`);
                break;
            }
            const data = await response.json();
            collected.push(...data.results);
            
            // Link to the next page if more movies are still needed
            url = (collected.length < count) ? data.next : null;
        }
    } catch (err) { 
        console.error('fetchMovies network error:', err); 
        // Return whatever was collected before the error occurred
    }
    
    // Return precisely the number requested (or less if not available)
    return collected.slice(0, count);
}

/**
 * Fetches detailed metadata for a single movie.
 * Required for the Hero section and Modals to get long descriptions and full actor lists.
 * 
 * @param {number} id - The movie ID.
 * @returns {Promise<Object|null>} Full movie object or null if not found/error.
 */
async function fetchMovieDetails(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/titles/${id}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (err) { 
        console.error(`fetchMovieDetails error for ID ${id}:`, err);
        return null; 
    }
}

/**
 * Fetches all available genres from the API.
 * Iterates through all paginated results to ensure no genre is missed.
 * 
 * @returns {Promise<Array<Object>>} List of all genre objects { id, name }.
 */
async function fetchAllGenres() {
    const genres = [];
    let url = `${API_BASE_URL}/genres/?page_size=20`;
    
    try {
        while (url) {
            const response = await fetch(url);
            if (!response.ok) break;
            const data = await response.json();
            genres.push(...data.results);
            url = data.next;
        }
    } catch (err) {
        console.error('fetchAllGenres error:', err);
    }
    return genres;
}
