import sys
import json
import librosa
import numpy as np
import warnings
warnings.filterwarnings("ignore")

def extract_features(audio_path):
    y, sr = librosa.load(audio_path, sr=22050, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)

    # Tempo (BPM)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    tempo = float(np.atleast_1d(tempo)[0])
                  
    # MFCC (13 coefficients)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = mfcc.mean(axis=1).tolist()

    # Chroma
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    chroma_mean = chroma.mean(axis=1).tolist()

    # Spectral Centroid
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    spectral_centroid_mean = float(spectral_centroid.mean())

    # Spectral Bandwidth
    spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    spectral_bandwidth_mean = float(spectral_bandwidth.mean())

    # Zero Crossing Rate
    zcr = librosa.feature.zero_crossing_rate(y)
    zcr_mean = float(zcr.mean())

    # RMS Energy
    rms = librosa.feature.rms(y=y)
    rms_mean = float(rms.mean())

    # Rolloff
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    rolloff_mean = float(rolloff.mean())

    result = {
        "duration": round(duration, 4),
        "tempo": round(tempo, 4),
        "mfcc": [round(x, 6) for x in mfcc_mean],
        "chroma": [round(x, 6) for x in chroma_mean],
        "spectralCentroid": round(spectral_centroid_mean, 4),
        "spectralBandwidth": round(spectral_bandwidth_mean, 4),
        "zeroCrossingRate": round(zcr_mean, 6),
        "rmsEnergy": round(rms_mean, 6),
        "rolloff": round(rolloff_mean, 4),
        "sampleRate": sr
    }

    print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file path provided"}))
        sys.exit(1)

    audio_path = sys.argv[1]
    extract_features(audio_path)