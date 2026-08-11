import sys
import json
import librosa
import numpy as np
import psycopg2
import warnings
warnings.filterwarnings("ignore")

def extract_features(audio_path):
    y, sr = librosa.load(audio_path, sr=22050, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    tempo = float(np.atleast_1d(tempo)[0])
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = mfcc.mean(axis=1).tolist()
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    chroma_mean = chroma.mean(axis=1).tolist()
    spectral_centroid = float(librosa.feature.spectral_centroid(y=y, sr=sr).mean())
    spectral_bandwidth = float(librosa.feature.spectral_bandwidth(y=y, sr=sr).mean())
    zcr = float(librosa.feature.zero_crossing_rate(y).mean())
    rms = float(librosa.feature.rms(y=y).mean())
    rolloff = float(librosa.feature.spectral_rolloff(y=y, sr=sr).mean())

    return {
        "duration": round(duration, 4),
        "tempo": round(tempo, 4),
        "mfcc": mfcc_mean,
        "chroma": chroma_mean,
        "spectralCentroid": round(spectral_centroid, 4),
        "spectralBandwidth": round(spectral_bandwidth, 4),
        "zeroCrossingRate": round(zcr, 6),
        "rmsEnergy": round(rms, 6),
        "rolloff": round(rolloff, 4),
    }

def build_feature_vector(features):
    vector = []
    # Normalize tempo to 0-1 range (assuming max 250 BPM)
    vector.append(features.get("tempo", 0) / 250.0)
    # MFCC (13 values)
    mfcc = features.get("mfcc", [0] * 13)
    # Normalize MFCC values
    mfcc_array = np.array(mfcc)
    if mfcc_array.std() > 0:
        mfcc_normalized = ((mfcc_array - mfcc_array.mean()) / mfcc_array.std()).tolist()
    else:
        mfcc_normalized = mfcc
    vector.extend(mfcc_normalized)
    # Chroma (12 values) — already 0-1
    vector.extend(features.get("chroma", [0] * 12))
    # Other features normalized
    vector.append(features.get("zeroCrossingRate", 0) * 100)
    vector.append(features.get("rmsEnergy", 0) * 10)
    return np.array(vector, dtype=float)

def cosine_similarity(a, b):
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def find_similar_songs(audio_path, database_url, top_k=5):
    # 1. Extract features from uploaded audio
    print("Extracting features from uploaded audio...", file=sys.stderr)
    query_features = extract_features(audio_path)
    query_vector = build_feature_vector(query_features)

    # 2. Connect to database
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()

    # 3. Fetch all songs with their features
    cur.execute("""
        SELECT
            s.id,
            s.title,
            s.artist,
            s.album,
            s."releaseYear",
            af.tempo,
            af.mfcc,
            af.chroma,
            af."zeroCrossingRate",
            af."rmsEnergy"
        FROM songs s
        JOIN fingerprints f ON f."songId" = s.id
        JOIN uploads u ON u.id = f."uploadId"
        JOIN audio_features af ON af."uploadId" = u.id
        WHERE s.source = 'DATASET'
        AND af.mfcc IS NOT NULL
        AND af.chroma IS NOT NULL
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return {"error": "No songs in dataset yet"}

    # 4. Calculate similarity for each song
    results = []
    for row in rows:
        song_id, title, artist, album, release_year, \
        tempo, mfcc, chroma, zcr, rms = row

        if not mfcc or not chroma:
            continue

        song_features = {
            "tempo": tempo or 0,
            "mfcc": mfcc if isinstance(mfcc, list) else [],
            "chroma": chroma if isinstance(chroma, list) else [],
            "zeroCrossingRate": zcr or 0,
            "rmsEnergy": rms or 0,
        }

        song_vector = build_feature_vector(song_features)
        similarity = cosine_similarity(query_vector, song_vector)

        results.append({
            "songId": song_id,
            "title": title,
            "artist": artist,
            "album": album,
            "releaseYear": release_year,
            "similarity": round(similarity, 4),
            "confidence": f"{round(similarity * 100, 1)}%"
        })

    # 5. Sort by similarity and return top K
    results.sort(key=lambda x: x["similarity"], reverse=True)
    top_results = results[:top_k]

    return {
        "queryFeatures": {
            "tempo": query_features["tempo"],
            "duration": query_features["duration"],
        },
        "totalSongsCompared": len(results),
        "topMatches": top_results
    }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python similarity_engine.py <audio_path> <database_url>"}))
        sys.exit(1)

    audio_path = sys.argv[1]
    database_url = sys.argv[2]

    result = find_similar_songs(audio_path, database_url)
    print(json.dumps(result, indent=2))