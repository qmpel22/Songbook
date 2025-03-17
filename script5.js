// Function to fetch and parse song list data
async function loadSongs() {
    const songList = document.getElementById('song-list');
    songList.innerHTML = "<p>Loading songs...</p>"; // Display loading message

    try {
        // Fetch the list of songs from the song-list.json
        const response = await fetch('songs/song-list.json');
        if (!response.ok) throw new Error('Failed to load song list');
        const songs = await response.json();

        const fragment = document.createDocumentFragment(); // DocumentFragment to improve performance

        // Iterate through the list of songs
        for (const song of songs) {
            const songItem = createSongItem(song);
            fragment.appendChild(songItem);
        }

        songList.innerHTML = ""; // Clear loading message
        songList.appendChild(fragment);
    } catch (error) {
        console.error(error);
        const errorMessage = document.createElement('div');
        errorMessage.textContent = 'Unable to load songs: ' + error.message; // Improved error message
        songList.appendChild(errorMessage);
    }
}

// Helper function to create song item elements
function createSongItem(song) {
    const songItem = document.createElement('div');
    songItem.classList.add('song-item');
    songItem.textContent = song.title;

    // Add click event to open the song page
    songItem.addEventListener('click', async () => {
        await loadSong(song.filename);
    });
    return songItem;
}

// Function to extract and display song data in lyrics.html
function setSongData() {
    try {
        const songData = localStorage.getItem('currentSong');

        if (!songData) throw new Error('No song data found');

        const lines = songData.split('\n');
        const metadata = extractMetadata(lines);
        const lyrics = extractLyrics(lines);

        document.getElementById('song-title').textContent = metadata.title;
        document.getElementById('song-author').textContent = `Author: ${metadata.author || 'Unknown'}`;
        document.getElementById('song-chords').textContent = metadata.chords || '';
        document.getElementById('song-lyrics').textContent = lyrics || 'No lyrics available.';
        document.getElementById('song-link').href = metadata.link || '#';
    } catch (error) {
        console.error(error);
        // Display error message in lyrics.html
        document.getElementById('song-title').textContent = 'Error loading song data';
        document.getElementById('song-author').textContent = '';
        document.getElementById('song-chords').textContent = '';
        document.getElementById('song-lyrics').textContent = 'Unable to load lyrics.';
        document.getElementById('song-link').textContent = '';
    }
}

// Helper function to extract metadata from song data
function extractMetadata(lines) {
    const metadata = {};
    lines.forEach(line => {
        if (line.startsWith('title:')) metadata.title = line.substring(6).trim();
        else if (line.startsWith('author:')) metadata.author = line.substring(7).trim();
        else if (line.startsWith('chords:')) metadata.chords = line.substring(7).trim();
        else if (line.startsWith('link:')) metadata.link = line.substring(5).trim();
    });
    return metadata;
}

// Helper function to extract lyrics from song data
function extractLyrics(lines) {
    return lines.filter(line => !line.startsWith('title:') && !line.startsWith('author:') && !line.startsWith('chords:') && !line.startsWith('link:')).join('\n');
}

// Function to parse the song text files
async function parseSongFile(songFileName) {
    try {
        const response = await fetch(`songs/${songFileName}`);
        if (!response.ok) throw new Error(`Failed to load song file: ${songFileName}`);
        const text = await response.text();

        const songData = extractSongData(text);
        return songData;
    } catch (error) {
        console.error(error);
    }
}

// Helper function to extract song data from text
function extractSongData(text) {
    const songData = {};
    const lines = text.split('\n');

    lines.forEach(line => {
        if (line.startsWith('title:')) songData.title = line.substring(6).trim();
        else if (line.startsWith('author:')) songData.author = line.substring(7).trim();
        else if (line.startsWith('tag:')) songData.tag = line.substring(4).trim();
        else if (line.startsWith('intro:')) songData.intro = line.substring(6).trim();
        else if (line.startsWith('link:')) songData.link = line.substring(5).trim();
        else if (line.startsWith('chords:')) songData.chords = line.substring(7).trim();
        else if (!line.startsWith('//')) songData.lyrics = songData.lyrics ? songData.lyrics + '\n' + line : line;
    });

    return songData;
}

async function loadSong(songName) {
    try {
        const response = await fetch(`/songs/${songName}`);
        const content = await response.text();
        localStorage.setItem('currentSong', content);
        displaySong(content); // Call displaySong directly here
    } catch (error) {
        console.error('Error loading song:', error);
    }
}

// Initialize song list on the main page
loadSongs();

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', setSongData);
