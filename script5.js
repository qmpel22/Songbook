// Function to fetch and parse song data
async function loadSongs() {
    const songList = document.getElementById('song-list');
    
    const songFiles = await fetch('songs/song-list.json'); // A JSON file that lists all the song files
    const songs = await songFiles.json();
    
    songs.forEach(song => {
        const songItem = document.createElement('div');
        songItem.textContent = song.title;
        songItem.addEventListener('click', () => openSongPage(song));
        songList.appendChild(songItem);
    });
}

// Function to open a song page in a new tab
function openSongPage(song) {
    const songPage = window.open('lyrics.html', '_blank');
    songPage.onload = () => {
        songPage.setSongData(song);
    };
}

// Function to extract and display song data in lyrics.html
function setSongData(song) {
    const songTitle = document.getElementById('song-title');
    const songAuthor = document.getElementById('song-author');
    const songChords = document.getElementById('song-chords');
    const songLyrics = document.getElementById('song-lyrics');
    const songLink = document.getElementById('song-link');

    songTitle.textContent = song.title;
    songAuthor.textContent = `Author: ${song.author}`;
    songChords.textContent = song.chords;
    songLyrics.textContent = song.lyrics;
    songLink.href = song.link;
}

// Function to parse the song text files
async function parseSongFile(songFileName) {
    const response = await fetch(`songs/${songFileName}`);
    const text = await response.text();

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

// Initialize song list on the main page
loadSongs();
