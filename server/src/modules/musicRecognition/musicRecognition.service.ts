import {
  MusicRecognitionProvider,
  RecognitionResult,
} from "./types";

class MockMusicRecognitionProvider
  implements MusicRecognitionProvider
{
  async recognize(audioPath: string): Promise<RecognitionResult> {
    console.log("=================================");
    console.log("Recognizing Music...");
    console.log("Audio Path:", audioPath);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      trackTitle: "Believer",
      artist: "Imagine Dragons",
      album: "Evolve",
      genre: "Rock",
      confidence: 0.98,
      coverUrl:
        "https://i.scdn.co/image/ab67616d0000b273e82728b751c9d5b3b8f0c3f3",
      spotifyUrl:
        "https://open.spotify.com/track/0pqnGHJpmpxLKifKRmU6WP",
    };
  }
}

export const musicRecognitionService =
  new MockMusicRecognitionProvider();