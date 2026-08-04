export interface DatasetUploadInput {
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  releaseYear?: number;
  language?: string;
}

export interface DatasetUploadResult {
  success: boolean;
  songId: string;
  title: string;
  artist: string;
  fingerprintGenerated: boolean;
  message: string;
}