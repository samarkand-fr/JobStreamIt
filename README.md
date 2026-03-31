# JustStreamIt

JustStreamIt is a modern web application for discovering movies, inspired by cinema interfaces. It features a curated selection of top-rated films, category-specific grids, a dynamic genre selector, and detailed movie modals.

## Features

- **Hero Highlight**: Features the best-rated movie with a summary and direct access to details.
- **Top Rated Section**: Shows the absolute best movies from the API.
- **Categorical Grids**: Organized view of movies by specific genres (Mystery, Adventure).
- **Dynamic Genre Selector**: Allows users to explore any genre available in the API.
- **Responsive Design**: Tailored experiences for Mobile, Tablet, and Desktop viewports.
- **Modular Architecture**: Built with Vanilla JavaScript, HTML5, and modular CSS.

## Getting Started

### Prerequisites

- A modern web browser.
- A running instance of the OCMovies API (default: `http://localhost:8000/api/v1`).

### Installation

### Installation Steps

1. **Clone the repository** to your local machine.

```bash
git clone https://github.com/samarkand-fr/JobStreamIt.git
```

2. **Start the OCMovies backend server** — refer to the detailed instructions in the [OCMovies-API-EN-FR repository](https://github.com/OpenClassrooms-Student-Center/OCMovies-API-EN-FR).
3. **Verify the API endpoint** in `js/config.js` (default is `http://localhost:8000/api/v1`).
4. **Open `index.html`** in a modern web browser.

## Project Structure

- `index.html`: Main entry point and DOM structure.
- `css/`: Modular stylesheets for layout, hero, grids, forms, and modals.
- `js/`: JavaScript modules:
  - `config.js`: Global state and API configuration.
  - `api.js`: Data fetching services.
  - `ui.js`: DOM rendering and responsive logic.
  - `modal.js`: Modal management and detail fetching.
  - `main.js`: Application initialization and event orchestration.
- `assets/`: Image assets and design tokens.

## Technologies

- **HTML5**: Semantic structure.
- **CSS3**: Responsive layouts and modern aesthetics.
- **JavaScript (ES6+)**: Functional logic and API integration.

---
© 2026 JustStreamIt.
