export interface RecognitionResult {
  trackTitle: string | null;
  artist: string | null;
  album: string | null;
  genre?: string | null;
  confidence: number;
  coverUrl?: string |null;
  spotifyUrl?: string | null;
  youtubeUrl?: string | null;
}

export interface MusicRecognitionProvider {
  recognize(audioPath: string): Promise<RecognitionResult>;
}