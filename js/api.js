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
 * fetchAllGenres – Retrieves the complete list of genres from the API.
 * * This function handles pagination automatically. By setting page_size=30,
 * it attempts to fetch all known genres (~25) in a single request for speed,
 * but will continue fetching if the API contains more pages.
 *
 * @returns {Promise<Array>} A list of all genre objects found.
 */
async function fetchAllGenres() {
    const genres = [];
    
    // Start with the first page. page_size=30 maximizes the items per request 
    // to reduce the number of total network round-trips.
    let url = `${API_BASE_URL}/genres/?page_size=30`;
    
    try {
        // Continue looping as long as the API provides a 'next' page URL.
        while (url) {
            const response = await fetch(url);
            
            // Stop the loop if the server returns an error (e.g., 404 or 500).
            if (!response.ok) break;

            const data = await response.json();
            
            // Spread the current page results into our master genres array.
            genres.push(...data.results);
            
            // Update the url variable with the 'next' property from the API.
            // If there are no more pages, 'next' is null, which exits the while loop.
            url = data.next;
        }
    } catch (err) {
        // Log network-level errors (like being offline) without crashing the app.
        console.error('fetchAllGenres error:', err);
    }

    // Returns all collected genres (or an empty array if the fetch failed).
    return genres;
}