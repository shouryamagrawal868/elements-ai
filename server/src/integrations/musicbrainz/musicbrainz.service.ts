import axios from "axios";
import {
  MusicBrainzRecording,
  MusicBrainzResult,
} from "./musicbrainz.types";

class MusicBrainzService {
  private readonly BASE_URL =
    "https://musicbrainz.org/ws/2";

  private readonly HEADERS = {
    "User-Agent":
      "elements-ai/1.0.0 (https://github.com/shouryamagrawal868/elements-ai)",
    Accept: "application/json",
  };

  async getRecording(
    recordingId: string
  ): Promise<MusicBrainzResult> {
    console.log("=================================");
    console.log("MusicBrainz Lookup Starting...");
    console.log("Recording ID:", recordingId);

    try {
      const response =
        await axios.get<MusicBrainzRecording>(
          `${this.BASE_URL}/recording/${recordingId}`,
          {
            headers: this.HEADERS,
            params: {
              inc: "artists+releases+release-groups+tags",
              fmt: "json",
            },
            timeout: 10000,
          }
        );

      const data = response.data;

      const title = data.title;
      const artist =
        data["artist-credit"]?.[0]?.artist?.name;
      const releaseGroup = data["release-groups"]?.[0];
      const album = releaseGroup?.title;
      const releaseDateStr =
        releaseGroup?.["first-release-date"];
      const releaseYear = releaseDateStr
        ? parseInt(releaseDateStr.split("-")[0])
        : undefined;
      const durationMs = data.length;
      const duration = durationMs
        ? Math.round(durationMs / 1000)
        : undefined;
      const tags = data.tags ?? [];
      const genre =
        tags.length > 0
          ? tags.sort((a, b) => b.count - a.count)[0].name
          : undefined;

      console.log("=================================");
      console.log("MusicBrainz Result:");
      console.log("Title:", title);
      console.log("Artist:", artist);
      console.log("Album:", album);
      console.log("Year:", releaseYear);
      console.log("Genre:", genre);
      console.log("=================================");

      return {
        found: true,
        recordingId,
        title,
        artist,
        album,
        releaseYear,
        duration,
        genre,
      };
    } catch (error) {
      console.error("MusicBrainz Lookup Error:", error);
      return { found: false };
    }
  }
}

export const musicBrainzService = new MusicBrainzService();