

/* ============================================================
   CONFIGURATION AND STATE
   ============================================================ */

/**
 * @constant {string} API_BASE_URL 
 * The root endpoint for the localized OCMovies backend server.
 */
const API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * @constant {number} MOVIES_PER_SECTION 
 * The default slice quantity of movie cards to inject into the DOM per category grid.
 */
const MOVIES_PER_SECTION = 6;

/**
 * @typedef {Object} SectionState
 * @property {string} params - The query string parameters appended to the API fetch (e.g., genre routing).
 * @property {string} title - The localized display title for the section grid.
 * @property {Array<Object>} movies - The array housing the resolved and instantiated movie objects from the API fetch.
 * @property {boolean} isExpanded - Toggles the layout rendering size between truncated and full expansion mapping.
 * @property {boolean} showPlaceholder - Dictates whether the category dropdown grid is currently visible or masked behind the generic placeholder box.
 */

/**
 * @type {{
 *   bestMovieId: number|null,
 *   sections: Record<string, SectionState>
 * }}
 * Global application storage tree. Centralizes real-time state mutations for modal routing and grid updates across the entire client.
 */
const state = {
    bestMovieId: null, // Tracks the ID of the movie featured in the Hero section to avoid duplication in grids
    sections: {
        // Absolute best movies based on IMDb score
        'top-rated': {
            params: 'sort_by=-imdb_score',
            title: 'Films les mieux notés',
            movies: [],
            isExpanded: false,
            showPlaceholder: false
        },
        // Hardcoded category 1: Mystery
        'cat1': {
            params: 'genre=Mystery&sort_by=-imdb_score',
            title: 'Mystery',
            movies: [],
            isExpanded: false,
            showPlaceholder: false
        },
        // Hardcoded category 2: Adventure
        'cat2': {
            params: 'genre=Adventure&sort_by=-imdb_score',
            title: 'Adventure',
            movies: [],
            isExpanded: false,
            showPlaceholder: false
        },
        // Dynamic category selected by the user via the dropdown
        'custom': {
            params: 'sort_by=-imdb_score',
            title: 'Autres',
            movies: [],
            isExpanded: false,
            showPlaceholder: true // Starts with a placeholder until a genre is selected
        }
    }
};
