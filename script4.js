// This file should focus on displaying the song and not handle transposition

// Obsługa wczytywania plików
document.addEventListener('DOMContentLoaded', () => {
    const songList = document.getElementById('song-list');

    // Zdefiniowana lista piosenek
    const songs = [
        {
            title: "Panie ulituj sie nad nami",
            content: `title: Panie ulituj sie nad nami
author: 
tag: O-Bogu, Chwalebna
intro: CeFA
link: https://www.youtube.com/watch?v=YZuFsI-bttM
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
            title: "Przyjacielu",
            content: `Przyjacielu chce zostac z toba 
Przy tobie chce byc 
I nie trzeba 
bys mowil cos Wystarczy zebys byl/x2

Bo nie ma wiekszej milosci niz ta, 
gdy ktos zycie oddaje bym ja mogl zyc...

chce byc z toba
gdy jest mi dobrze i kiedy mi zle 
przyjacielu
przed toba otwieram serce/x2`
        }
    ];

    // Funkcja do wczytywania listy piosenek
    function loadSongsList() {
        // Wyczyść istniejącą listę
        songList.innerHTML = '';

        // Dodaj każdą piosenkę do listy
        songs.forEach(song => {
            const songDiv = document.createElement('div');
            songDiv.className = 'song-item';
            songDiv.textContent = song.title;

            songDiv.addEventListener('click', () => {
                // Zapisz zawartość piosenki do localStorage
                localStorage.setItem('currentSong', song.content);
                // Otwórz nową stronę z tekstem piosenki
                window.open('Lyrics.html', '_blank');
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
        else if (trimmedLine.startsWith('chords:')) break; // Stop parsing at chords
    }

    return metadata;
}

// Sprawdzenie czy jesteśmy na stronie z tekstem piosenki
if (window.location.pathname.includes('Lyrics.html')) {
    const savedSong = localStorage.getItem('currentSong');
    const songDisplay = document.getElementById('songDisplay');
    if (savedSong && songDisplay) {
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