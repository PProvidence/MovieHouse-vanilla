// allmovies.js
// apiKey is loaded from apiKey.js
const imgBaseURL = "https://image.tmdb.org/t/p/w500";
// Navbar
const navbar = document.createElement('nav');
navbar.className = 'navbar';
navbar.innerHTML = `
  <h1><span class="logo" style="font-size:1.5em;font-weight:bold;color:#ffc107;margin-right:18px;">NetChill</span></h1>
  <div">
    <button id="homeBtn" class="nav-btn" aria-label="Home">Home</button>
    <button id="favoritesBtn" class="nav-btn" aria-label="Favorites">★ My Favorites</button>
    <button id="seeAllBtn" class="nav-btn" aria-label="See All Movies">See All Movies</button>
  </div>
`;
document.body.insertBefore(navbar, document.body.firstChild);
document.getElementById('favoritesBtn').addEventListener('click', () => {
  window.location.href = 'favorites.html';
});
// Genre filter UI
const genreFilterDiv = document.createElement('div');
genreFilterDiv.id = 'genre-filter';
genreFilterDiv.className = 'genre-filter';
document.body.insertBefore(genreFilterDiv, document.getElementById('allmovies-container'));

const allMoviesContainer = document.getElementById('allmovies-container');
function getRating(movieId) {
  const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
  return ratings[movieId] || 0;
}
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
function displayAllMovies(movies) {
  allMoviesContainer.innerHTML = '';
  const favorites = getFavorites();
  movies.forEach(movie => {
    const userRating = getRating(movie.id);
    let starsHtml = '<div class="stars" data-movieid="' + movie.id + '">';
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<span class="star${i <= userRating ? ' filled' : ''}" data-star="${i}" tabindex="0">&#9733;</span>`;
    }
    starsHtml += '</div>';
    const isFav = favorites.some(f => f.id === movie.id);
    const favBtnHtml = `<button class="fav-btn${isFav ? ' fav-highlight' : ''}" data-movieid="${movie.id}">${isFav ? '★ Remove Favorite' : '☆ Add to Favorites'}</button>`;
    // Genres
    let genreTags = '';
    if (movie.genre_ids && allGenres.length) {
      genreTags = '<div class="movie-genres">' + movie.genre_ids.map(id => {
        const g = allGenres.find(gg => gg.id === id);
        return g ? `<span class="genre-tag">${g.name}</span>` : '';
      }).join(' ') + '</div>';
    }
    allMoviesContainer.appendChild(document.createElement('div'));
    const movieEl = allMoviesContainer.lastChild;
    movieEl.classList.add('movie');
    movieEl.innerHTML = `
      <img src="${imgBaseURL + movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      ${genreTags}
      ${favBtnHtml}
      ${starsHtml}
      <button class="details-btn" data-movieid="${movie.id}">Details</button>
    `;
  });
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.onclick = function() {
      const movieId = Number(this.getAttribute('data-movieid'));
      const movie = movies.find(m => m.id === movieId);
      if (!movie) return;
      if (isFavorite(movieId)) {
        removeFavorite(movieId);
        this.textContent = '☆ Add to Favorites';
        this.classList.remove('fav-highlight');
      } else {
        addFavorite(movie);
        this.textContent = '★ Remove Favorite';
        this.classList.add('fav-highlight');
      }
    };
  });
  document.querySelectorAll('.stars').forEach(starsDiv => {
    starsDiv.querySelectorAll('.star').forEach(star => {
      star.onclick = function() {
        const movieId = Number(starsDiv.getAttribute('data-movieid'));
        const rating = Number(this.getAttribute('data-star'));
        let currentRating = getRating(movieId);
        if (currentRating === rating) {
          const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
          ratings[movieId] = 0;
          localStorage.setItem('ratings', JSON.stringify(ratings));
          starsDiv.querySelectorAll('.star').forEach(s => s.classList.remove('filled'));
        } else {
          const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
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
let allGenres = [];
let allMovies = [];
let filteredMovies = [];
async function getGenres() {
  const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
  const data = await res.json();
  allGenres = data.genres;
  renderGenreFilter();
}
function renderGenreFilter() {
  genreFilterDiv.innerHTML = '<span style="font-weight:bold;">Filter by Genre:</span> ' +
    allGenres.map(g => `<span class="genre-btn" data-genreid="${g.id}" tabindex="0">${g.name}</span>`).join(' ');
  document.querySelectorAll('.genre-btn').forEach(btn => {
    btn.onclick = function() {
      this.classList.toggle('active');
      filterMoviesByGenre();
    };
    btn.onkeydown = function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        this.classList.toggle('active');
        filterMoviesByGenre();
      }
    };
  });
}
function getSelectedGenres() {
  return Array.from(document.querySelectorAll('.genre-btn.active')).map(btn => Number(btn.getAttribute('data-genreid')));
}
function filterMoviesByGenre() {
  if (!allMovies.length) return;
  const selected = getSelectedGenres();
  if (selected.length === 0) {
    displayAllMovies(allMovies);
    return;
  }
  filteredMovies = allMovies.filter(m => m.genre_ids && m.genre_ids.some(id => selected.includes(id)));
  displayAllMovies(filteredMovies);
}
async function getAllMovies() {
  let movies = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${page}`);
    const data = await res.json();
    movies = movies.concat(data.results);
  }
  allMovies = movies;
  displayAllMovies(movies);
}
getGenres();
getAllMovies();
document.getElementById('homeBtn').onclick = () => {
  window.location.href = 'index.html';
};
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
  const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US&append_to_response=credits,videos`);
  const data = await res.json();
  // Get actors
  let actorsArr = [];
  if (data.credits && data.credits.cast) {
    actorsArr = data.credits.cast.map(a => a.name);
  }
  let actorsHtml = '';
  if (actorsArr.length > 0) {
    const first = actorsArr.slice(0, 5).join(', ');
    actorsHtml = `<span>${first}</span>`;
    if (actorsArr.length > 5) {
      actorsHtml += ` <a href="#" class="show-more-actors">Show more</a><span class="more-actors" style="display:none;">, ${actorsArr.slice(5).join(', ')}</span>`;
    }
  }
  // Trailers button
  let trailerBtn = '';
  if (data.videos && data.videos.results.some(v => v.type === 'Trailer' && v.site === 'YouTube')) {
    trailerBtn = `<button class="trailer-btn" data-movieid="${movieId}">Show Trailers</button>`;
  }
  // Genres
  let genresHtml = '';
  if (data.genres) {
    genresHtml = data.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join(' ');
  }
  // Image
  let imgHtml = '';
  if (data.poster_path) {
    imgHtml = `<img src="${imgBaseURL + data.poster_path}" alt="${data.title}" class="modal-img">`;
  }
  detailsModal.querySelector('.details-content').innerHTML = `
    <div class="modal-scrollable" style="max-height:70vh;overflow-y:auto;">
      <div class="modal-header">
        ${imgHtml}
        <div>
            <h2>${data.title}</h2>
            ${trailerBtn}
        </div>
      </div>
      <div class="modal-genres">${genresHtml}</div>
      <p><strong>Plot:</strong> ${data.overview || 'N/A'}</p>
      <p><strong>TMDb Rating:</strong> ${data.vote_average || 'N/A'}</p>
      <p><strong>Actors:</strong> ${actorsHtml || 'N/A'}</p>
      <p><strong>Release Date:</strong> ${data.release_date || 'N/A'}</p>
    </div>
  `;
  detailsModal.style.display = 'flex';
  // Show more actors
  const moreActors = detailsModal.querySelector('.show-more-actors');
  if (moreActors) {
    moreActors.onclick = function(e) {
      e.preventDefault();
      this.style.display = 'none';
      detailsModal.querySelector('.more-actors').style.display = 'inline';
    };
  }
  // Trailers button in modal
  const modalTrailerBtn = detailsModal.querySelector('.modal-trailer-btn');
  if (modalTrailerBtn) {
    modalTrailerBtn.onclick = function() {
      getTrailers(movieId);
    };
  }
  // Close modal on outside click
  detailsModal.onclick = function(e) {
    if (e.target === detailsModal) {
      detailsModal.style.display = 'none';
    }
  };
}
// Show trailers in modal
function getTrailers(movieId) {
  fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=en-US`)
    .then(res => res.json())
    .then(data => {
      const trailers = data.results.filter(v => v.type === 'Trailer' && v.site === 'YouTube');
      let trailerHtml = '';
      if (trailers.length) {
        trailerHtml = trailers.map(t => `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${t.key}" frameborder="0" allowfullscreen></iframe>`).join('');
      } else {
        trailerHtml = 'No trailers found.';
      }
      // Insert trailers below the Show Trailers button
      const scrollable = detailsModal.querySelector('.modal-scrollable');
      let trailersDiv = scrollable.querySelector('.trailers');
      if (!trailersDiv) {
        trailersDiv = document.createElement('div');
        trailersDiv.className = 'trailers';
        scrollable.appendChild(trailersDiv);
      }
      trailersDiv.innerHTML = trailerHtml;
    });
}
