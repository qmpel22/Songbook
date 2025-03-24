document.addEventListener('DOMContentLoaded', function () {
    initFormatToggle();
    initFileHandling();
    loadSongFromURL();
});

// YouTube video handling
function loadSongFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const songFile = urlParams.get('song'); // Get the song filename from the URL

    if (songFile) {
        loadSong(songFile);
    }
}

function loadSong(songName) {
    fetch(`/songs/${songName}`)  // Fetch the song's file from the server
        .then(response => response.text())
        .then(content => {
            displaySong(content);
        })
        .catch(error => {
            console.error('Error loading song:', error);
        });
}

// Parse metadata from the song text
function parseMetadata(lines) {
    const metadata = {
        title: '',
        author: '',
        tag: '',
        intro: '',
        youtubeLink: '',
        chords: ''
    };

    let contentStartIndex = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('title:')) {
            metadata.title = line.substring(6).trim().replace(/-/g, ' ');
        } else if (line.startsWith('author:')) {
            metadata.author = line.substring(7).trim();
        } else if (line.startsWith('tag:')) {
            metadata.tag = line.substring(4).trim()
                .split(',')
                .map(tag => tag.trim().replace(/-/g, ' ')) // Replacing dashes
                .join(', ');
        } else if (line.startsWith('intro:')) {
            metadata.intro = line.substring(6).trim();
        } else if (line.startsWith('link:')) {
            metadata.youtubeLink = line.substring(5).trim();
        } else if (line.startsWith('chords:')) {
            contentStartIndex = i + 1;
            break;
        }
    }

    return { metadata, contentStartIndex };
}

// Display the song
// Handle song line formatting
function processLine(chords, lyrics) {
    let lineHtml = '';

    if (toggleFormat.checked) { // Vertical format
        if (chords && lyrics) {
            lineHtml = `
                <div class="song-line vertical">
                    <div class="chords">${chords}</div>
                    <div class="lyrics">${lyrics}</div>
                </div>
            `;
        } else if (chords) {
            lineHtml = `
                <div class="song-line vertical">
                    <div class="chords">${chords}</div>
                </div>
            `;
        } else if (lyrics) {
            lineHtml = `
                <div class="song-line vertical">
                    <div class="lyrics">${lyrics}</div>
                </div>
            `;
        }
    } else { // Horizontal format
        if (chords && lyrics) {
            lineHtml = `
                <div class="song-line horizontal">
                    <div class="chords">${chords}</div>
                    <div class="lyrics">${lyrics}</div>
                </div>
            `;
        } else if (chords) {
            lineHtml = `
                <div class="song-line horizontal">
                    <div class="chords">${chords}</div>
                </div>
            `;
        } else if (lyrics) {
            lineHtml = `
                <div class="song-line horizontal">
                    <div class="lyrics">${lyrics}</div>
                </div>
            `;
        }
    }

    return lineHtml;
}

// Display the song
function displaySong(content) {
    const songDisplay = document.getElementById('songDisplay');
    const lines = content.split('\n');
    const { metadata, contentStartIndex } = parseMetadata(lines);

    let songHtml = '';
    
    // Add metadata section
    songHtml += `<div class="song-metadata">`;
    if (metadata.title) {
        songHtml += `<h2>${metadata.title}</h2>`;
    }
    if (metadata.author) {
        songHtml += `<p class="author">Autor: ${metadata.author}</p>`;
    }
    if (metadata.tag) {
        songHtml += `<p class="tags">Tagi: ${metadata.tag}</p>`;
    }
    if (metadata.intro) {
        songHtml += `<p class="intro">Intro: <span class="chords" data-original="${metadata.intro}">${metadata.intro}</span></p>`;
    }
    if (metadata.youtubeLink) {
        songHtml += `<p class="youtube-link"><a href="${metadata.youtubeLink}" target="_blank" rel="noopener noreferrer">Posłuchaj na YouTube</a></p>`;
    }
    songHtml += `</div>`;

    // Process song content
    let lyricsHtml = '';
    let lastLineWasEmpty = true; // to handle empty lines

    // Variables to store chords and lyrics for each line
    let chords = '';
    let lyrics = '';

    for (let i = contentStartIndex; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line) {
            if (line.includes('//')) {
                // Split chords and lyrics
                const [chordsPart, lyricsPart] = line.split('//').map(part => part.trim());
                chords = chordsPart;
                lyrics = lyricsPart;

                // Now process this line and add it to the HTML
                lyricsHtml += processLine(chords, lyrics);
            } else {
                // If there's no chords, treat this as lyrics
                lyricsHtml += processLine(null, line);
            }
            lastLineWasEmpty = false;
        } else if (!lastLineWasEmpty) {
            // Add an empty line if the previous one wasn't empty
            lyricsHtml += '<div class="song-line horizontal"><div class="lyrics">&nbsp;</div></div>';
            lastLineWasEmpty = true;
        }
    }

    songHtml += `<div class="song-lyrics">${lyricsHtml}</div>`;
    songDisplay.innerHTML = songHtml;
}


// Format toggle functionality
let toggleFormat;

function initFormatToggle() {
    toggleFormat = document.getElementById("toggleFormat"); // Initialize the toggleFormat variable
    toggleFormat.addEventListener("change", function () {
        const songLines = document.querySelectorAll(".song-line");
        songLines.forEach(line => {
            if (this.checked) {
                line.classList.remove("horizontal");
                line.classList.add("vertical");
            } else {
                line.classList.remove("vertical");
                line.classList.add("horizontal");
            }
        });
    });
}

// File handling functionality
let availableSongs = [];

function initFileHandling() {
    const fileInput = document.getElementById('fileInput');
    const songDisplay = document.getElementById('songDisplay');
    const searchInput = document.getElementById('searchInput');

    // Load songs from directory (if required)
    loadSongsFromDirectory();

    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            displaySong(content);
        };
        reader.readAsText(file);
    });

    // Search functionality
    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase().trim();
        const searchResults = document.getElementById('searchResults');
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('active');
            return;
        }

        const filteredSongs = availableSongs.filter(song => 
            song.toLowerCase().includes(query)
        );

        if (filteredSongs.length > 0) {
            searchResults.innerHTML = filteredSongs
                .map(song => `<div class="search-result-item" onclick="loadSong('${song}')">${song}</div>`)
                .join('');
            searchResults.classList.add('active');
        } else {
            searchResults.innerHTML = '<div class="search-result-item">Nie znaleziono piosenek</div>';
            searchResults.classList.add('active');
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', function (e) {
        const searchResults = document.getElementById('searchResults');
        if (!e.target.closest('.search-container')) {
            searchResults.classList.remove('active');
        }
    });
}

async function loadSongsFromDirectory() {
    try {
        const response = await fetch('/songs');
        const songs = await response.json();
        availableSongs = songs;
        
        // Update song list if we're on the index page
        const songList = document.getElementById('songList');
        if (songList) {
            songList.innerHTML = songs
                .map(song => `<div class="song-item" onclick="loadSong('${song}')">${song.replace('.txt', '')}</div>`)
                .join('');
        }
    } catch (error) {
        console.error('Error loading songs:', error);
    }
}
