document.getElementById('generateSongPageBtn').addEventListener('click', function() {
    // Define the content for the new song page
    const songContent = `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Śpiewnik Online - Tekst i Akordy</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="style-lyrics.css">
    <script src="script5.js" defer></script>
    <script src="script.js" defer></script>
    <script src="script2.js" defer></script>
    <script src="transposeLyrics.js" defer></script>
</head>
<body>
    <div class="header-container">
        <h1 id="song-title"></h1>
        <nav class="nav-menu">
            <a href="index.html">Strona Główna</a>
            <a href="Lyrics.html" class="active">Piosenki</a>
            <a href="transponuj.html">Transponowanie</a>
        </nav>
    </div>

    <div class="search-container">
        <input type="text" id="searchInput" placeholder="Szukaj piosenki...">
        <div id="searchResults" class="search-results"></div>
    </div>
    
    <input type="file" id="fileInput" accept=".txt">
    <label for="toggleFormat">
        <input type="checkbox" id="toggleFormat">
        Zmień format wyświetlania
    </label>

    <div id="songDisplay" class="song-container"></div>
    <div id="song-lyrics" class="song-lyrics"></div>

    <!-- Transpose Section -->
    <div class="transpose-container">
        <label>Transponuj akordy:</label>
        <div class="transpose-buttons">
            <button class="transpose-btn" data-value="-6">-6</button>
            <button class="transpose-btn" data-value="-5">-5</button>
            <button class="transpose-btn" data-value="-4">-4</button>
            <button class="transpose-btn" data-value="-3">-3</button>
            <button class="transpose-btn" data-value="-2">-2</button>
            <button class="transpose-btn" data-value="-1">-1</button>
            <button class="transpose-btn active" data-value="0">0</button>
            <button class="transpose-btn" data-value="1">+1</button>
            <button class="transpose-btn" data-value="2">+2</button>
            <button class="transpose-btn" data-value="3">+3</button>
            <button class="transpose-btn" data-value="4">+4</button>
            <button class="transpose-btn" data-value="5">+5</button>
        </div>
    </div>

    <div id="transposition-info" class="transposition-info"></div>
</body>
</html>
    `;

    // Create a Blob from the song content
    const blob = new Blob([songContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob); // Create a URL for the Blob

    // Open the new song page in a new tab
    window.open(url, '_blank'); // Open the Blob URL in a new tab
}); 