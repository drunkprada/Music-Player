const audio = document.getElementById('audio');
const songs = window.SONGS;
const $ = id => document.getElementById(id);
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

let currentId = null, isPlaying = false, isShuffle = false, repeatMode = 0;
let activeGenre = null, searchQuery = '';
let favorites = JSON.parse(localStorage.getItem('melo-favs') || '[]');

const GENRES = {
  'Electronic': { emoji: '\u26A1', bg: 'linear-gradient(135deg, #60a5fa, #818cf8)' },
  'Pop':        { emoji: '\uD83C\uDFA4', bg: 'linear-gradient(135deg, #f472b6, #fb7185)' },
  'Rock':       { emoji: '\uD83C\uDFB8', bg: 'linear-gradient(135deg, #FF6B35, #fbbf24)' },
  'Jazz':       { emoji: '\uD83C\uDFB7', bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
  'Hip-Hop':    { emoji: '\uD83C\uDFA7', bg: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
};

// ── Landing transition ─────────────────────────
$('start-btn').addEventListener('click', () => {
  const landing = $('landing');
  landing.classList.add('exit');
  setTimeout(() => {
    landing.classList.add('hidden');
    $('app').classList.remove('hidden');
    sessionStorage.setItem('melo-entered', '1');
  }, 600);
});

if (sessionStorage.getItem('melo-entered')) {
  $('landing').classList.add('hidden');
  $('app').classList.remove('hidden');
}

// ── Greeting ─────────────────────────
const hour = new Date().getHours();
const greetings = [
  [5, 'Good morning \u2600\uFE0F'],
  [12, 'Good afternoon \uD83C\uDF24\uFE0F'],
  [18, 'Good evening \u2728'],
  [24, 'Late night vibes \uD83C\uDF19'],
];
$('greeting').textContent = greetings.find(([h]) => hour < h)?.[1] || 'Hey there';

// ── Genre cards ─────────────────────────
function renderGenres() {
  const unique = [...new Set(songs.map(s => s.genre))];
  $('genre-scroll').innerHTML = unique.map(g => {
    const { emoji, bg } = GENRES[g] || { emoji: '\uD83C\uDFB5', bg: 'linear-gradient(135deg,#888,#aaa)' };
    return `<div class="genre-card${activeGenre === g ? ' active' : ''}" style="background:${bg}" data-genre="${g}">
      <span class="genre-emoji" style="animation-delay:${Math.random() * 2}s">${emoji}</span>
      <span class="genre-name">${g}</span>
    </div>`;
  }).join('');
}

$('genre-scroll').addEventListener('click', e => {
  const card = e.target.closest('[data-genre]');
  if (!card) return;
  activeGenre = activeGenre === card.dataset.genre ? null : card.dataset.genre;
  $('sec-title').textContent = activeGenre || 'All Songs';
  renderGenres();
  renderSongs();
});

// ── Song list ─────────────────────────
function getList() {
  return songs.filter(s => {
    if (activeGenre && s.genre !== activeGenre) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q);
  });
}

function renderSongs() {
  const list = getList();
  $('song-count').textContent = `${list.length} songs`;
  $('song-list').innerHTML = list.length ? list.map((s, i) => {
    const playing = s.id === currentId;
    const fav = favorites.includes(s.id);
    const num = playing && isPlaying
      ? '<span class="eq-bars"><span></span><span></span><span></span></span>'
      : `<span class="song-num">${i + 1}</span>`;
    const gc = GENRES[s.genre]?.bg.match(/#\w+/)?.[0] || '#888';
    return `<div class="song-item${playing ? ' playing' : ''}" data-id="${s.id}" style="animation-delay:${i * 0.04}s">
      ${num}
      <img class="song-art" src="${s.cover}" loading="lazy">
      <div class="song-meta">
        <div class="song-title">${s.title}</div>
        <div class="song-artist">${s.artist}</div>
      </div>
      <span class="song-genre" style="background:${gc}">${s.genre}</span>
      <span class="song-dur">${s.duration}</span>
      <button class="heart-btn${fav ? ' active' : ''}" data-fav="${s.id}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="${fav ? 'var(--pink)' : 'none'}" stroke="${fav ? 'var(--pink)' : 'currentColor'}" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>`;
  }).join('') : '<div class="empty-msg">No songs found</div>';
}

$('song-list').addEventListener('click', e => {
  const favBtn = e.target.closest('[data-fav]');
  if (favBtn) { toggleFav(favBtn.dataset.fav); return; }
  const item = e.target.closest('[data-id]');
  if (item) playSong(songs.find(s => s.id === item.dataset.id));
});

// ── Favorites ─────────────────────────
function toggleFav(id) {
  const i = favorites.indexOf(id);
  if (i === -1) favorites.push(id); else favorites.splice(i, 1);
  localStorage.setItem('melo-favs', JSON.stringify(favorites));
  renderSongs();
  if (id === currentId) syncHeart();
}

function syncHeart() {
  const on = favorites.includes(currentId);
  const btn = $('heart-btn');
  btn.classList.toggle('active', on);
  btn.querySelector('svg').setAttribute('fill', on ? 'var(--pink)' : 'none');
  btn.querySelector('svg').setAttribute('stroke', on ? 'var(--pink)' : 'currentColor');
}

$('heart-btn').addEventListener('click', () => { if (currentId) toggleFav(currentId); });

// ── Playback ─────────────────────────
function playSong(song) {
  if (!song) return;
  currentId = song.id;
  audio.src = song.audio;
  audio.play().catch(() => {});
  isPlaying = true;

  // Bar
  $('bar-art').src = song.cover;
  $('bar-title').textContent = song.title;
  $('bar-artist').textContent = song.artist;

  // Full
  $('full-art').src = song.cover;
  $('full-title').textContent = song.title;
  $('full-artist').textContent = song.artist;

  setIcons(true);
  syncHeart();
  renderSongs();
  $('waveform').classList.add('playing');
}

function setIcons(playing) {
  const pause = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  const play = '<polygon points="5 3 19 12 5 21"/>';
  $('play-icon').innerHTML = playing ? pause : play;
  $('f-play-icon').innerHTML = playing ? pause : play;
}

function togglePlay() {
  if (!currentId) { playSong(getList()[0]); return; }
  if (isPlaying) { audio.pause(); isPlaying = false; $('waveform').classList.remove('playing'); }
  else { audio.play(); isPlaying = true; $('waveform').classList.add('playing'); }
  setIcons(isPlaying);
  renderSongs();
}

function playNext() {
  const list = getList();
  if (!list.length) return;
  if (isShuffle) return playSong(list[Math.floor(Math.random() * list.length)]);
  const idx = list.findIndex(s => s.id === currentId);
  playSong(list[(idx + 1) % list.length]);
}

function playPrev() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  const list = getList();
  if (!list.length) return;
  const idx = list.findIndex(s => s.id === currentId);
  playSong(list[(idx - 1 + list.length) % list.length]);
}

// Bar controls
$('play-btn').addEventListener('click', togglePlay);
$('next-btn').addEventListener('click', playNext);
$('prev-btn').addEventListener('click', playPrev);

// Full controls
$('f-play').addEventListener('click', togglePlay);
$('f-next').addEventListener('click', playNext);
$('f-prev').addEventListener('click', playPrev);

// Shuffle
function toggleShuffle() {
  isShuffle = !isShuffle;
  $('shuffle-btn').classList.toggle('on', isShuffle);
  $('f-shuffle').classList.toggle('on', isShuffle);
}
$('shuffle-btn').addEventListener('click', toggleShuffle);
$('f-shuffle').addEventListener('click', toggleShuffle);

// Repeat
function toggleRepeat() {
  repeatMode = (repeatMode + 1) % 3;
  $('repeat-btn').classList.toggle('on', repeatMode > 0);
  $('f-repeat').classList.toggle('on', repeatMode > 0);
  $('repeat-btn').title = $('f-repeat').title = ['Off', 'All', 'One'][repeatMode];
}
$('repeat-btn').addEventListener('click', toggleRepeat);
$('f-repeat').addEventListener('click', toggleRepeat);

audio.addEventListener('ended', () => {
  if (repeatMode === 2) { audio.currentTime = 0; audio.play(); return; }
  const list = getList();
  const idx = list.findIndex(s => s.id === currentId);
  if (repeatMode === 0 && !isShuffle && idx === list.length - 1) {
    isPlaying = false; setIcons(false); $('waveform').classList.remove('playing'); renderSongs(); return;
  }
  playNext();
});

// ── Progress ─────────────────────────
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration * 100) + '%';
  $('bar-progress').style.width = pct;
  $('full-fill').style.width = pct;
  $('f-cur').textContent = fmt(audio.currentTime);
  $('f-tot').textContent = fmt(audio.duration);
});

$('full-bar').addEventListener('click', e => {
  if (!audio.duration) return;
  const r = e.currentTarget.getBoundingClientRect();
  audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
});

// ── Volume ─────────────────────────
$('volume').addEventListener('input', e => { audio.volume = e.target.value / 100; });
audio.volume = 0.7;

// ── Search ─────────────────────────
$('search').addEventListener('input', e => {
  searchQuery = e.target.value;
  $('sec-title').textContent = searchQuery ? `Results for "${searchQuery}"` : (activeGenre || 'All Songs');
  renderSongs();
});

// ── Full player toggle ─────────────────────────
$('bar-left').addEventListener('click', () => {
  if (!currentId) return;
  $('full').classList.remove('hidden');
  $('full').classList.add('show');
});

$('full-close').addEventListener('click', () => {
  $('full').classList.add('hidden');
  $('full').classList.remove('show');
});

// ── Waveform bars ─────────────────────────
(function initWaveform() {
  const wf = $('waveform');
  for (let i = 0; i < 24; i++) {
    const span = document.createElement('span');
    span.style.animationDelay = `${i * 0.06}s`;
    span.style.height = '6px';
    wf.appendChild(span);
  }
})();

// ── Init ─────────────────────────
renderGenres();
renderSongs();
