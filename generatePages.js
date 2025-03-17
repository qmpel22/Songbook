const fs = require('fs');
const path = require('path');

// Function to create an HTML page based on the song title
function createHtmlPage(songTitle) {
    const templateContent = `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${songTitle} - Śpiewnik Online</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="style-lyrics.css">
    <script src="script5.js" defer></script>
    <script src="script.js" defer></script>
    <script src="script2.js" defer></script>
</head>
<body>
    <div class="header-container">
        <h1>${songTitle}</h1>
        <nav class="nav-menu">
            <a href="index.html">Strona Główna</a>
            <a href="Lyrics.html">Piosenki</a>
            <a href="transponuj.html">Transponowanie</a>
        </nav>
    </div>
    <div class="song-container">
        <p>This is the content for ${songTitle}.</p>
    </div>
</body>
</html>
    `.trim();

    const fileName = `${songTitle.replace(/\s+/g, '-')}.html`; // Replace spaces with dashes for the filename
    const filePath = path.join(__dirname, fileName);
    fs.writeFileSync(filePath, templateContent, 'utf8');
    console.log(`Created: ${fileName}`);
}

// Get the song title from command line arguments
const songTitle = process.argv[2]; // e.g., node generateEmptyPages.js "Panie ulituj sie nad nami"
if (songTitle) {
    createHtmlPage(songTitle);
} else {
    console.error('Please provide a song title.');
} 