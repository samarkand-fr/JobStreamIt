

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
    bestMovieId: null,
    sections: {
        // Section: Top Rated movies (global)
        'top-rated': { 
            params: 'imdb_score_min=9.0', 
            title: 'Films les mieux notés', 
            movies: [], 
            isExpanded: false, 
            showPlaceholder: false 
        },
        // Section: Mystery genre (Specific category 1)
        'cat1': { 
            params: 'genre=Mystery&imdb_score_min=8.0', 
            title: 'Mystery', 
            movies: [], 
            isExpanded: false, 
            showPlaceholder: false 
        },
        // Section: Adventure genre (Specific category 2)
        'cat2': { 
            params: 'genre=Adventure&imdb_score_min=8.0', 
            title: 'Adventure', 
            movies: [], 
            isExpanded: false, 
            showPlaceholder: false 
        },
        // Section: Custom genre (Selected via dropdown)
        'custom': { 
            params: 'imdb_score_min=8.0', 
            title: 'Autres', 
            movies: [], 
            isExpanded: false, 
            showPlaceholder: true 
        }
    }
};
