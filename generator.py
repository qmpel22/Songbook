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
template = env.get_template("song_template.html")

# Lista do przechowywania linków do piosenek na stronie głównej
song_links = []

# Przetwarzanie plików w katalogu songs
for filename in os.listdir(SONGS_DIR):
    if filename.endswith(".txt"):  # Zakładamy, że pliki z tekstami piosenek są w .txt
        song_path = os.path.join(SONGS_DIR, filename)
        
        try:
            with open(song_path, "r", encoding="utf-8") as file:
                lines = file.readlines()
        except Exception as e:
            print(f"Błąd podczas otwierania pliku {filename}: {e}")
            continue
        
        song_data = {}
        chords = []
        lyrics = []
        
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
                continue  # Pomijamy linię "chords:"
            else:
                parts = line.split("//")
                if len(parts) > 1:
                    chords.append(parts[0].strip())
                    lyrics.append(parts[1].strip())
                else:
                    lyrics.append(parts[0].strip())

        # Sprawdzenie, czy "title" istnieje, jeśli nie, ustawiamy domyślny tytuł
        if "title" not in song_data:
            song_data["title"] = "Bez tytułu"  # Domyślny tytuł

        song_data["content"] = "<br>".join(lyrics)
        song_data["chords"] = "<br>".join(chords)
        
        # Renderowanie HTML dla piosenki
        rendered_html = template.render(song=song_data)

        # Zapisanie wygenerowanej strony
        output_path = os.path.join(OUTPUT_DIR, filename.replace(".txt", ".html"))
        
        try:
            with open(output_path, "w", encoding="utf-8") as output_file:
                output_file.write(rendered_html)
            print(f"Wygenerowano: {output_path}")
        except Exception as e:
            print(f"Błąd podczas zapisywania pliku {output_path}: {e}")
        
        # Dodaj link do tej piosenki na stronę główną
        song_links.append({
            "title": song_data["title"],
            "filename": filename.replace(".txt", ".html")
        })

# Teraz zaktualizuj index.html z listą piosenek
index_template = env.get_template("index_template.html")

# Renderowanie strony głównej z listą piosenek
rendered_index_html = index_template.render(song_links=song_links)

# Zapisanie zaktualizowanego index.html w głównym katalogu
try:
    with open(INDEX_FILE, "w", encoding="utf-8") as index_file:
        index_file.write(rendered_index_html)
    print(f"Zaktualizowano index.html")
except Exception as e:
    print(f"Błąd podczas aktualizacji {INDEX_FILE}: {e}")

print("Wszystkie strony i index zostały wygenerowane.")
