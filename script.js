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
        this.initializeElements();
        this.init();
    }

    initializeElements() {
        // Cache DOM elements for reuse
        this.transposeButtons = document.querySelectorAll('.transpose-btn[data-value]');
        this.notesInput = document.getElementById('notesInput');
        this.transposedOutput = document.getElementById('transposedOutput');
        this.transposedNotes = document.getElementById('transposedNotes');
    }

    init() {
        this.initTransposeButtons();
        this.initNotationToggle();
        this.initNotesInput();
    }

    initTransposeButtons() {
        this.transposeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.currentTransposition = parseInt(button.dataset.value);
                this.updateActiveButton(button);
                this.updateTransposition();
            });
        });
    }

    updateActiveButton(activeButton) {
        this.transposeButtons.forEach(button => button.classList.remove('active'));
        activeButton.classList.add('active');
    }

    initNotationToggle() {
        if (!document.querySelector('.notation-toggle')) {
            const notationToggle = this.createNotationToggleButton();
            document.querySelector('.transpose-buttons').appendChild(notationToggle);
            notationToggle.addEventListener('click', () => {
                this.toggleNotation(notationToggle);
                this.updateTransposition();
            });
        }
    }

    createNotationToggleButton() {
        const button = document.createElement('button');
        button.textContent = 'Użyj ♭';
        button.className = 'transpose-btn notation-toggle';
        button.style.marginLeft = '10px';
        return button;
    }

    toggleNotation(notationToggle) {
        this.useFlats = !this.useFlats;
        notationToggle.textContent = this.useFlats ? 'Użyj #' : 'Użyj ♭';
    }

    initNotesInput() {
        if (this.notesInput) {
            this.notesInput.addEventListener('input', () => this.updateTransposition());
        }
    }

    transposeChord(chord) {
        if (!chord.trim()) return chord;

        const match = chord.match(this.CHORD_REGEX);
        if (!match) return chord;

        const [, root, suffix] = match;
        const notes = this.useFlats ? this.NOTES.FLAT : this.NOTES.SHARP;
        const normalizedRoot = this.normalizeNote(root);
        const noteIndex = this.NOTES.SHARP.indexOf(normalizedRoot);

        if (noteIndex === -1) return chord;

        let newIndex = (noteIndex + this.currentTransposition) % 12;
        if (newIndex < 0) newIndex += 12;

        return notes[newIndex] + suffix;
    }

    normalizeNote(note) {
        const flatToSharp = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
        return flatToSharp[note] || note;
    }

    updateTransposition() {
        this.updateChordElements();
        this.updateInputField();
    }

    updateChordElements() {
        document.querySelectorAll('.chords').forEach(element => {
            const originalChords = element.dataset.original;
            if (originalChords) {
                element.textContent = this.transposeText(originalChords);
            }
        });
    }

    updateInputField() {
        if (this.notesInput && this.transposedOutput) {
            const text = this.notesInput.value.trim();
            if (text) {
                this.transposedOutput.textContent = this.transposeText(text);
                this.toggleTransposedNotesVisibility(true);
            } else {
                this.toggleTransposedNotesVisibility(false);
            }
        }
    }

    toggleTransposedNotesVisibility(isVisible) {
        if (this.transposedNotes) {
            this.transposedNotes.style.display = isVisible ? 'block' : 'none';
        }
    }

    transposeText(text) {
        if (!text) return '';
        const chordPattern = /[A-G][b#]?(?:m|maj|dim|aug|sus[24]|[2-9]|add\d+|\/[A-G][b#]?)*\b/g;
        return text.replace(chordPattern, match => this.transposeChord(match));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.transposer = new ChordTransposer();
});
