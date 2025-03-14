// Chord transposition functionality
class ChordTransposer {
    constructor() {
        this.currentTransposition = 0;
        this.useFlats = false;
        this.NOTES = {
            SHARP: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
            FLAT: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
        };
        this.CHORD_REGEX = /^([A-G][b#]?)(.*)$/;
        this.init();
    }

    init() {
        // Initialize transpose buttons
        const transposeButtons = document.querySelectorAll('.transpose-btn[data-value]');
        transposeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const newValue = parseInt(button.dataset.value);
                this.currentTransposition = newValue;
                transposeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.updateTransposition();
            });
        });

        // Add notation toggle button if it doesn't exist
        if (!document.querySelector('.notation-toggle')) {
            const notationToggle = document.createElement('button');
            notationToggle.textContent = 'Użyj ♭';
            notationToggle.className = 'transpose-btn notation-toggle';
            notationToggle.style.marginLeft = '10px';
            document.querySelector('.transpose-buttons').appendChild(notationToggle);

            notationToggle.addEventListener('click', () => {
                this.useFlats = !this.useFlats;
                notationToggle.textContent = this.useFlats ? 'Użyj #' : 'Użyj ♭';
                this.updateTransposition();
            });
        }

        // Initialize input handling for transponuj.html
        const notesInput = document.getElementById('notesInput');
        if (notesInput) {
            notesInput.addEventListener('input', () => this.updateTransposition());
        }
    }

    transposeChord(chord) {
        if (!chord || chord.trim() === '') return chord;

        const match = chord.match(this.CHORD_REGEX);
        if (!match) return chord;

        const [, root, suffix] = match;
        const notes = this.useFlats ? this.NOTES.FLAT : this.NOTES.SHARP;
        const normalizedRoot = this.normalizeNote(root);
        let noteIndex = this.NOTES.SHARP.indexOf(normalizedRoot);

        if (noteIndex === -1) return chord;

        let newIndex = (noteIndex + this.currentTransposition) % 12;
        if (newIndex < 0) newIndex += 12;

        return notes[newIndex] + suffix;
    }

    normalizeNote(note) {
        // Convert flat notes to sharp notes for internal processing
        const flatToSharp = {
            'Db': 'C#',
            'Eb': 'D#',
            'Gb': 'F#',
            'Ab': 'G#',
            'Bb': 'A#'
        };
        return flatToSharp[note] || note;
    }

    updateTransposition() {
        // Update all chord elements in Lyrics.html
        document.querySelectorAll('.chords').forEach(element => {
            const originalChords = element.dataset.original;
            if (originalChords) {
                element.textContent = this.transposeText(originalChords);
            }
        });

        // Update transponuj.html if we're on that page
        const notesInput = document.getElementById('notesInput');
        const transposedOutput = document.getElementById('transposedOutput');
        const transposedNotes = document.getElementById('transposedNotes');
        
        if (notesInput && transposedOutput) {
            const text = notesInput.value.trim();
            if (text) {
                transposedOutput.textContent = this.transposeText(text);
                if (transposedNotes) {
                    transposedNotes.style.display = 'block';
                }
            } else if (transposedNotes) {
                transposedNotes.style.display = 'none';
            }
        }
    }

    transposeText(text) {
        if (!text) return '';
        // Updated regex to match more chord patterns
        const chordPattern = /[A-G][b#]?(?:m|maj|dim|aug|sus[24]|[2-9]|add\d+|\/[A-G][b#]?)*\b/g;
        return text.replace(chordPattern, match => this.transposeChord(match));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.transposer = new ChordTransposer();
});
