export interface AcoustIdRecording {
  id: string;
  title?: string;
  duration?: number;
  artists?: { id: string; name: string }[];
  releasegroups?: {
    id: string;
    title?: string;
    type?: string;
    releases?: {
      id: string;
      date?: string;
    }[];
  }[];
}

export interface AcoustIdResult {
  id: string;
  score: number;
  recordings?: AcoustIdRecording[];
}

export interface AcoustIdResponse {
  status: string;
  results?: AcoustIdResult[];
}

export interface AcoustIdLookupResult {
  found: boolean;
  recordingId?: string;
  title?: string;
  artist?: string;
  album?: string;
  releaseYear?: number;
  duration?: number;
  score?: number;
}