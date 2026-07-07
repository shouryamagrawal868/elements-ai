export interface MediaProcessingResult {
  audioPath: string;
  thumbnailPath: string;
  recognition?: {
    title?: string;
    artist?: string;
    album?: string;
    confidence?: number;
    provider?: string;
  };
}