import os
from jinja2 import Environment, FileSystemLoader

# Ścieżki
SONGS_DIR = "songs"
TEMPLATE_DIR = "templates"
OUTPUT_DIR = "output"
INDEX_FILE = "index.html"  # Teraz zapisujemy index.html w głównym katalogu

# Upewnij się, że katalog output istnieje
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Załaduj szablon Jinja2
env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
song_template = env.get_template("song_template.html")
index_template = env.get_template("index_template.html")

# Słownik do przechowywania piosenek po tagach
tags = {}

# Lista do przechowywania linków do piosenek na stronie głównej
song_links = []

# Przetwarzanie plików w katalogu songs
for filename in os.listdir(SONGS_DIR):
    if filename.endswith(".txt"):
        song_path = os.path.join(SONGS_DIR, filename)
        
        try:
            with open(song_path, "r", encoding="utf-8") as file:
                lines = file.readlines()
        except Exception as e:
            print(f"Błąd podczas otwierania pliku {filename}: {e}")
            continue
        
        song_data = {}
        chords_list = []
        lyrics_list = []
        
        for line in lines:
            if line.startswith("title:"):
                song_data["title"] = line.replace("title:", "").strip()
            elif line.startswith("author:"):
                song_data["author"] = line.replace("author:", "").strip()
            elif line.startswith("tag:"):
                song_data["tag"] = line.replace("tag:", "").strip()
            elif line.startswith("intro:"):
                song_data["intro"] = line.replace("intro:", "").strip()
            elif line.startswith("link:"):
                song_data["link"] = line.replace("link:", "").strip()
            elif line.startswith("chords:"):
                continue
            else:
                parts = line.split("//")
                if len(parts) > 1:
                    chords = parts[0].strip()
                    lyrics = parts[1].strip()
                    chords_list.append(chords)
                    lyrics_list.append(lyrics)
                else:
                    lyrics_list.append(parts[0].strip())

        if "title" not in song_data:
            song_data["title"] = "Bez tytułu"
        
        song_data["content"] = "<br>".join(lyrics_list)
        song_data["chords"] = "<br>".join(chords_list)

        # Dodajemy piosenkę do słownika według tagu
        tag = song_data["tag"]
        if tag not in tags:
            tags[tag] = []
        tags[tag].append(song_data)

        # Renderowanie HTML dla piosenki
        related_songs = []  # Inicjalizacja listy powiązanych piosenek
        for t in tags.values():
            # Dodajemy piosenki z innych tagów, ale z tym samym tagiem
            related_songs.extend([s for s in t if s["title"] != song_data["title"]])  
        related_songs = related_songs[:3]  # Maksymalnie 3 powiązane piosenki
        
        # Renderowanie strony piosenki
        rendered_html = song_template.render(song=song_data, related_songs=related_songs, song_links=song_links)

        output_filename = song_data["title"].replace(" ", "-").replace(",", "").replace(":", "").replace("ł", "l") + ".html"
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        
        try:
            with open(output_path, "w", encoding="utf-8") as output_file:
                output_file.write(rendered_html)
            print(f"Wygenerowano: {output_path}")
        except Exception as e:
            print(f"Błąd podczas zapisywania pliku {output_path}: {e}")
        
        # Dodaj link do tej piosenki na stronę główną
        song_links.append({
            "title": song_data["title"],
            "filename": output_filename  # Zmieniamy to na nazwę wygenerowanego pliku
        })

# Teraz zaktualizuj index.html z listą piosenek
rendered_index_html = index_template.render(song_links=song_links)

# Zapisanie zaktualizowanego index.html w głównym katalogu
try:
    with open(INDEX_FILE, "w", encoding="utf-8") as index_file:
        index_file.write(rendered_index_html)
    print(f"Zaktualizowano index.html")
except Exception as e:
    print(f"Błąd podczas aktualizacji {INDEX_FILE}: {e}")

print("Wszystkie strony i index zostały wygenerowane.")
