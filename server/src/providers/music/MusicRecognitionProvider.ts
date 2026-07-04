export interface MusicRecognitionResult {
  success: boolean;
  provider: string;

  title?: string;
  artist?: string;
  album?: string;
  confidence?: number;

  rawResponse?: any;
}

export interface MusicRecognitionProvider {
  recognize(audioPath: string): Promise<MusicRecognitionResult>;
}