/* ==========================================
   LUMINEX - Sample Song Data
   ========================================== */

// Sample Songs Database
const songsData = [
    {
        id: 1,
        title: "Midnight Dreams",
        artist: "Aurora Skies",
        album: "Nocturnal Visions",
        duration: 234,
        cover: "https://picsum.photos/seed/album1/400",
        // Using a free sample audio
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        genre: "Electronic",
        year: 2024,
        lyrics: [
            { time: 0, text: "♪ Instrumental ♪" },
            { time: 15, text: "In the silence of the night" },
            { time: 19, text: "Stars are dancing in my sight" },
            { time: 23, text: "Midnight dreams take me away" },
            { time: 27, text: "To a place where I can stay" },
            { time: 32, text: "" },
            { time: 35, text: "Colors swirling all around" },
            { time: 39, text: "Lost in waves of ambient sound" },
            { time: 43, text: "Every heartbeat tells a tale" },
            { time: 47, text: "Through the cosmos we will sail" },
            { time: 52, text: "" },
            { time: 55, text: "Midnight dreams, midnight dreams" },
            { time: 59, text: "Nothing's ever what it seems" },
            { time: 63, text: "In this world of fantasy" },
            { time: 67, text: "You and I are finally free" },
            { time: 72, text: "" },
            { time: 75, text: "♪ Instrumental Break ♪" },
            { time: 95, text: "" },
            { time: 98, text: "When the morning comes to light" },
            { time: 102, text: "I'll remember this tonight" },
            { time: 106, text: "Midnight dreams forever shine" },
            { time: 110, text: "In this heart and soul of mine" }
        ]
    },
    {
        id: 2,
        title: "Neon Pulse",
        artist: "Cyber Collective",
        album: "Digital Horizons",
        duration: 198,
        cover: "https://picsum.photos/seed/album2/400",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        genre: "Synthwave",
        year: 2024,
        lyrics: [
            { time: 0, text: "♪ Synth Intro ♪" },
            { time: 12, text: "Electric city lights" },
            { time: 16, text: "Burning through the night" },
            { time: 20, text: "Neon signs are glowing bright" },
            { time: 24, text: "Everything feels so right" },
            { time: 29, text: "" },
            { time: 32, text: "Racing through the streets" },
            { time: 36, text: "Digital heartbeats" },
            { time: 40, text: "The future's here to stay" },
            { time: 44, text: "We're living for today" },
            { time: 49, text: "" },
            { time: 52, text: "Feel the neon pulse" },
            { time: 56, text: "Running through our veins" },
            { time: 60, text: "Nothing stays the same" },
            { time: 64, text: "In this electric game" }
        ]
    },
    {
        id: 3,
        title: "Ethereal Waves",
        artist: "Luna Echo",
        album: "Ocean of Stars",
        duration: 267,
        cover: "https://picsum.photos/seed/album3/400",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        genre: "Ambient",
        year: 2023,
        lyrics: [
            { time: 0, text: "♪ Ambient Waves ♪" },
            { time: 20, text: "Floating on the breeze" },
            { time: 25, text: "Weightless and at ease" },
            { time: 30, text: "Ocean of stars above" },
            { time: 35, text: "Wrapped in waves of love" },
            { time: 42, text: "" },
            { time: 45, text: "Time dissolves away" },
            { time: 50, text: "In this endless day" },
            { time: 55, text: "Ethereal and bright" },
            { time: 60, text: "Dancing with the light" },
            { time: 68, text: "" },
            { time: 70, text: "Let the currents guide" },
            { time: 75, text: "No more need to hide" },
            { time: 80, text: "In this space we find" },
            { time: 85, text: "Peace within our mind" }
        ]
    },
    {
        id: 4,
        title: "Crystal Memories",
        artist: "Velvet Shadows",
        album: "Timeless",
        duration: 212,
        cover: "https://picsum.photos/seed/album4/400",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        genre: "Dream Pop",
        year: 2024,
        lyrics: [
            { time: 0, text: "♪ Gentle Piano ♪" },
            { time: 10, text: "Crystal memories shine" },
            { time: 15, text: "Fragments of a time" },
            { time: 20, text: "When everything was clear" },
            { time: 25, text: "And you were always here" },
            { time: 32, text: "" },
            { time: 35, text: "Photographs in frames" },
            { time: 40, text: "Whispered forgotten names" },
            { time: 45, text: "Echoes of the past" },
            { time: 50, text: "Moments built to last" },
            { time: 58, text: "" },
            { time: 60, text: "Hold these memories tight" },
            { time: 65, text: "They'll guide us through the night" },
            { time: 70, text: "Crystal clear and true" },
            { time: 75, text: "I'll always remember you" }
        ]
    },
    {
        id: 5,
        title: "Solar Flare",
        artist: "Cosmic Wanderers",
        album: "Stellar Journey",
        duration: 245,
        cover: "https://picsum.photos/seed/album5/400",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        genre: "Space Rock",
        year: 2023,
        lyrics: [
            { time: 0, text: "♪ Cosmic Build-up ♪" },
            { time: 18, text: "Burning like the sun" },
            { time: 22, text: "Our journey has begun" },
            { time: 26, text: "Solar flare ignite" },
            { time: 30, text: "Blazing through the night" },
            { time: 36, text: "" },
            { time: 38, text: "Across the universe we fly" },
            { time: 42, text: "Stardust trails across the sky" },
            { time: 46, text: "Gravity can't hold us down" },
            { time: 50, text: "In space we are unbound" },
            { time: 56, text: "" },
            { time: 58, text: "Solar flare, burning bright" },
            { time: 62, text: "Illuminate the darkest night" },
            { time: 66, text: "We are the cosmic light" },
            { time: 70, text: "Forever burning bright" }
        ]
    },
    {
        id: 6,
        title: "Velvet Thunder",
        artist: "Storm Chasers",
        album: "Electric Storm",
        duration: 223,
        cover: "https://picsum.photos/seed/album6/400",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        genre: "Electronic Rock",
        year: 2024,
        lyrics: [
            { time: 0, text: "♪ Thunder Rumble ♪" },
            { time: 8, text: "Storm clouds gathering high" },
            { time: 12, text: "Lightning splits the sky" },
            { time: 16, text: "Velvet thunder rolls" },
            { time: 20, text: "Deep within our souls" },
            { time: 26, text: "" },
            { time: 28, text: "Feel the power rise" },
            { time: 32, text: "Energy electrifies" },
            { time: 36, text: "No shelter from this storm" },
            { time: 40, text: "We're breaking every norm" },
            { time: 46, text: "" },
            { time: 48, text: "Velvet thunder, crash and roar" },
            { time: 52, text: "Like nothing heard before" },
            { time: 56, text: "We ride the lightning's call" },
            { time: 60, text: "Standing proud and tall" }
        ]
    },
    {
        id: 7,
        title: "Quantum Love",
        artist: "Digital Hearts",
        album: "Binary Romance",
        duration: 201,
        cover: "https://picsum.photos/seed/album7/400",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        genre: "Electropop",
        year: 2024,
        lyrics: [
            { time: 0, text: "♪ Digital Heartbeat ♪" },
            { time: 10, text: "In every dimension" },
            { time: 14, text: "You're my intention" },
            { time: 18, text: "Quantum entangled hearts" },
            { time: 22, text: "Never fall apart" },
            { time: 28, text: "" },
            { time: 30, text: "Through space and time" },
            { time: 34, text: "Your love is mine" },
            { time: 38, text: "In parallel worlds" },
            { time: 42, text: "Our love unfurls" },
            { time: 48, text: "" },
            { time: 50, text: "Quantum love, can't be denied" },
            { time: 54, text: "Across the multiverse so wide" },
            { time: 58, text: "In every timeline true" },
            { time: 62, text: "I'll always find you" }
        ]
    },
    {
        id: 8,
        title: "Gravity Falls",
        artist: "Phoenix Rising",
        album: "Above The Clouds",
        duration: 256,
        cover: "https://picsum.photos/seed/album8/400",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        genre: "Alternative",
        year: 2023,
        lyrics: [
            { time: 0, text: "♪ Melodic Introduction ♪" },
            { time: 15, text: "Standing on the edge" },
            { time: 19, text: "Making every pledge" },
            { time: 23, text: "When gravity falls" },
            { time: 27, text: "Breaking down these walls" },
            { time: 33, text: "" },
            { time: 35, text: "Rising from the ground" },
            { time: 39, text: "A phoenix can be found" },
            { time: 43, text: "Above the clouds so high" },
            { time: 47, text: "We learn to truly fly" },
            { time: 53, text: "" },
            { time: 55, text: "Let gravity fall away" },
            { time: 59, text: "In the sky we'll stay" },
            { time: 63, text: "Nothing holds us back" },
            { time: 67, text: "We're on the right track" }
        ]
    }
];

// Sample Playlists
const playlistsData = [
    {
        id: 1,
        name: "Chill Vibes",
        description: "Perfect songs for relaxation",
        cover: "https://picsum.photos/seed/playlist1/400",
        songs: [1, 3, 4],
        createdAt: new Date("2024-01-15")
    },
    {
        id: 2,
        name: "Energy Boost",
        description: "Get pumped with these tracks",
        cover: "https://picsum.photos/seed/playlist2/400",
        songs: [2, 5, 6],
        createdAt: new Date("2024-02-20")
    },
    {
        id: 3,
        name: "Late Night Sessions",
        description: "Music for the midnight hours",
        cover: "https://picsum.photos/seed/playlist3/400",
        songs: [1, 2, 7],
        createdAt: new Date("2024-03-10")
    },
    {
        id: 4,
        name: "Favorites Mix",
        description: "Your most played tracks",
        cover: "https://picsum.photos/seed/playlist4/400",
        songs: [1, 4, 5, 8],
        createdAt: new Date("2024-03-20")
    }
];

// Genre Colors for Browse Section
const genresData = [
    { id: 1, name: "Electronic", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { id: 2, name: "Synthwave", color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { id: 3, name: "Ambient", color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { id: 4, name: "Dream Pop", color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { id: 5, name: "Space Rock", color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { id: 6, name: "Alternative", color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
    { id: 7, name: "Electropop", color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
    { id: 8, name: "Indie", color: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
    { id: 9, name: "Lo-Fi", color: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" },
    { id: 10, name: "Jazz", color: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)" },
    { id: 11, name: "Classical", color: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)" },
    { id: 12, name: "Hip Hop", color: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)" }
];

// Helper Functions
function getSongById(id) {
    return songsData.find(song => song.id === id);
}

function getPlaylistById(id) {
    return playlistsData.find(playlist => playlist.id === id);
}

function getPlaylistSongs(playlistId) {
    const playlist = getPlaylistById(playlistId);
    if (!playlist) return [];
    return playlist.songs.map(songId => getSongById(songId)).filter(Boolean);
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function searchSongs(query) {
    const lowerQuery = query.toLowerCase();
    return songsData.filter(song =>
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artist.toLowerCase().includes(lowerQuery) ||
        song.album.toLowerCase().includes(lowerQuery)
    );
}

// Export for use in other modules
window.songsData = songsData;
window.playlistsData = playlistsData;
window.genresData = genresData;
window.getSongById = getSongById;
window.getPlaylistById = getPlaylistById;
window.getPlaylistSongs = getPlaylistSongs;
window.formatDuration = formatDuration;
window.searchSongs = searchSongs;
