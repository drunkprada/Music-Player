let currentSong = null;
let isPlaying = false;
let shuffleOn = false;
let repeatMode = 0;
let favs = new Set(JSON.parse(localStorage.getItem('favs') || '[]'));
let wfBarsBar = [];
let wfBarsNp = [];

const audio = document.getElementById('audio');

const GENRE_META = {
  'Electronic': { color: '#22D3EE', icon: '⚡' },
  'Pop':        { color: '#F472B6', icon: '✨' },
  'Rock':       { color: '#F87171', icon: '🎸' },
  'Jazz':       { color: '#FBBF24', icon: '🎷' },
  'Hip-Hop':    { color: '#A78BFA', icon: '🎤' },
  'R&B':        { color: '#60A5FA', icon: '🎵' },
};

const PLAY_ICO  = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
const PAUSE_ICO = '<polygon points="5 3 19 12 5 21"/>';

function fmt(s) {
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Waveform — seeded random heights so they look consistent
let wseed = 91;
const wr = () => { wseed = (wseed * 1664525 + 1013904223) >>> 0; return wseed / 0xFFFFFFFF; };
const WAVE_H = Array.from({ length: 80 }, () => 12 + wr() * 76);

function buildWaveform() {
  const barEl = document.getElementById('bp-rail');
  const npEl  = document.getElementById('np-wf');
  barEl.innerHTML = WAVE_H.map(h => `<span class="wfb" style="height:${h}%"></span>`).join('');
  npEl.innerHTML  = WAVE_H.map(h => `<span class="npwb" style="height:${h}%"></span>`).join('');
  wfBarsBar = Array.from(barEl.children);
  wfBarsNp  = Array.from(npEl.children);
}

function updateWavePct(pct) {
  const idx = Math.floor(pct * wfBarsBar.length);
  wfBarsBar.forEach((b, i) => b.classList.toggle('lit', i < idx));
  wfBarsNp.forEach((b, i)  => b.classList.toggle('lit', i < idx));
}

// ── Render functions ─────────────────────────────────────────────────────────

function renderLibrary() {
  document.getElementById('library').innerHTML = SONGS.map(s => `
    <div class="lib-item${currentSong?.id === s.id ? ' playing' : ''}" data-id="${s.id}">
      ${currentSong?.id === s.id
        ? `<div class="lib-eq"><span></span><span></span><span></span></div>`
        : `<img class="lib-art" src="${s.cover}" alt="">`}
      <div style="overflow:hidden">
        <span class="lib-name${currentSong?.id === s.id ? ' on' : ''}">${s.title}</span>
        <span class="lib-artist">${s.artist}</span>
      </div>
      <span class="lib-dur">${s.duration}</span>
    </div>
  `).join('');
  document.querySelectorAll('.lib-item').forEach(el =>
    el.addEventListener('click', () => playSong(SONGS.find(s => s.id === el.dataset.id)))
  );
}

function renderHome() {
  document.getElementById('greeting').textContent = greeting();
  document.getElementById('qa-grid').innerHTML = SONGS.slice(0, 6).map(s => `
    <div class="qa-card pa" data-id="${s.id}">
      <img class="qa-img" src="${s.cover}" alt="">
      <span class="qa-name">${s.title}</span>
    </div>
  `).join('');
  document.getElementById('mfy-row').innerHTML = SONGS.map(s => `
    <div class="mfy-card" data-id="${s.id}">
      <img class="mfy-art" src="${s.cover}" alt="">
      <span class="mfy-name">${s.title}</span>
      <span class="mfy-desc">${s.artist}</span>
    </div>
  `).join('');
  document.querySelectorAll('.qa-card, .mfy-card').forEach(el =>
    el.addEventListener('click', () => playSong(SONGS.find(s => s.id === el.dataset.id)))
  );
}

function renderSongList() {
  document.getElementById('song-list').innerHTML = SONGS.map((s, i) => `
    <div class="sr pa${currentSong?.id === s.id ? ' playing' : ''}" data-id="${s.id}" style="--d:${i * 0.04}s">
      <div style="display:flex;align-items:center;justify-content:center">
        <span class="sr-num">${i + 1}</span>
        <span class="sr-play">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
        </span>
      </div>
      <div class="sr-tc">
        <img class="sr-art" src="${s.cover}" alt="">
        <div style="overflow:hidden">
          <span class="sr-name">${s.title}</span>
          <span class="sr-sub">${s.artist}</span>
        </div>
      </div>
      <span class="sr-genre" style="color:${GENRE_COLORS[s.genre] || 'var(--mu)'}">${s.genre}</span>
      <div class="sr-acts">
        <button class="sr-heart${favs.has(s.id) ? ' fav' : ''}" data-id="${s.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${favs.has(s.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <span class="sr-dur">${s.duration}</span>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.sr').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.closest('.sr-heart')) return;
      playSong(SONGS.find(s => s.id === el.dataset.id));
    });
  });
  document.querySelectorAll('.sr-heart').forEach(btn =>
    btn.addEventListener('click', e => { e.stopPropagation(); toggleFav(btn.dataset.id); })
  );
}

function renderArtists() {
  const artists = [
    { name: 'Luna Echo',    genre: 'Electronic', seed: 'portrait-luna'  },
    { name: 'The Coastals', genre: 'Pop',        seed: 'portrait-coast' },
    { name: 'Voidwave',     genre: 'Rock',       seed: 'portrait-void'  },
    { name: 'Sol Raye',     genre: 'Jazz',       seed: 'portrait-sol'   },
    { name: 'Synthex',      genre: 'Electronic', seed: 'portrait-synth' },
    { name: 'Urban Groove', genre: 'Hip-Hop',    seed: 'portrait-urban' },
  ];
  document.getElementById('artists-row').innerHTML = artists.map(a => `
    <div class="ac">
      <img class="aph" src="https://picsum.photos/seed/${a.seed}/180/180" alt="">
      <span class="an">${a.name}</span>
      <span class="ag">${a.genre}</span>
      <button class="fbtn">Follow</button>
    </div>
  `).join('');
}

function renderGenres() {
  const genres = [
    { name: 'Electronic', cnt: '3 songs', c1: '#3730a3', c2: '#1e1b4b' },
    { name: 'Pop',        cnt: '3 songs', c1: '#be185d', c2: '#500724' },
    { name: 'Rock',       cnt: '3 songs', c1: '#dc2626', c2: '#450a0a' },
    { name: 'Jazz',       cnt: '2 songs', c1: '#d97706', c2: '#451a03' },
    { name: 'Hip-Hop',    cnt: '2 songs', c1: '#7c3aed', c2: '#2e1065' },
    { name: 'R&B',        cnt: '4 songs', c1: '#0e7490', c2: '#082f49' },
  ];
  document.getElementById('genres-grid').innerHTML = genres.map(g => `
    <div class="gc" style="--c1:${g.c1};--c2:${g.c2}">
      <span class="gc-icon">${GENRE_META[g.name]?.icon ?? ''}</span>
      <div>
        <div class="gn">${g.name}</div>
        <div class="gct">${g.cnt}</div>
      </div>
    </div>
  `).join('');
}

// ── Playback ──────────────────────────────────────────────────────────────────

function setVinylSpin(on) {
  document.getElementById('bar-art').classList.toggle('spinning', on);
  document.getElementById('np-art').classList.toggle('spinning', on);
}

function updateBarHeart() {
  const svg = document.getElementById('heart-icon');
  const on  = currentSong && favs.has(currentSong.id);
  svg.setAttribute('fill',   on ? 'var(--acc)' : 'none');
  svg.setAttribute('stroke', on ? 'var(--acc)' : 'currentColor');
}

function playSong(song) {
  if (!song) return;
  currentSong = song;
  isPlaying = true;
  audio.src = song.audio;
  audio.play();
  document.getElementById('bar-art').src = song.cover;
  document.getElementById('bar-title').textContent  = song.title;
  document.getElementById('bar-artist').textContent = song.artist;
  document.getElementById('bar-play-icon').innerHTML = PLAY_ICO;
  document.getElementById('np-pico').innerHTML       = PLAY_ICO;
  setVinylSpin(true);
  updateBarHeart();
  if (document.getElementById('np').classList.contains('open')) openOverlay();
  renderLibrary();
  renderSongList();
}

function togglePlay() {
  if (!currentSong) return;
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    document.getElementById('bar-play-icon').innerHTML = PAUSE_ICO;
    document.getElementById('np-pico').innerHTML       = PAUSE_ICO;
    setVinylSpin(false);
  } else {
    audio.play();
    isPlaying = true;
    document.getElementById('bar-play-icon').innerHTML = PLAY_ICO;
    document.getElementById('np-pico').innerHTML       = PLAY_ICO;
    setVinylSpin(true);
  }
}

function playNext() {
  if (!currentSong) { playSong(SONGS[0]); return; }
  const idx = SONGS.findIndex(s => s.id === currentSong.id);
  if (shuffleOn) {
    let n;
    do { n = Math.floor(Math.random() * SONGS.length); } while (n === idx && SONGS.length > 1);
    playSong(SONGS[n]);
  } else {
    playSong(SONGS[(idx + 1) % SONGS.length]);
  }
}

function playPrev() {
  if (!currentSong) return;
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  const idx = SONGS.findIndex(s => s.id === currentSong.id);
  playSong(SONGS[(idx - 1 + SONGS.length) % SONGS.length]);
}

function toggleFav(id) {
  favs.has(id) ? favs.delete(id) : favs.add(id);
  localStorage.setItem('favs', JSON.stringify([...favs]));
  renderSongList();
  updateBarHeart();
}

// ── Now Playing overlay ───────────────────────────────────────────────────────

function openOverlay() {
  if (!currentSong) return;
  const s = currentSong;
  document.getElementById('np-bg').src  = s.cover;
  document.getElementById('np-art').src = s.cover;
  document.getElementById('np-ttl').textContent = s.title;
  document.getElementById('np-by').textContent  = s.artist;
  document.getElementById('np-tag').textContent = s.genre;
  document.getElementById('np-t2').textContent  = fmt(audio.duration || 0);
  document.getElementById('np-c2').textContent  = fmt(audio.currentTime || 0);
  setVinylSpin(isPlaying);
  document.getElementById('np-pico').innerHTML = isPlaying ? PLAY_ICO : PAUSE_ICO;
  document.getElementById('np').classList.add('open');
}

function closeOverlay() {
  document.getElementById('np').classList.remove('open');
}

// ── Audio events ──────────────────────────────────────────────────────────────

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = audio.currentTime / audio.duration;
  updateWavePct(pct);
  document.getElementById('bp-cur').textContent = fmt(audio.currentTime);
  document.getElementById('np-c2').textContent  = fmt(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  document.getElementById('bp-tot').textContent = fmt(audio.duration);
  document.getElementById('np-t2').textContent  = fmt(audio.duration);
});

audio.addEventListener('ended', () => {
  if (repeatMode === 2) { audio.currentTime = 0; audio.play(); }
  else playNext();
});

// ── Controls ──────────────────────────────────────────────────────────────────

document.getElementById('bp-rail').addEventListener('click', e => {
  if (!audio.duration) return;
  const r = e.currentTarget.getBoundingClientRect();
  audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
});

document.getElementById('np-wf').addEventListener('click', e => {
  if (!audio.duration) return;
  const r = e.currentTarget.getBoundingClientRect();
  audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
});

audio.volume = 0.7;
document.getElementById('bar-vol').addEventListener('input', e => { audio.volume = e.target.value / 100; });

document.getElementById('bar-play').addEventListener('click', togglePlay);
document.getElementById('bar-next').addEventListener('click', playNext);
document.getElementById('bar-prev').addEventListener('click', playPrev);
document.getElementById('bar-heart').addEventListener('click', () => { if (currentSong) toggleFav(currentSong.id); });

document.getElementById('bar-shuffle').addEventListener('click', function () {
  shuffleOn = !shuffleOn;
  this.classList.toggle('active', shuffleOn);
});

document.getElementById('bar-repeat').addEventListener('click', function () {
  repeatMode = (repeatMode + 1) % 3;
  this.classList.toggle('active', repeatMode > 0);
  const base = '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>';
  this.querySelector('svg').innerHTML = repeatMode === 2
    ? base + '<text x="12" y="14.5" fill="currentColor" font-size="7" font-weight="700" text-anchor="middle" font-family="inherit">1</text>'
    : base;
});

document.getElementById('vinyl-wrap').addEventListener('click', openOverlay);
document.getElementById('np-cls').addEventListener('click', closeOverlay);
document.getElementById('np').addEventListener('click', e => {
  if (e.target.id === 'np' || e.target.classList.contains('np-dim')) closeOverlay();
});
document.getElementById('np-ply').addEventListener('click', togglePlay);
document.getElementById('np-prv').addEventListener('click', playPrev);
document.getElementById('np-nxt').addEventListener('click', playNext);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeOverlay();
  if (e.key === ' ' && e.target === document.body) { e.preventDefault(); togglePlay(); }
});

// ── Sidebar nav & section observer ───────────────────────────────────────────

const main     = document.getElementById('main');
const sections = Array.from(document.querySelectorAll('.sec'));
const navBtns  = Array.from(document.querySelectorAll('.snl'));

navBtns.forEach(btn =>
  btn.addEventListener('click', () => sections[+btn.dataset.s].scrollIntoView({ behavior: 'smooth' }))
);

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    const i = sections.indexOf(entry.target);
    navBtns.forEach((b, j) => b.classList.toggle('active', i === j));
  });
}, { root: main, threshold: 0.5 });

sections.forEach(s => observer.observe(s));

// ── Init ──────────────────────────────────────────────────────────────────────

buildWaveform();
renderHome();
renderSongList();
renderArtists();
renderGenres();
renderLibrary();

// ── Quiz onboarding ───────────────────────────────────────────────────────────

function initQuiz() {
  const quizEl   = document.getElementById('quiz');
  const grid     = document.getElementById('qz-grid');
  const btn      = document.getElementById('qz-btn');
  const selected = new Set();

  grid.innerHTML = Object.entries(GENRE_META).map(([g, m]) => `
    <div class="qz-tile" data-genre="${g}" style="--tile-color:${m.color}">
      <span class="qz-tile-icon">${m.icon}</span>
      <span class="qz-tile-name">${g}</span>
      <span class="qz-check">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
      </span>
    </div>
  `).join('');

  grid.querySelectorAll('.qz-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const g = tile.dataset.genre;
      selected.has(g) ? selected.delete(g) : selected.add(g);
      tile.classList.toggle('sel', selected.has(g));
      const n = selected.size;
      btn.disabled    = n === 0;
      btn.textContent = n === 0
        ? 'Select a genre to continue'
        : `Continue with ${n} genre${n > 1 ? 's' : ''} →`;
    });
  });

  btn.addEventListener('click', () => {
    if (!selected.size) return;
    const pick   = [...selected][0];
    const newAcc = GENRE_META[pick]?.color || '#C8FF00';

    document.documentElement.style.setProperty('--acc', newAcc);
    Object.entries(GENRE_META).forEach(([k, v]) => { window.GENRE_COLORS[k] = v.color; });

    document.getElementById('greeting').textContent = `Your ${pick} mix`;
    renderSongList();

    quizEl.classList.add('out');
    quizEl.addEventListener('transitionend', () => { quizEl.style.display = 'none'; }, { once: true });
  });
}

initQuiz();
