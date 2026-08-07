import subprocess
import os
import sys

# List of songs to download
# Format: "Artist - Title"
SONGS = [
    "Charlie Puth - Attention",
    "Ed Sheeran - Shape of You",
    "Imagine Dragons - Believer",
    "The Weeknd - Blinding Lights",
    "Dua Lipa - Levitating",
    "Justin Bieber - Stay",
    "Olivia Rodrigo - drivers license",
    "Coldplay - Yellow",
    "Maroon 5 - Sugar",
    "Bruno Mars - Uptown Funk",
    "Post Malone - Sunflower",
    "Billie Eilish - bad guy",
    "Ariana Grande - positions",
    "Harry Styles - Watermelon Sugar",
    "Taylor Swift - Anti-Hero",
    "Arijit Singh - Kesariya",
    "Arijit Singh - Tum Hi Ho",
    "Pritam - Gerua",
    "A R Rahman - Jai Ho",
    "Shreya Ghoshal - Teri Meri",
]

OUTPUT_DIR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "dataset_songs"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)

def download_song(song_name):
    print(f"\nDownloading: {song_name}")
    search_query = f"ytsearch1:{song_name} official audio"

    output_template = os.path.join(
        OUTPUT_DIR,
        f"{song_name}.%(ext)s"
    )

    cmd = [
        "yt-dlp",
        search_query,
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "5",
        "--output", output_template,
        "--no-playlist",
        "--quiet",
        "--no-warnings",
    ]

    try:
        subprocess.run(cmd, check=True, timeout=120)
        print(f"Downloaded: {song_name}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Failed: {song_name} — {e}")
        return False
    except subprocess.TimeoutExpired:
        print(f"Timeout: {song_name}")
        return False

if __name__ == "__main__":
    print(f"Downloading {len(SONGS)} songs to: {OUTPUT_DIR}")
    print("This will take a few minutes...\n")

    success = 0
    failed = 0

    for song in SONGS:
        if download_song(song):
            success += 1
        else:
            failed += 1

    print(f"\nDone! Downloaded: {success}, Failed: {failed}")
    print(f"Songs saved to: {OUTPUT_DIR}")