

/* ============================================================
   CONFIGURATION AND STATE
   ============================================================ */

/**
 * Base URL for the OCMovies API
 */
const API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * Number of movies to fetch and display per section by default
 */
const MOVIES_PER_SECTION = 6;
 
/** 
* Placeholder image URL for movies without a valid image
*/
const PLACEHOLDER_IMG = 'assets/img/placeholder.png';

/**
 * Global state of the application
 * - bestMovieId: ID of the highest rated movie to avoid duplicates in grids
 * - sections: Configuration for each movie category displayed on the home page
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