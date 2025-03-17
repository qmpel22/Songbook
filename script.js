// Map chords to semitone values
const chordMap = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
    'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11
};

// Store loaded songs content
let songDatabase = {};

// List of available songs
const availableSongs = [
    'Panie-ulituj-sie-nad-nami'
    // Add more songs here as they are added to the songs folder
];

// Function to clean up text by replacing hyphens with spaces
function cleanText(text) {
    if (!text) return '';
    return text.replace(/-/g, ' ');
}

// Function to create URL-friendly text
function createUrlFriendlyText(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Function to parse metadata from the file content
function parseMetadata(lines) {
    const metadata = {
        title: '',
        author: null,
        tag: null,
        intro: null,
        chords: '',
        youtubeLink: null
    };

    let contentStartIndex = 0;
    let hasMetadata = false;

    // First, check if the file starts with metadata
    if (lines[0] && lines[0].trim().startsWith('title:')) {
        hasMetadata = true;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('title:')) {
                metadata.title = cleanText(line.replace('title:', '').trim());
            } else if (line.startsWith('author:')) {
                const author = line.replace('author:', '').trim();
                metadata.author = author || null;
            } else if (line.startsWith('tag:')) {
                const tag = line.replace('tag:', '').trim();
                metadata.tag = tag ? tag.split(',').map(tag => cleanText(tag.trim())).join(', ') : null;
            } else if (line.startsWith('intro:')) {
                const intro = line.replace('intro:', '').trim();
                metadata.intro = intro || null;
            } else if (line.startsWith('link:')) {
                const link = line.replace('link:', '').trim();
                metadata.youtubeLink = link || null;
            } else if (line.startsWith('chords:')) {
                metadata.chords = line.replace('chords:', '').trim();
                // Find the first non-empty line after 'chords:'
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].trim() !== '') {
                        contentStartIndex = j;
                        break;
                    }
                }
                break;
            }
        }
    } else {
        // If no metadata, use the first non-empty line as title
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() !== '') {
                metadata.title = cleanText(lines[i].trim());
                contentStartIndex = i + 1;
                break;
            }
        }
    }

    return { metadata, contentStartIndex };
}

// Function to load a song file
function loadSongFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const songName = file.name.replace('.txt', '');
            songDatabase[songName] = text;
            resolve(text);
        };
        reader.onerror = function(error) {
            console.error('Error reading file:', error);
            reject(error);
        };
        reader.readAsText(file);
    });
}

// Function to load all songs from the songs directory
async function loadAllSongs() {
    try {
        const dirHandle = await window.showDirectoryPicker();
        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.txt')) {
                const file = await entry.getFile();
                await loadSongFile(file);
            }
        }
    } catch (error) {
        console.error('Error loading songs:', error);
    }
}

// Function to load and display song content
async function loadAndDisplaySong(songName) {
    try {
        const response = await fetch(`songs/${songName}.txt`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const lines = text.split('\n');
        const { metadata, contentStartIndex } = parseMetadata(lines);
        
        const toggleFormat = document.getElementById('toggleFormat').checked;
        const activeButton = document.querySelector('.transpose-btn.active');
        const transpositionValue = parseInt(activeButton.dataset.value);

        let songHtml = '';
        // Add metadata to the display with transposed intro
        songHtml += `<div class="song-metadata">
                        <h2>${metadata.title || 'Bez tytułu'}</h2>
                        ${metadata.author && metadata.author !== '' ? `<p class="author">Autor: ${metadata.author}</p>` : ''}
                        ${metadata.tag && metadata.tag !== '' ? `<p class="tags">Tagi: ${metadata.tag}</p>` : ''}
                        ${metadata.intro && metadata.intro !== '' ? `<p class="intro">Intro: ${transposeTextChords(metadata.intro, transpositionValue)}</p>` : ''}
                        ${metadata.youtubeLink && metadata.youtubeLink !== '' ? `<p class="youtube-link"><a href="${metadata.youtubeLink}" target="_blank" rel="noopener noreferrer">Posłuchaj na YouTube</a></p>` : ''}
                    </div>`;

        // Process the song content
        for (let i = contentStartIndex; i < lines.length; i++) {
            songHtml += processLine(lines[i], transpositionValue, toggleFormat);
        }

        document.getElementById('songDisplay').innerHTML = songHtml;
        return true;
    } catch (error) {
        console.error('Error processing song:', error);
        return false;
    }
}

// Function to search songs
function searchSongs(query) {
    if (!query) return [];
    const searchQuery = query.toLowerCase();
    return availableSongs
        .filter(song => {
            const displayName = cleanText(song).toLowerCase();
            return displayName.includes(searchQuery);
        })
        .map(song => ({
            filename: song,
            displayName: cleanText(song)
        }));
}

// Function to display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">Brak wyników</div>';
    } else {
        results.forEach(song => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.textContent = song.displayName;
            div.addEventListener('click', async () => {
                try {
                    // Hide search results and clear input immediately
                    searchResults.classList.remove('active');
                    document.getElementById('searchInput').value = '';
                    
                    // Load and display the song
                    if (await loadAndDisplaySong(song.filename)) {
                        // Scroll to the top of the song display
                        document.getElementById('songDisplay').scrollIntoView({ behavior: 'smooth' });
                    } else {
                        throw new Error('Failed to process song content');
                    }
                } catch (error) {
                    console.error('Error loading song:', error);
                    alert('Nie udało się załadować piosenki. Spróbuj ponownie później.');
                }
            });
            searchResults.appendChild(div);
        });
    }
    
    searchResults.classList.add('active');
}

// Handle search input with debounce
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function(e) {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length >= 2) {
        searchTimeout = setTimeout(() => {
            const results = searchSongs(query);
            displaySearchResults(results);
        }, 300);
    } else {
        document.getElementById('searchResults').classList.remove('active');
    }
});

// Close search results when clicking outside
document.addEventListener('click', function(e) {
    const searchContainer = document.querySelector('.search-container');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchContainer.contains(e.target)) {
        searchResults.classList.remove('active');
    }
});

// Add event listener to the checkbox to update the format
document.getElementById('toggleFormat').addEventListener('change', function() {
    const songDisplay = document.getElementById('songDisplay');
    if (songDisplay.innerHTML.trim() !== '') {
        const currentSong = availableSongs.find(song => 
            songDisplay.querySelector('.song-metadata h2').textContent === cleanText(song)
        );
        if (currentSong) {
            loadAndDisplaySong(currentSong);
        }
    }
});

// Handle transpose button clicks
document.querySelectorAll('.transpose-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.transpose-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        const songDisplay = document.getElementById('songDisplay');
        if (songDisplay.innerHTML.trim() !== '') {
            const currentSong = availableSongs.find(song => 
                songDisplay.querySelector('.song-metadata h2').textContent === cleanText(song)
            );
            if (currentSong) {
                loadAndDisplaySong(currentSong);
            }
        }
    });
});

// Function to transpose chords by the given number of semitones
function transposeChord(chord, semitones) {
    if (!chord || chord.trim() === '') return chord;
    
    // Convert to uppercase for matching, but preserve original case
    const originalChord = chord;
    chord = chord.toUpperCase();
    
    const match = chord.match(/^([A-G]#?B?)(.*)$/);
    if (!match) return originalChord;
    
    const [_, root, suffix] = match;
    if (chordMap[root] !== undefined) {
        let transposedSemitone = (chordMap[root] + semitones) % 12;
        if (transposedSemitone < 0) transposedSemitone += 12;
        const newRoot = Object.keys(chordMap).find(key => chordMap[key] === transposedSemitone);
        // Preserve original case (lowercase 'm' in minor chords)
        const newChord = newRoot + suffix;
        return originalChord.includes('m') ? newChord.replace('M', 'm') : newChord;
    }
    return originalChord;
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

// Function to process a line and highlight chords
function processLine(line, transpositionValue, toggleFormat) {
    if (!line.trim()) return '';

    // Check if the line contains chords (has "//")
    if (line.includes('//')) {
        const parts = line.split('//');
        let chords = parts[0];
        let text = parts[1].trim();

        // Process chords before // while preserving spaces
        const chordArray = chords.split(/(\s+)/);
        const transposedChords = chordArray.map(part => {
            if (part.trim() === '') return part;
            return transposeChord(part, transpositionValue);
        }).join('');

        // Process chords in the text part
        let processedText = text;
        // Only process if there are actual chords in the text
        if (text.match(/[A-Ga-g]#?b?[^a-z\s]*/)) {
            processedText = transposeTextChords(text, transpositionValue);
        }

        if (toggleFormat) {
            return `<div class="song-line vertical">
                        <div class="chords">${transposedChords}</div>
                        <div class="lyrics">${processedText}</div>
                    </div>`;
        } else {
            const leadingSpace = transposedChords.match(/^\s+/)?.[0] || '';
            const chordsWithoutSpaces = transposedChords.replace(/\s+/g, ' ').trim();
            return `<div class="song-line horizontal">
                        <div class="lyrics">${processedText}</div>
                        <div class="chords">${leadingSpace}${chordsWithoutSpaces}</div>
                    </div>`;
        }
    } else {
        // For lines without //, only process if they contain valid chords
        let processedText = line;
        if (line.match(/[A-Ga-g]#?b?[^a-z\s]*/)) {
            processedText = transposeTextChords(line, transpositionValue);
        }

        if (toggleFormat) {
            return `<div class="song-line vertical">
                        <div class="lyrics">${processedText}</div>
                    </div>`;
        } else {
            return `<div class="song-line horizontal">
                        <div class="lyrics">${processedText}</div>
                    </div>`;
        }
    }
}

// Add load songs button
const loadButton = document.createElement('button');
loadButton.textContent = 'Wczytaj folder z piosenkami';
loadButton.className = 'load-button';
loadButton.addEventListener('click', loadAllSongs);
document.querySelector('.search-container').before(loadButton);
