const API_URL = 'http://localhost:8000/api/v1';
const MOVIES_PER_SECTION = 6;

async function fetchMovies(params = '', count = MOVIES_PER_SECTION) {
    const collected = [];
    // 1. Start with the initial URL
    let url = `${API_URL}/titles/?${params}`;
    
    console.log(`Starting fetch: ${url}`);
    
    try {
        while (collected.length < count && url) {
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(` API Error: ${response.status}`);
                break;
            }
            
            const data = await response.json();
            collected.push(...data.results);
            
            console.log(`Collected ${collected.length}/${count} movies`);
            console.table(data.results);
            
            // 2. Only fetch 'next' if we haven't reached our count yet
            url = (collected.length < count) ? data.next : null;
        }
    } catch (err) { 
        console.error('fetchMovies error:', err); 
    }
    
    // 3. Return exactly the amount requested
    return collected.slice(0, count);
}

fetchMovies()