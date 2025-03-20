document.addEventListener('DOMContentLoaded', function() {
    const notesInput = document.getElementById('notesInput');
    const transposedOutput = document.getElementById('transposedOutput');
    const transposeButtons = document.querySelectorAll('.transpose-btn');

    transposeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const transposeValue = parseInt(this.getAttribute('data-value'));
            const originalNotes = notesInput.value.split(/\s+/);
            const transposedNotes = originalNotes.map(note => transposeChord(note, transposeValue));
            transposedOutput.textContent = transposedNotes.join(' ');
        });
    });

    function transposeChord(note, semitones) {
        const noteMap = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
        };
        const reverseNoteMap = Object.keys(noteMap);
        
        const noteUpper = note.toUpperCase();
        if (noteMap[noteUpper] !== undefined) {
            const transposedIndex = (noteMap[noteUpper] + semitones + 12) % 12;
            return reverseNoteMap[transposedIndex];
        }
        return note; // Return the original note if it's not found
    }
}); 