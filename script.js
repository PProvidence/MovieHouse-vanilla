// apiKey is loaded from apiKey.js
const imgBaseURL = "https://image.tmdb.org/t/p/w500";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const moviesContainer = document.getElementById("movies-container");

// Load popular movies on page start
document.addEventListener("DOMContentLoaded", getPopularMovies);
// document.getElementById('favoritesBtn').addEventListener('click', () => {
  //   window.location.href = 'favorites.html';
  // });
  
  
  // Navbar
  const navbar = document.createElement('nav');
  navbar.className = 'navbar';
  navbar.innerHTML = `
  <h1><span class="logo" style="font-size:1.5em;font-weight:bold;color:#ffc107;margin-right:18px;">NetChill</span></h1>
  <div>
  <button id="homeBtn" class="nav-btn" aria-label="Home">Home</button>
  <button id="favoritesBtn" class="nav-btn" aria-label="Favorites">★ My Favorites</button>
  <button id="seeAllBtn" class="nav-btn" aria-label="See All Movies">See All Movies</button>
  </div>
  `;
  document.body.insertBefore(navbar, document.body.firstChild);
  
  document.getElementById('homeBtn').addEventListener('click', getPopularMovies);
  document.getElementById('favoritesBtn').addEventListener('click', () => {
  window.location.href = 'favorites.html';
});
document.getElementById('seeAllBtn').addEventListener('click', () => {
  window.location.href = 'allmovies.html';
});
// Search movies
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    searchMovies(query);
  }
});

// Fetch popular movies
async function getPopularMovies() {
  const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
  const data = await res.json();
  displayMovies(data.results);
}

// Fetch searched movies
async function searchMovies(query) {
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`);
  const data = await res.json();
  displayMovies(data.results);
}

// Display movies in grid
function displayMovies(movies) {
  moviesContainer.innerHTML = "";
  const favorites = getFavorites();
  movies.forEach(movie => {
    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");
    // Rating stars
    const userRating = getRating(movie.id);
    let starsHtml = '<div class="stars" data-movieid="' + movie.id + '">';
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<span class="star${i <= userRating ? ' filled' : ''}" data-star="${i}">&#9733;</span>`;
    }
    starsHtml += '</div>';
    // Favorite button
    const isFav = favorites.some(f => f.id === movie.id);
    const favBtnHtml = `<button class="fav-btn" data-movieid="${movie.id}">${isFav ? '★ Remove Favorite' : '☆ Add to Favorites'}</button>`;
    movieEl.innerHTML = `
      <img src="${imgBaseURL + movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      ${favBtnHtml}
      ${starsHtml}
      <button class="trailer-btn" onclick="getTrailers(${movie.id}, this)">Show Trailers</button>
      <button class="details-btn" data-movieid="${movie.id}">Details</button>
      <div class="trailers"></div>
    `;
    moviesContainer.appendChild(movieEl);
  });
  // Add event listeners for favorites and rating
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.onclick = function() {
      const movieId = Number(this.getAttribute('data-movieid'));
      const movie = movies.find(m => m.id === movieId);
      if (!movie) return;
      if (isFavorite(movieId)) {
        removeFavorite(movieId);
        this.textContent = '☆ Add to Favorites';
      } else {
        addFavorite(movie);
        this.textContent = '★ Remove Favorite';
      }
    };
  });
  document.querySelectorAll('.stars').forEach(starsDiv => {
    starsDiv.querySelectorAll('.star').forEach(star => {
      star.onclick = function() {
        const movieId = Number(starsDiv.getAttribute('data-movieid'));
        const rating = Number(this.getAttribute('data-star'));
        let currentRating = getRating(movieId);
        const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
        if (currentRating === rating) {
          ratings[movieId] = 0;
          localStorage.setItem('ratings', JSON.stringify(ratings));
          starsDiv.querySelectorAll('.star').forEach(s => s.classList.remove('filled'));
        } else {
          ratings[movieId] = rating;
          localStorage.setItem('ratings', JSON.stringify(ratings));
          starsDiv.querySelectorAll('.star').forEach((s, idx) => {
            if (idx < rating) s.classList.add('filled');
            else s.classList.remove('filled');
          });
        }
      };
    });
  });
  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.onclick = function() {
      const movieId = this.getAttribute('data-movieid');
      showDetailsModal(movieId);
    };
  });
}
// Details modal
const detailsModal = document.createElement('div');
detailsModal.id = 'detailsModal';
detailsModal.style.display = 'none';
detailsModal.innerHTML = `
  <div class="modal-content">
    <span class="close-btn">&times;</span>
    <div class="details-content"></div>
  </div>
`;
document.body.appendChild(detailsModal);
detailsModal.querySelector('.close-btn').onclick = () => {
  detailsModal.style.display = 'none';
};
async function showDetailsModal(movieId) {
  // Fetch details from TMDb API
  const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US&append_to_response=credits`);
  const data = await res.json();
  // Get actors
  let actors = '';
  if (data.credits && data.credits.cast) {
    actors = data.credits.cast.slice(0, 5).map(a => a.name).join(', ');
  }
  detailsModal.querySelector('.details-content').innerHTML = `
    <h2>${data.title}</h2>
    <p><strong>Plot:</strong> ${data.overview || 'N/A'}</p>
    <p><strong>Genres:</strong> ${data.genres ? data.genres.map(g => g.name).join(', ') : 'N/A'}</p>
    <p><strong>Actors:</strong> ${actors || 'N/A'}</p>
    <p><strong>TMDb Rating:</strong> ${data.vote_average || 'N/A'}</p>
    <p><strong>Release Date:</strong> ${data.release_date || 'N/A'}</p>
  `;
  detailsModal.style.display = 'flex';
}
// Favorites system using localStorage
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  } catch {
    return [];
  }
}
function addFavorite(movie) {
  const favs = getFavorites();
  if (!favs.some(f => f.id === movie.id)) {
    favs.push({ id: movie.id, title: movie.title, poster_path: movie.poster_path });
    localStorage.setItem('favorites', JSON.stringify(favs));
  }
}
function removeFavorite(movieId) {
  let favs = getFavorites();
  favs = favs.filter(f => f.id !== movieId);
  localStorage.setItem('favorites', JSON.stringify(favs));
}
function isFavorite(movieId) {
  return getFavorites().some(f => f.id === movieId);
}

// Rating system using localStorage
function getRating(movieId) {
  const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
  return ratings[movieId] || 0;
}
function setRating(movieId, rating) {
  const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
  ratings[movieId] = rating;
  localStorage.setItem('ratings', JSON.stringify(ratings));
}
// Show favorites section
function showFavorites(sortBy = 'default') {
  let favs = getFavorites();
  if (sortBy === 'rating') {
    favs = favs.slice().sort((a, b) => getRating(b.id) - getRating(a.id));
  } else if (sortBy === 'title') {
    favs = favs.slice().sort((a, b) => a.title.localeCompare(b.title));
  }
  if (favs.length === 0) {
    moviesContainer.innerHTML = '<p style="color:#ff6347;text-align:center;">No favorites yet.</p>';
    return;
  }
  // Fake movie objects for display
  displayMovies(favs.map(f => ({
    id: f.id,
    title: f.title,
    poster_path: f.poster_path
  })));
}
// Add sort controls for favorites
function renderFavoritesSortControls() {
  let controls = document.getElementById('favoritesSortControls');
  if (!controls) {
    controls = document.createElement('div');
    controls.id = 'favoritesSortControls';
    controls.style.display = 'flex';
    controls.style.gap = '12px';
    controls.style.margin = '18px 0 0 0';
    controls.innerHTML = `
      <button id="sortByRating" style="padding:8px 16px;">Sort by Rating</button>
      <button id="sortByTitle" style="padding:8px 16px;">Sort by Title</button>
      <button id="sortByDefault" style="padding:8px 16px;">Default</button>
    `;
    moviesContainer.parentNode.insertBefore(controls, moviesContainer);
    document.getElementById('sortByRating').onclick = () => showFavorites('rating');
    document.getElementById('sortByTitle').onclick = () => showFavorites('title');
    document.getElementById('sortByDefault').onclick = () => showFavorites('default');
  }
}
// If on favorites page, render sort controls
if (window.location.pathname.endsWith('favorites.html')) {
  renderFavoritesSortControls();
  showFavorites();
}

// Search suggestions dropdown
let suggestionTimeout;
let suggestionsDropdown;
if (!document.getElementById('suggestionsDropdown')) {
  suggestionsDropdown = document.createElement('div');
  suggestionsDropdown.id = 'suggestionsDropdown';
  suggestionsDropdown.style.position = 'absolute';
  suggestionsDropdown.style.background = '#fff';
  suggestionsDropdown.style.color = '#333';
  suggestionsDropdown.style.border = '1px solid #ccc';
  suggestionsDropdown.style.zIndex = '1000';
  suggestionsDropdown.style.width = searchInput.offsetWidth + 'px';
  suggestionsDropdown.style.maxHeight = '220px';
  suggestionsDropdown.style.overflowY = 'auto';
  suggestionsDropdown.style.display = 'none';
  suggestionsDropdown.style.boxShadow = '0 2px 8px #0002';
  suggestionsDropdown.style.fontSize = '0.75em';
  suggestionsDropdown.style.left = searchInput.getBoundingClientRect().left + 'px';
  document.body.appendChild(suggestionsDropdown);
}
searchInput.addEventListener('input', function() {
  clearTimeout(suggestionTimeout);
  const query = this.value.trim();
  if (!query) {
    suggestionsDropdown.style.display = 'none';
    return;
  }
  suggestionTimeout = setTimeout(async () => {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    const results = data.results.slice(0, 8);
    if (results.length === 0) {
      suggestionsDropdown.style.display = 'none';
      return;
    }
    suggestionsDropdown.innerHTML = results.map(movie =>
      `<div class="suggestion-item" style="padding:8px;cursor:pointer;border-bottom:1px solid #eee;" data-title="${movie.title}">${movie.title}</div>`
    ).join('');
    // Position dropdown below input
    const rect = searchInput.getBoundingClientRect();
    suggestionsDropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    suggestionsDropdown.style.left = (rect.left + window.scrollX) + 'px';
    suggestionsDropdown.style.width = rect.width + 'px';
    suggestionsDropdown.style.display = 'block';
    // Add click listeners
    Array.from(suggestionsDropdown.children).forEach(item => {
      item.onclick = function() {
        searchInput.value = this.getAttribute('data-title');
        suggestionsDropdown.style.display = 'none';
        searchMovies(this.getAttribute('data-title'));
      };
    });
  }, 350);
});
// Hide suggestions on blur
searchInput.addEventListener('blur', function() {
  setTimeout(() => { suggestionsDropdown.style.display = 'none'; }, 200);
});

// Fetch and show ALL trailers under the movie
async function getTrailers(movieId, btn) {
  const trailersContainer = btn.nextElementSibling; // the <div class="trailers">
  
  // Toggle trailers if already visible
  if (trailersContainer.innerHTML !== "") {
    trailersContainer.innerHTML = "";
    btn.textContent = "Show Trailers";
    return;
  }

  const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`);
  const data = await res.json();

  const trailers = data.results.filter(video => video.type === "Trailer" && video.site === "YouTube");

  if (trailers.length > 0) {
    trailersContainer.innerHTML = trailers.map(trailer => `
      <iframe width="100%" height="200" 
        src="https://www.youtube.com/embed/${trailer.key}" 
        frameborder="0" allowfullscreen>
      </iframe>
    `).join("");
    btn.textContent = "Hide Trailers";
  } else {
    trailersContainer.innerHTML = "<p>No trailers available for this movie.</p>";
  }
}

// Handle Enter key for search
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) {
      searchMovies(query);
    }
  }
});

// Modal HTML structure
const modal = document.createElement("div");
modal.id = "trailerModal";
modal.style.display = "none";
modal.innerHTML = `
  <div class="modal-content">
    <span class="close-btn">&times;</span>
    <div class="trailer-carousel"></div>
    <div class="carousel-controls"></div>
  </div>
`;
document.body.appendChild(modal);

// Modal styles
const modalStyle = document.createElement("style");
modalStyle.textContent = `
  #trailerModal {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  #trailerModal .modal-content {
    background: #fff;
    border-radius: 10px;
    padding: 30px 20px 20px 20px;
    position: relative;
    min-width: 350px;
    max-width: 500px;
    box-shadow: 0 2px 20px rgba(0,0,0,0.2);
    text-align: center;
  }
  #trailerModal .close-btn {
    position: absolute;
    top: 10px; right: 15px;
    font-size: 2em;
    cursor: pointer;
    color: #333;
  }
  #trailerModal .trailer-carousel iframe {
    width: 100%;
    height: 280px;
    border-radius: 8px;
    margin-bottom: 10px;
  }
  #trailerModal .carousel-controls {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
  }
  #trailerModal .carousel-controls button {
    background: #007bff;
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 32px; height: 32px;
    font-size: 1em;
    cursor: pointer;
    transition: background 0.2s;
  }
  #trailerModal .carousel-controls button.active {
    background: #0056b3;
    font-weight: bold;
  }
`;
document.head.appendChild(modalStyle);

// Blur background when modal is open
function setBlur(active) {
  document.body.style.filter = active ? "blur(4px)" : "";
}

// Show trailers in modal with carousel
async function getTrailers(movieId, btn) {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`);
  const data = await res.json();
  const trailers = data.results.filter(video => video.type === "Trailer" && video.site === "YouTube");

  if (trailers.length === 0) {
    showModalContent("<p>No trailers available for this movie.</p>", []);
    return;
  }

  let current = 0;
  function renderCarousel(idx) {
    const trailer = trailers[idx];
    modal.querySelector(".trailer-carousel").innerHTML = `
      <div>
        <iframe src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>
        <div style="margin-top:8px;font-weight:bold;">Trailer ${idx + 1} of ${trailers.length}</div>
      </div>
    `;
    // Numbered buttons
    const controls = trailers.map((_, i) =>
      `<button class="${i === idx ? "active" : ""}" data-idx="${i}">${i + 1}</button>`
    ).join("");
    modal.querySelector(".carousel-controls").innerHTML = controls;
    // Add click listeners
    modal.querySelectorAll(".carousel-controls button").forEach(btn =>
      btn.onclick = () => renderCarousel(Number(btn.dataset.idx))
    );
  }

  showModalContent("", trailers);
  renderCarousel(current);
}

// Show modal and blur background
function showModalContent(html, trailers) {
  modal.style.display = "flex";
  setBlur(true);
  if (html) {
    modal.querySelector(".trailer-carousel").innerHTML = html;
    modal.querySelector(".carousel-controls").innerHTML = "";
  }
}

// Close modal
modal.querySelector(".close-btn").onclick = () => {
  modal.style.display = "none";
  setBlur(false);
};

// Prevent blur on modal itself
modal.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    setBlur(false);
  }
};

// Remove old trailers from movie cards (optional, not needed anymore)
document.querySelectorAll(".trailers").forEach(el => el.innerHTML = "");

function setBlur(active) {
    // Blur everything except the modal
    document.body.style.filter = "";
    Array.from(document.body.children).forEach(child => {
        if (child !== modal) {
            child.style.filter = active ? "blur(4px)" : "";
        }
    });
}
