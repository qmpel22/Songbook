// Chord Transposition and Derivative Operations

const chordMap = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
    'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11
};

const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

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

function transposeChord(chord, steps) {
    const notes = Object.keys(chordMap);
    const index = chordMap[chord];
    if (index === undefined) return chord; // Return unchanged if not a valid chord

    const newIndex = (index + steps + 12) % 12; // Ensure positive index
    return notes[newIndex];
}

function transposeTextChords(text, semitones) {
    const chordPattern = /([A-G][#b]?)(\s*\/\/.*)/g; // Regex to match chords followed by lyrics
    return text.replace(chordPattern, (match, chord, lyrics) => {
        const transposedChord = transposeChord(chord, semitones);
        return `${transposedChord} ${lyrics}`; // Return transposed chord with original lyrics
    });
}

function transposeText(text, steps, preferFlats = false) {
    // Updated regex to match more chord patterns
    const chordPattern = /[A-G][b#]?(?:m|maj|dim|aug|sus[24]|[2-9]|add\d+|\/[A-G][b#]?)*\b/g;
    return text.replace(chordPattern, match => transposeChord(match, steps, preferFlats));
}

// Event Listener for Transpose Buttons
document.addEventListener('DOMContentLoaded', () => {
    const transposeButtons = document.querySelectorAll('.transpose-btn');

    transposeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const semitones = parseInt(event.target.getAttribute('data-value'));
            const songLyrics = document.getElementById('song-lyrics');
            if (songLyrics) {
                const lyrics = songLyrics.textContent;
                const transposedLyrics = transposeTextChords(lyrics, semitones);
                songLyrics.textContent = transposedLyrics; // Update displayed lyrics
            }

            // Highlight the active button
            transposeButtons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        });
    });
});

// Example usage
const songLyrics = document.getElementById('song-lyrics');
if (songLyrics) {
    const transposedLyrics = transposeTextChords(songLyrics.textContent, 2); // Transpose up by 2 semitones
    songLyrics.textContent = transposedLyrics;
}

