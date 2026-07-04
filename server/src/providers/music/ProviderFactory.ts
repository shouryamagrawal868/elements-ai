import { AudDProvider } from "./AudDProvider";
import { MusicRecognitionProvider } from "./MusicRecognitionProvider";

export class ProviderFactory {
  static getMusicProvider(): MusicRecognitionProvider {
    // Future:
    // if (process.env.MUSIC_PROVIDER === "ACRCLOUD") {
    //   return new ACRCloudProvider();
    // }

    return new AudDProvider();
  }
}