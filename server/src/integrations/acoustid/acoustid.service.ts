import axios from "axios";
import { env } from "../../config/env";
import {
  AcoustIdResponse,
  AcoustIdLookupResult,
} from "./acoustid.types";

class AcoustIdIntegration {
  private readonly BASE_URL =
    "https://api.acoustid.org/v2/lookup";

  async lookup(
    fingerprint: string,
    duration: number
  ): Promise<AcoustIdLookupResult> {
    console.log("=================================");
    console.log("AcoustID Lookup Starting...");
    console.log("Duration:", duration);
    console.log("Fingerprint Length:", fingerprint.length);

    try {
      const response = await axios.get<AcoustIdResponse>(
        this.BASE_URL,
        {
          params: {
            client: env.ACOUSTID_API_KEY,
            fingerprint,
            duration: Math.round(duration),
            meta: "recordings+releasegroups+compress",
          },
          timeout: 15000,
        }
      );

      const data = response.data;

      console.log("=================================");
      console.log("AcoustID Response Status:", data.status);

      if (
        data.status !== "ok" ||
        !data.results ||
        data.results.length === 0
      ) {
        console.log("AcoustID: No results found");
        return { found: false };
      }

      // Get the best result (highest score)
      const best = data.results.reduce((a, b) =>
        a.score > b.score ? a : b
      );

      console.log("Best Match Score:", best.score);

      if (best.score < 0.8) {
        console.log("AcoustID: Score too low, skipping");
        return { found: false };
      }

      if (
        !best.recordings ||
        best.recordings.length === 0
      ) {
        console.log("AcoustID: No recordings attached");
        return { found: false };
      }

      const recording = best.recordings[0];

      const title = recording.title;
      const artist = recording.artists?.[0]?.name;
      const album = recording.releasegroups?.[0]?.title;
      const releaseDate =
        recording.releasegroups?.[0]?.releases?.[0]?.date;
      const releaseYear = releaseDate
        ? parseInt(releaseDate.split("-")[0])
        : undefined;

      console.log("=================================");
      console.log("Song Identified!");
      console.log("Title:", title);
      console.log("Artist:", artist);
      console.log("Album:", album);
      console.log("Year:", releaseYear);
      console.log("=================================");

      return {
        found: true,
        recordingId: recording.id,
        title,
        artist,
        album,
        releaseYear,
        duration: recording.duration,
        score: best.score,
      };
    } catch (error) {
      console.error("AcoustID Lookup Error:", error);
      return { found: false };
    }
  }
}

export const acoustIdIntegration =
  new AcoustIdIntegration();