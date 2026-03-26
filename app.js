const audio = document.getElementById('audio');
const songs = window.SONGS;
const genreColors = window.GENRE_COLORS;

let currentId = null;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 0; // 0=off 1=all 2=one
let activeGenre = null;
let searchQuery = '';
let favorites = JSON.parse(localStorage.getItem('melo-favs') || '[]');

const $ = id => document.getElementById(id);
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function getList() {
  return songs.filter(s => {
    const matchGenre = !activeGenre || s.genre === activeGenre;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q);
    return matchGenre && matchSearch;
  });
}

function playSong(song) {
  if (!song) return;
  currentId = song.id;
  audio.src = song.audio;
  audio.play().catch(() => {});
  isPlaying = true;

  $('np-art').src = song.cover;
  $('np-title').textContent = song.title;
  $('np-artist').textContent = song.artist;
  $('np-bg').style.backgroundImage = `url(${song.cover})`;

  $('player-art').src = song.cover;
  $('player-title').textContent = song.title;
  $('player-artist').textContent = song.artist;

  setPlayIcon(true);
  updateHeartBtn();
  renderSongList();
  renderFavList();
}

function setPlayIcon(playing) {
  $('play-icon').innerHTML = playing
    ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
    : '<polygon points="5 3 19 12 5 21 5 3"/>';
}

function updateHeartBtn() {
  const active = favorites.includes(currentId);
  const btn = $('heart-btn');
  btn.classList.toggle('active', active);
  btn.querySelector('svg').setAttribute('fill', active ? '#f43f5e' : 'none');
}

function toggleFav(id) {
  const idx = favorites.indexOf(id);
  if (idx === -1) favorites.push(id);
  else favorites.splice(idx, 1);
  localStorage.setItem('melo-favs', JSON.stringify(favorites));
  renderSongList();
  renderFavList();
  if (id === currentId) updateHeartBtn();
}

// ── Render song list ──────────────────────────────
function renderSongList() {
  const list = getList();
  $('song-list').innerHTML = list.map((s, i) => {
    const playing = s.id === currentId;
    const fav = favorites.includes(s.id);
    const num = playing && isPlaying
      ? `<span class="eq-bars"><span></span><span></span><span></span></span>`
      : `<span class="song-num">${i + 1}</span>`;
    return `
      <div class="song-item${playing ? ' playing' : ''}" data-id="${s.id}">
        ${num}
        <img class="song-art" src="${s.cover}" loading="lazy">
        <div class="song-meta">
          <div class="song-title">${s.title}</div>
          <div class="song-artist">${s.artist}</div>
        </div>
        <span class="song-dur">${s.duration}</span>
        <button class="heart-btn${fav ? ' active' : ''}" data-fav="${s.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${fav ? '#f43f5e' : 'none'}" stroke="${fav ? '#f43f5e' : 'currentColor'}" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>`;
  }).join('');
}

$('song-list').addEventListener('click', e => {
  const favBtn = e.target.closest('[data-fav]');
  if (favBtn) { toggleFav(favBtn.dataset.fav); return; }
  const item = e.target.closest('[data-id]');
  if (item) playSong(songs.find(s => s.id === item.dataset.id));
});

// ── Render favorites panel ──────────────────────────────
function renderFavList() {
  const favSongs = songs.filter(s => favorites.includes(s.id));
  $('fav-list').innerHTML = favSongs.length
    ? favSongs.map(s => `
        <div class="fav-song" data-id="${s.id}">
          <img class="fav-art" src="${s.cover}">
          <div style="min-width:0">
            <div class="fav-title">${s.title}</div>
            <div class="fav-artist">${s.artist}</div>
          </div>
        </div>`).join('')
    : '<div class="empty-msg">No favorites yet</div>';
}

$('fav-list').addEventListener('click', e => {
  const item = e.target.closest('[data-id]');
  if (item) playSong(songs.find(s => s.id === item.dataset.id));
});

// ── Genre list ──────────────────────────────
function renderGenres() {
  const genres = [...new Set(songs.map(s => s.genre))];
  $('genre-list').innerHTML = genres.map(g => `
    <div class="genre-item${activeGenre === g ? ' active' : ''}" data-genre="${g}">
      <span class="genre-dot" style="background:${genreColors[g] || '#888'}"></span>${g}
    </div>`).join('');
}

$('genre-list').addEventListener('click', e => {
  const item = e.target.closest('[data-genre]');
  if (!item) return;
  activeGenre = activeGenre === item.dataset.genre ? null : item.dataset.genre;
  $('section-label').textContent = activeGenre ? `${activeGenre} Songs` : 'All Songs';
  renderGenres();
  renderSongList();
});

// ── Genre bars (right panel) ──────────────────────────────
function renderGenreBars() {
  const counts = {};
  songs.forEach(s => { counts[s.genre] = (counts[s.genre] || 0) + 1; });
  const max = Math.max(...Object.values(counts));
  $('genre-bars').innerHTML = Object.entries(counts).map(([g, c]) => `
    <div class="genre-bar-item">
      <div class="genre-bar-label"><span>${g}</span><span>${c}</span></div>
      <div class="genre-bar-track">
        <div class="genre-bar-fill" style="width:${(c / max) * 100}%;background:${genreColors[g] || '#888'}"></div>
      </div>
    </div>`).join('');
}

// ── Playback controls ──────────────────────────────
$('play-btn').addEventListener('click', () => {
  if (!currentId) { playSong(getList()[0]); return; }
  if (isPlaying) { audio.pause(); isPlaying = false; setPlayIcon(false); }
  else { audio.play(); isPlaying = true; setPlayIcon(true); }
  renderSongList();
});

function playNext() {
  const list = getList();
  if (!list.length) return;
  if (isShuffle) return playSong(list[Math.floor(Math.random() * list.length)]);
  const idx = list.findIndex(s => s.id === currentId);
  playSong(list[(idx + 1) % list.length]);
}

function playPrev() {
  const list = getList();
  if (!list.length) return;
  const idx = list.findIndex(s => s.id === currentId);
  playSong(list[(idx - 1 + list.length) % list.length]);
}

$('next-btn').addEventListener('click', playNext);
$('prev-btn').addEventListener('click', playPrev);

$('shuffle-btn').addEventListener('click', () => {
  isShuffle = !isShuffle;
  $('shuffle-btn').classList.toggle('on', isShuffle);
});

$('repeat-btn').addEventListener('click', () => {
  repeatMode = (repeatMode + 1) % 3;
  $('repeat-btn').classList.toggle('on', repeatMode > 0);
  $('repeat-btn').title = ['Repeat off', 'Repeat all', 'Repeat one'][repeatMode];
});

audio.addEventListener('ended', () => {
  if (repeatMode === 2) { audio.play(); return; }
  if (repeatMode === 0 && !isShuffle) {
    const list = getList();
    const idx = list.findIndex(s => s.id === currentId);
    if (idx === list.length - 1) { isPlaying = false; setPlayIcon(false); renderSongList(); return; }
  }
  playNext();
});

// ── Progress ──────────────────────────────
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  $('progress-fill').style.width = (audio.currentTime / audio.duration * 100) + '%';
  $('current-time').textContent = fmt(audio.currentTime);
  $('total-time').textContent = fmt(audio.duration);
});

$('progress-bar').addEventListener('click', e => {
  if (!audio.duration) return;
  const r = e.currentTarget.getBoundingClientRect();
  audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
});

// ── Volume ──────────────────────────────
function setVol(v) {
  audio.volume = v / 100;
  $('volume').value = v;
  $('mini-vol').value = v;
  $('vol-display').textContent = v + '%';
}

$('volume').addEventListener('input', e => setVol(+e.target.value));
$('mini-vol').addEventListener('input', e => setVol(+e.target.value));
setVol(70);

// ── Heart btn in player bar ──────────────────────────────
$('heart-btn').addEventListener('click', () => { if (currentId) toggleFav(currentId); });

// ── Search ──────────────────────────────
$('search').addEventListener('input', e => {
  searchQuery = e.target.value;
  $('section-label').textContent = searchQuery ? `Results for "${searchQuery}"` : (activeGenre ? `${activeGenre} Songs` : 'All Songs');
  renderSongList();
});

// ── Nav view toggle ──────────────────────────────
document.querySelector('.nav').addEventListener('click', e => {
  const btn = e.target.closest('[data-view]');
  if (!btn) return;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const view = btn.dataset.view;
  if (view === 'favorites') {
    activeGenre = null;
    searchQuery = '';
    $('search').value = '';
    $('section-label').textContent = 'Favorites';
    const favIds = favorites;
    $('song-list').innerHTML = songs.filter(s => favIds.includes(s.id)).map((s, i) => {
      const fav = true;
      return `
        <div class="song-item${s.id === currentId ? ' playing' : ''}" data-id="${s.id}">
          <span class="song-num">${i + 1}</span>
          <img class="song-art" src="${s.cover}" loading="lazy">
          <div class="song-meta">
            <div class="song-title">${s.title}</div>
            <div class="song-artist">${s.artist}</div>
          </div>
          <span class="song-dur">${s.duration}</span>
          <button class="heart-btn active" data-fav="${s.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#f43f5e" stroke="#f43f5e" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>`;
    }).join('') || '<div class="empty-msg" style="padding:12px 0">No favorites yet</div>';
  } else if (view === 'search') {
    $('search').focus();
  } else {
    activeGenre = null;
    searchQuery = '';
    $('search').value = '';
    $('section-label').textContent = 'All Songs';
    renderGenres();
    renderSongList();
  }
  $('view-title').textContent = { home: 'Good evening', search: 'Search', favorites: 'Your Favorites' }[view];
});

// ── Init ──────────────────────────────
renderGenres();
renderSongList();
renderFavList();
renderGenreBars();
