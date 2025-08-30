# NetChill Movie House

A modern, responsive web app for browsing, searching, rating, and favoriting movies using the TMDb API. Built with vanilla JavaScript, HTML, and CSS.

## Features

- **Trending/Home Page**: Shows popular movies from TMDb on load.
- **All Movies Page**: Browse all popular movies, filter by genre, and view details.
- **Favorites Page**: View, sort, and manage your favorite movies.
- **Search**: Search for movies by title with instant suggestions.
- **Favorites System**: Add/remove movies to favorites, persisted in localStorage.
- **Rating System**: Rate movies (1-5 stars), persisted in localStorage. Click the same star again to unselect/reset rating.
- **Sorting Favorites**: Sort favorites by rating, title, or default order.
- **Details Modal**: Click 'Details' to view movie info, genres, cast (with truncation and 'Show more'), images, and trailers (YouTube embeds).
- **Trailers Modal**: View all available trailers in a modal carousel.
- **Genre Filtering**: Filter movies by genre on the all movies page.
- **Accessibility**: Keyboard navigation, ARIA labels, focus states.
- **Responsive Design**: Works on desktop and mobile.
- **Modern UI**: Custom navbar, grid layouts, styled buttons, modals, and dropdowns.

## File Structure

```
MovieHouse/
├── index.html           # Home/trending page
├── allmovies.html       # All movies page
├── favorites.html       # Favorites page
├── script.js            # Main logic for home/trending/search/favorites
├── allmovies.js         # Logic for all movies page (genre filter, modal, etc.)
├── favorites.js         # Logic for favorites page (sorting, modal, etc.)
├── style.css            # Custom styles for all pages
├── apiKey.js            # API key file (local only, ignored by git)
├── .gitignore           # Ignore apiKey.js and other secrets
├── README.md            # Project documentation
```

## How It Works

- **TMDb API**: All movie data, images, genres, cast, and trailers are fetched from TMDb. You need a TMDb API key (see below).
- **localStorage**: Favorites and ratings are saved in the browser for persistence.
- **Dynamic DOM**: All UI elements (movies, modals, navbars, genre filters, suggestions) are created and updated via JavaScript.
- **Search Suggestions**: As you type, partial matches are fetched and shown in a dropdown. Click a suggestion to search.
- **Details Modal**: Shows movie info, genres, cast (truncated with 'Show more'), images, and a button to view trailers.
- **Trailers Modal**: Shows all available trailers in a carousel modal.
- **Favorites Sorting**: On the favorites page, sort by rating, title, or default using the controls above the grid.
- **Rating Unselect**: Click the same star again to reset your rating to zero.

## Setup & Usage (Local Development)

1. **Clone or Download**
   - Download the project folder or clone from your repository.

2. **TMDb API Key**
   - Get a free API key from [TMDb](https://www.themoviedb.org/documentation/api).
   - Create a file named `apiKey.js` in your project root:
     ```js
     const apiKey = "YOUR_TMDB_API_KEY_HERE";
     ```
   - Make sure `apiKey.js` is listed in `.gitignore` so it is not pushed to GitHub.
   - The app loads `apiKey.js` before main scripts in each HTML file.

3. **Open in Browser**
   - Open `index.html` in your browser to start using the app.
   - Navigate between Home, All Movies, and Favorites using the navbar.

## Production Hosting (Vercel or similar)

**Do NOT expose your API key in client-side code!**

- Store your TMDb API key as an environment variable in Vercel.
- Create a backend API route (serverless function) in `/api/tmdb.js`:
  ```js
  export default async function handler(req, res) {
    const { url } = req.query;
    const apiKey = process.env.TMDB_API_KEY;
    if (!url) return res.status(400).json({ error: "Missing TMDb endpoint URL" });
    const tmdbUrl = `https://api.themoviedb.org/3/${url}${url.includes('?') ? '&' : '?'}api_key=${apiKey}`;
    const response = await fetch(tmdbUrl);
    const data = await response.json();
    res.status(response.status).json(data);
  }
  ```
- In your frontend, fetch from `/api/tmdb?url=movie/popular&page=1` instead of TMDb directly.
- This keeps your API key secret and lets you host securely for free on Vercel.

## Accessibility & Responsiveness

- Keyboard navigation for all interactive elements.
- ARIA labels and focus states for buttons and dropdowns.
- Responsive grid layouts and modals for mobile and desktop.

## Customization

- **Styling**: Edit `style.css` for custom colors, fonts, and layouts.
- **API Key**: Change the `apiKey` variable in JS files (local only).
- **Pages**: Add new pages or features by extending the JS and HTML files.

## Known Issues & Limitations

- Only movies with posters and basic info are shown (per TMDb API).
- Favorites and ratings are stored per browser (localStorage).
- No user authentication or backend (unless you add a proxy as above).

## Important Note on API Key Security
To keep your TMDb API key secure, do not hardcode it directly into your JavaScript files that run in the browser. Instead, use one of the following methods:
1. **Local Development**: Store the API key in a separate `apiKey.js` file that is included in `.gitignore` so it is not pushed to version control. Load this file before your main scripts in your HTML files.
2. **Production Hosting**: Use environment variables and a backend proxy (e.g., serverless function) to keep the API key secret, as described above for Vercel.


## Credits

- Movie data, images, genres, and trailers: [TMDb](https://www.themoviedb.org/)
- UI/UX: Custom vanilla JS and CSS

## License

MIT License 

---

Enjoy browsing and rating movies with NetChill Movie House!

Made with 💖 by **Providence Oduok, JavaScript Trainer**👩‍💻 for Fhenix Africa TechCamp 2025 👩‍💻