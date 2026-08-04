export interface MusicBrainzArtist {
  id: string;
  name: string;
}

export interface MusicBrainzArtistCredit {
  artist: MusicBrainzArtist;
}

export interface MusicBrainzReleaseGroup {
  id: string;
  title: string;
  "first-release-date"?: string;
}

export interface MusicBrainzTag {
  count: number;
  name: string;
}

export interface MusicBrainzRecording {
  id: string;
  title: string;

  length?: number;

  "artist-credit"?: MusicBrainzArtistCredit[];

  "release-groups"?: MusicBrainzReleaseGroup[];

  tags?: MusicBrainzTag[];
}

export interface MusicBrainzResult {
  found: boolean;

  recordingId?: string;

  title?: string;
  artist?: string;
  album?: string;

  releaseYear?: number;
  duration?: number;
  genre?: string;
}