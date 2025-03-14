// Obsługa wczytywania plików
document.addEventListener('DOMContentLoaded', () => {
    // Funkcja do wczytywania listy piosenek
    function loadSongsList() {
        try {
            const songList = document.getElementById('song-list');
            if (!songList) return;

            // Wyczyść istniejącą listę
            songList.innerHTML = '';

            // Lista piosenek (zdefiniowana lokalnie zamiast wczytywania z pliku)
            const songs = [
                {
                    title: "Panie ulituj sie nad nami",
                    filename: "Panie-ulituj-sie-nad-nami.txt"
                },
                {
                    title: "Tekst akordy",
                    filename: "tekstakordy.txt"
                },
                {
                    title: "Przyjacielu",
                    filename: "tekst2.txt"
                }
            ];

            // Dodaj każdą piosenkę do listy
            songs.forEach(song => {
                const songDiv = document.createElement('div');
                songDiv.className = 'song-item';
                songDiv.textContent = song.title;
                
                songDiv.addEventListener('click', () => {
                    // Stwórz ukryty input typu file
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.style.display = 'none';
                    input.accept = '.txt';
                    
                    input.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const content = e.target.result;
                            localStorage.setItem('currentSong', content);
                            window.location.href = 'Lyrics.html';
                        };
                        reader.readAsText(file);
                    });

                    // Symuluj kliknięcie w input
                    document.body.appendChild(input);
                    input.click();
                    document.body.removeChild(input);
                });
                
                songList.appendChild(songDiv);
            });

            // Dodaj obsługę wyszukiwania
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase().trim();
                    const songItems = songList.querySelectorAll('.song-item');
                    
                    songItems.forEach(item => {
                        const title = item.textContent.toLowerCase();
                        item.style.display = title.includes(query) ? 'block' : 'none';
                    });
                });
            }
        } catch (error) {
            console.error('Error loading songs list:', error);
            const songList = document.getElementById('song-list');
            if (songList) {
                songList.innerHTML = '<div class="error-message">Nie udało się załadować listy piosenek.</div>';
            }
        }
    }

    // Wczytaj listę piosenek przy starcie
    loadSongsList();
});

// Funkcja do parsowania metadanych
function parseMetadata(content) {
    const lines = content.split('\n');
    const metadata = {
        title: '',
        author: '',
        tag: '',
        intro: '',
        link: ''
    };

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('title:')) metadata.title = trimmedLine.substring(6).trim();
        else if (trimmedLine.startsWith('author:')) metadata.author = trimmedLine.substring(7).trim();
        else if (trimmedLine.startsWith('tag:')) metadata.tag = trimmedLine.substring(4).trim();
        else if (trimmedLine.startsWith('intro:')) metadata.intro = trimmedLine.substring(6).trim();
        else if (trimmedLine.startsWith('link:')) metadata.link = trimmedLine.substring(5).trim();
        else if (trimmedLine.startsWith('chords:')) break;
    }

    return metadata;
}

// Sprawdzenie czy jesteśmy na stronie z tekstem piosenki
if (window.location.pathname.includes('Lyrics.html')) {
    const savedSong = localStorage.getItem('currentSong');
    if (savedSong) {
        const songDisplay = document.getElementById('songDisplay');
        if (songDisplay) {
            const metadata = parseMetadata(savedSong);
            let html = `
                <div class="song-metadata">
                    <h2>${metadata.title}</h2>
                    ${metadata.author ? `<p class="author">Autor: ${metadata.author}</p>` : ''}
                    ${metadata.tag ? `<p class="tags">Tagi: ${metadata.tag}</p>` : ''}
                    ${metadata.intro ? `<p class="intro">Intro: <span class="chords" data-original="${metadata.intro}">${metadata.intro}</span></p>` : ''}
                    ${metadata.link ? `<p class="youtube-link"><a href="${metadata.link}" target="_blank">Posłuchaj na YouTube</a></p>` : ''}
                </div>
            `;

            // Dodaj treść piosenki
            const contentStartIndex = savedSong.indexOf('chords:') + 7;
            const songContent = savedSong.substring(contentStartIndex)
                .split('\n')
                .filter(line => line.trim())
                .map(line => processLine(line))
                .join('');

            html += songContent;
            songDisplay.innerHTML = html;

            // Aktualizuj transpozycję jeśli dostępna
            if (window.transposer) {
                window.transposer.updateTransposition();
            }
        }
    }
}

// Funkcja do przetwarzania linii tekstu
function processLine(line) {
    const toggleFormat = document.getElementById('toggleFormat');
    if (!line.trim()) return '';

    if (line.includes('//')) {
        const [chordsSection, lyricsSection] = line.split('//').map(part => part.trim());
        
        if (toggleFormat && toggleFormat.checked) {
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
        return `<div class="song-line ${toggleFormat && toggleFormat.checked ? 'vertical' : 'horizontal'}">
                    <div class="lyrics">${line.trim()}</div>
                </div>`;
    }
} 