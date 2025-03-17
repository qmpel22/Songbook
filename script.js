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
    const chordMap = {
        'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };

    const notes = Object.keys(chordMap);
    const index = chordMap[chord];
    if (index === undefined) return chord; // Return unchanged if not a valid chord

    const newIndex = (index + steps + 12) % 12; // Ensure positive index
    return notes[newIndex];
}

function transposeTextChords(text, semitones) {
    const chordPattern = /[A-G][#b]?/g; // Regex to match chords
    return text.replace(chordPattern, match => transposeChord(match, semitones));
}

function transposeText(text, steps, preferFlats = false) {
    // Updated regex to match more chord patterns
    const chordPattern = /[A-G][b#]?(?:m|maj|dim|aug|sus[24]|[2-9]|add\d+|\/[A-G][b#]?)*\b/g;
    return text.replace(chordPattern, match => transposeChord(match, steps, preferFlats));
}

// Event Listener for Transpose Buttons
document.addEventListener('DOMContentLoaded', () => {
    const notesInput = document.getElementById('notesInput');
    const transposedOutput = document.getElementById('transposedOutput');
    const transposeButtons = document.querySelectorAll('.transpose-btn');

    // Function to handle the transpose button click
    function handleTransposeClick(event) {
        const semitones = parseInt(event.target.getAttribute('data-value'));
        
        // Remove active class from all buttons
        transposeButtons.forEach(button => {
            button.classList.remove('active');
        });

        // Add active class to the clicked button
        event.target.classList.add('active');

        // Transpose the input text
        const inputText = notesInput.value.trim();
        if (inputText) {
            const transposedText = transposeText(inputText, semitones);
            transposedOutput.textContent = transposedText;  // Display the transposed notes
        }

        // Ensure transposition works for lyrics displayed in songDisplay
        const songLyrics = document.getElementById('song-lyrics');
        if (songLyrics) {
            const lyrics = songLyrics.textContent;
            const transposedLyrics = transposeTextChords(lyrics, semitones);
            songLyrics.textContent = transposedLyrics;
        }
    }

    // Attach the event listener to each transpose button
    transposeButtons.forEach(button => {
        button.addEventListener('click', handleTransposeClick);
    });

    // Initialize the default transposition (if needed)
    const defaultButton = document.querySelector('.transpose-btn.active');
    if (defaultButton) {
        const defaultSemitones = parseInt(defaultButton.getAttribute('data-value'));
        const songLyrics = document.getElementById('song-lyrics');
        if (songLyrics) {
            const lyrics = songLyrics.textContent;
            const transposedLyrics = transposeTextChords(lyrics, defaultSemitones);
            songLyrics.textContent = transposedLyrics;
        }
    }
});

// Example usage
const songLyrics = document.getElementById('song-lyrics');
if (songLyrics) {
    const transposedLyrics = transposeTextChords(songLyrics.textContent, 2); // Transpose up by 2 semitones
    songLyrics.textContent = transposedLyrics;
}

