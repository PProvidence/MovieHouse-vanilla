// favorites.js
// Loads favorites from localStorage and displays them
const favoritesContainer = document.getElementById('favorites-container');
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  } catch {
    return [];
  }
}
function getRating(movieId) {
  const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
  return ratings[movieId] || 0;
}
function removeFavorite(movieId) {
  let favs = getFavorites();
  favs = favs.filter(f => f.id !== movieId);
  localStorage.setItem('favorites', JSON.stringify(favs));
  renderFavorites();
}
function renderFavorites() {
  const favs = getFavorites();
  if (favs.length === 0) {
    favoritesContainer.innerHTML = '<p style="color:#ff6347;text-align:center;">No favorites yet.</p>';
    return;
  }
  favoritesContainer.innerHTML = '';
  favs.forEach(movie => {
    const userRating = getRating(movie.id);
    let starsHtml = '<div class="stars" data-movieid="' + movie.id + '">';
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<span class="star${i <= userRating ? ' filled' : ''}" data-star="${i}">&#9733;</span>`;
    }
    starsHtml += '</div>';
    const movieEl = document.createElement('div');
    movieEl.classList.add('movie');
    movieEl.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <button class="remove-fav-btn" data-movieid="${movie.id}">★ Remove Favorite</button>
      ${starsHtml}
      <button class="details-btn" data-movieid="${movie.id}">Details</button>
    `;
    favoritesContainer.appendChild(movieEl);
  });
  document.querySelectorAll('.remove-fav-btn').forEach(btn => {
    btn.onclick = function() {
      const movieId = Number(this.getAttribute('data-movieid'));
      removeFavorite(movieId);
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
// Add sort controls for favorites
function renderFavoritesSortControls() {
  const controls = document.getElementById('favoritesSortControls');
  if (controls) {
    controls.style.display = 'flex';
    controls.style.gap = '12px';
    controls.style.margin = '18px 0 0 0';
    controls.innerHTML = `
      <button id="sortByRating" style="padding:8px 16px;">Sort by Rating</button>
      <button id="sortByTitle" style="padding:8px 16px;">Sort by Title</button>
      <button id="sortByDefault" style="padding:8px 16px;">Default</button>
    `;
    document.getElementById('sortByRating').onclick = () => showFavorites('rating');
    document.getElementById('sortByTitle').onclick = () => showFavorites('title');
    document.getElementById('sortByDefault').onclick = () => showFavorites('default');
  }
}
// Navbar navigation for favorites page
if (document.getElementById('homeBtn')) {
  document.getElementById('homeBtn').onclick = () => window.location.href = 'index.html';
}
if (document.getElementById('seeAllBtn')) {
  document.getElementById('seeAllBtn').onclick = () => window.location.href = 'allmovies.html';
}
if (document.getElementById('favoritesBtn')) {
  document.getElementById('favoritesBtn').onclick = () => window.location.href = 'favorites.html';
}
// Render sort controls and favorites on load
renderFavoritesSortControls();
renderFavorites();
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
  // apiKey is loaded from apiKey.js
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
    <p><strong>Description:</strong> ${data.genres ? data.genres.map(g => g.name).join(', ') : 'N/A'}</p>
    <p><strong>Actors:</strong> ${actors || 'N/A'}</p>
    <p><strong>TMDb Rating:</strong> ${data.vote_average || 'N/A'}</p>
    <p><strong>Release Date:</strong> ${data.release_date || 'N/A'}</p>
  `;
  detailsModal.style.display = 'flex';
}
