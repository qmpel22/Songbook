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
document.addEventListener('DOMContentLoaded', function() {
    const toggleFormat = document.getElementById('toggleFormat');
    if (toggleFormat) {
        toggleFormat.addEventListener('change', function() {
            const songLines = document.querySelectorAll('.song-line');
            songLines.forEach(line => {
                line.className = 'song-line ' + (this.checked ? 'vertical' : 'horizontal');
            });
        });
    }
    
    // Initialize file handling
    initFileHandling();
});

// Handle file input for adding new songs
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const text = e.target.result;
            const filename = file.name;
            const songName = filename.replace('.txt', '');
            
            // Add the new song to availableSongs if it's not already there
            if (!availableSongs.includes(songName)) {
                availableSongs.push(songName);
            }
            
            await loadAndDisplaySong(text);
        };
        reader.onerror = function(error) {
            console.error('Error reading file:', error);
            alert('Nie udało się odczytać pliku. Sprawdź czy plik jest poprawny.');
        };
        reader.readAsText(file);
    }
});

// Add event listener to the checkbox to update the format
document.getElementById('toggleFormat').addEventListener('change', function() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
        fileInput.dispatchEvent(new Event('change'));
    }
});

// Handle transpose button clicks
document.querySelectorAll('.transpose-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.transpose-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        const fileInput = document.getElementById('fileInput');
        if (fileInput.files.length > 0) {
            fileInput.dispatchEvent(new Event('change'));
        }
    });
});

// Map chords to semitone values
const chordMap = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
    'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11
};

// Function to clean up text by replacing hyphens with spaces
function cleanText(text) {
    if (!text) return '';
    return text.replace(/-/g, ' ');
}

// Function to load and display song content
async function loadAndDisplaySong(text) {
    try {
        const lines = text.split('\n');
        const { metadata, contentStartIndex } = parseMetadata(lines);
        
        const toggleFormat = document.getElementById('toggleFormat').checked;
        const activeButton = document.querySelector('.transpose-btn.active');
        const transpositionValue = activeButton ? parseInt(activeButton.dataset.value) : 0;

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
            const transposedIntro = transposeTextChords(metadata.intro, transpositionValue);
            songHtml += `<p class="intro">Intro: ${transposedIntro}</p>`;
        }
        if (metadata.youtubeLink) {
            songHtml += `<p class="youtube-link"><a href="${metadata.youtubeLink}" target="_blank" rel="noopener noreferrer">Posłuchaj na YouTube</a></p>`;
        }
        songHtml += `</div>`;

        // Process song content
        for (let i = contentStartIndex; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim()) {
                songHtml += processLine(line, transpositionValue, toggleFormat);
            }
        }

        document.getElementById('songDisplay').innerHTML = songHtml;
        return true;
    } catch (error) {
        console.error('Error processing song:', error);
        return false;
    }
}

// Transposition functionality
const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Map of equivalent notes (flats to sharps)
const flatToSharp = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#'
};

function normalizeChord(chord) {
    // Convert flat notation to sharp notation for internal processing
    for (const [flat, sharp] of Object.entries(flatToSharp)) {
        if (chord.startsWith(flat)) {
            return chord.replace(flat, sharp);
        }
    }
    return chord;
}

function denormalizeChord(chord, preferFlats = false) {
    if (!preferFlats) return chord;
    
    // Convert sharp notation back to flat notation if preferred
    for (const [flat, sharp] of Object.entries(flatToSharp)) {
        if (chord.startsWith(sharp)) {
            return chord.replace(sharp, flat);
        }
    }
    return chord;
}

function transposeChord(chord, steps, preferFlats = false) {
    // Extract the root note and the rest of the chord
    const chordPattern = /^([A-G][b#]?)(.*)$/;
    const match = chord.match(chordPattern);
    if (!match) return chord; // Return unchanged if not a valid chord

    const [, root, suffix] = match;
    const normalizedRoot = normalizeChord(root);
    
    // Find the base note index
    let noteIndex = sharpNotes.indexOf(normalizedRoot);
    if (noteIndex === -1) return chord; // Return unchanged if not found

    // Calculate new index
    let newIndex = (noteIndex + steps) % 12;
    if (newIndex < 0) newIndex += 12;

    // Get the new root note
    const newRoot = preferFlats ? flatNotes[newIndex] : sharpNotes[newIndex];
    
    // Return the transposed chord with the original suffix
    return newRoot + suffix;
}

function transposeText(text, steps, preferFlats = false) {
    // Updated regex to match more chord patterns
    const chordPattern = /[A-G][b#]?(?:m|maj|dim|aug|sus[24]|[2-9]|add\d+|\/[A-G][b#]?)*\b/g;
    return text.replace(chordPattern, match => transposeChord(match, steps, preferFlats));
}

// Function to transpose all chords in a text
function transposeTextChords(text, semitones) {
    if (!text) return '';
    // Split the text into words and process each one
    return text.split(/(\s+)/).map(part => {
        if (part.trim() === '') return part;
        // Check if the part is a valid chord
        const upperPart = part.toUpperCase();
        if (chordMap[upperPart] !== undefined) {
            return transposeChord(part, semitones);
        }
        return part;
    }).join('');
}
