// Obsługa wczytywania plików
document.addEventListener('DOMContentLoaded', () => {
    // Stała zawierająca dane piosenek
    const SONGS_DATA = [
        {
            filename: 'Panie-ulituj-sie-nad-nami.txt',
            content: `title: Panie-ulituj-sie-nad-nami
author:
tag: O-Bogu,Chwalebna
intro: C e F A
link:https://www.youtube.com/watch?v=YZuFsI-bttM
chords:
C                      e//
Panie ulituj sie nad nami
      F              a//
bo w tobie nasze ocalenie
    F                   e//
wyciagnij reke nad chorymi
F               G//
uzdrow nasze serca`
        },
        {
            filename: 'tekst2.txt',
            content: `title: Przyjacielu
author: Nieznany
tag: przyjaźń
intro: D G A
chords:
D                G//
Przyjacielu chce zostac z toba 
A                D//
Przy tobie chce byc 
G                D//
I nie trzeba 
A                D//
bys mowil cos Wystarczy zebys byl

Bo nie ma wiekszej milosci niz ta, 
gdy ktos zycie oddaje bym ja mogl zyc...

chce byc z toba
gdy jest mi dobrze i kiedy mi zle 
przyjacielu
przed toba otwieram serce`
        }
    ];

    // Funkcja do wczytywania listy piosenek
    function loadSongsList() {
        try {
            const songList = document.getElementById('song-list');
            if (!songList) return;

            // Wyczyść istniejącą listę
            songList.innerHTML = '';

            // Dodaj każdą piosenkę do listy
            SONGS_DATA.forEach(song => {
                const songDiv = createSongElement(song.content, song.filename);
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

    // Funkcja do tworzenia elementu piosenki
    function createSongElement(content, filename) {
        const songDiv = document.createElement('div');
        songDiv.className = 'song-item';
        
        // Parsuj metadane
        const lines = content.split('\n');
        let title = filename.replace('.txt', '').replace(/-/g, ' ');
        
        // Szukaj tytułu w zawartości pliku
        for (const line of lines) {
            if (line.startsWith('title:')) {
                title = line.substring(6).trim().replace(/-/g, ' ');
                break;
            }
        }
        
        songDiv.textContent = title;
        
        songDiv.addEventListener('click', () => {
            localStorage.setItem('currentSong', content);
            window.open('Lyrics.html', '_blank');
        });
        
        return songDiv;
    }

    // Funkcja do zapisywania piosenki w localStorage
    function saveSongToLocalStorage(filename, content) {
        const songs = JSON.parse(localStorage.getItem('savedSongs') || '{}');
        songs[filename] = content;
        localStorage.setItem('savedSongs', JSON.stringify(songs));
    }

    // Funkcja do wczytywania zapisanych piosenek
    function loadSavedSongs(songList) {
        const songs = JSON.parse(localStorage.getItem('savedSongs') || '{}');
        for (const [filename, content] of Object.entries(songs)) {
            const songDiv = createSongElement(content, filename);
            songList.appendChild(songDiv);
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