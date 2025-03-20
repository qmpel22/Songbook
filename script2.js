// File handling and format toggle functionality
let availableSongs = [];

function initFileHandling() {
    const fileInput = document.getElementById('fileInput');
    const songDisplay = document.getElementById('songDisplay');
    const toggleFormat = document.getElementById('toggleFormat');
    const searchInput = document.getElementById('searchInput');

    // Load songs from directory
    loadSongsFromDirectory();

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            displaySong(content);
        };
        reader.readAsText(file);
    });

    // Search functionality
    searchInput.addEventListener('input', function(e) {
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
    document.addEventListener('click', function(e) {
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

async function loadSong(songName) {
    try {
        const response = await fetch(`/songs/${songName}`);
        const content = await response.text();
        displaySong(content);
    } catch (error) {
        console.error('Error loading song:', error);
    }
}

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
                .map(tag => tag.trim().replace(/-/g, ' '))
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
    for (let i = contentStartIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            songHtml += processLine(line);
        }
    }

    songDisplay.innerHTML = songHtml;
    
    // After displaying the song, update transposition if transposer is available
    if (window.transposer) {
        window.transposer.updateTransposition();
    }
}

function processLine(line) {
    const toggleFormat = document.getElementById('toggleFormat');
    if (!line.trim()) return '';

    // Check if the line contains chords (has "//")
    if (line.includes('//')) {
        // Split the line at '//' to separate chords and lyrics
        const [chordsSection, lyricsSection] = line.split('//').map(part => part.trim());
        
        // Create the HTML structure based on format
        if (toggleFormat.checked) {
            return `<div class="song-line vertical">
                        <div class="chords" data-original="${chordsSection}">${chordsSection}</div>
                        <div class="lyrics">${lyricsSection || '&nbsp;'}</div>
                    </div>`;
        } else {
            return `<div class="song-line horizontal">
                        <div class="lyrics">${lyricsSection || '&nbsp;'}</div>
                        <div class="chords" data-original="${chordsSection}">${chordsSection}</div>
                    </div>`;
        }
    } else {
        // Lines without chords (no //)
        return `<div class="song-line ${toggleFormat.checked ? 'vertical' : 'horizontal'}">
                    <div class="lyrics">${line.trim()}</div>
                </div>`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const toggleFormat = document.getElementById('toggleFormat');
    const songLines = document.querySelectorAll('.song-line');

    toggleFormat.addEventListener('change', () => {
        songLines.forEach(line => {
            const chords = line.querySelector('.chords').innerHTML;
            const lyrics = line.querySelector('.lyrics').innerHTML;

            if (toggleFormat.checked) {
                // Zmiana formatu na pionowy
                line.innerHTML = `
                    <div class="chords">${chords}</div>
                    <div class="lyrics">${lyrics}</div>
                `;
            } else {
                // Zmiana formatu na poziomy
                line.innerHTML = `
                    <span class="lyrics">${lyrics}</span>
                    <span class="chords">${chords}</span>
                `;
            }
        });
    });
    
    // Initialize file handling
    initFileHandling();

    // Update the event listener for transpose buttons
    document.querySelectorAll('.transpose-btn').forEach(button => {
        button.addEventListener('click', () => {
            const semitones = parseInt(button.getAttribute('data-value'));
            const lyrics = songDisplay.innerHTML; // Use the correct element
            const transposedLyrics = transposeTextChords(lyrics, semitones);
            
            // Update the displayed lyrics
            songDisplay.innerHTML = transposedLyrics; 
            
            // Highlight the active button
            document.querySelectorAll('.transpose-btn').forEach(btn => {
                btn.classList.remove('active'); // Remove active class from all buttons
            });
            button.classList.add('active'); // Add active class to the clicked button

            // Display the transposition amount
            const transpositionInfo = document.getElementById('transposition-info');
            transpositionInfo.textContent = `Transposed by ${semitones} semitone(s)`;
        });
    });
});
