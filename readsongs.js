// Function to fetch and display song titles from the song-list.json file
async function fetchAndDisplaySongs() {
    try {
        const response = await fetch('song-list.json'); // Zmiana na plik JSON
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const songs = await response.json();
        const songListDiv = document.getElementById('song-list'); // Upewnij się, że ID jest poprawne
        songListDiv.innerHTML = ''; // Clear existing list

        // Populate the song list
        songs.forEach(song => {
            const listItem = document.createElement('div');
            listItem.textContent = song.title; // Display title from JSON
            songListDiv.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

// Initialize the song fetching when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', fetchAndDisplaySongs); 


//Pobieranie Piosenek:
//Skrypt używa funkcji fetchAndDisplaySongs, aby wysłać żądanie do serwera (lub lokalnego pliku JSON) w celu pobrania listy piosenek.
//Po otrzymaniu odpowiedzi, skrypt przetwarza dane JSON i wyświetla tytuły piosenek w elemencie HTML o ID song-list.
//Wyświetlanie Tytułów:
//Tytuły piosenek są dodawane do elementu song-list jako nowe elementy div, co pozwala użytkownikowi na ich przeglądanie.
//Obsługa Błędów:
//Skrypt zawiera mechanizmy obsługi błędów, które logują problemy, jeśli wystąpią podczas pobierania danych.