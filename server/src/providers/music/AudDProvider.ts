import axios from "axios";
import FormData from "form-data";
import fs from "fs";

import {
  MusicRecognitionProvider,
  MusicRecognitionResult,
} from "./MusicRecognitionProvider";

export class AudDProvider implements MusicRecognitionProvider {
  async recognize(audioPath: string): Promise<MusicRecognitionResult> {
    const form = new FormData();

    form.append("api_token", process.env.AUDD_API_TOKEN!);
    form.append("file", fs.createReadStream(audioPath));
    form.append("return", "apple_music,spotify");

    try {
      const response = await axios.post(
        "https://api.audd.io/",
        form,
        {
          headers: form.getHeaders(),
        }
      );

      const data = response.data;

      // AudD returned an API error
      if (data.status === "error") {
        return {
          success: false,
          provider: "AudD",
          rawResponse: data,
        };
      }

      return {
        success: true,
        provider: "AudD",

        title: data.result?.title,
        artist: data.result?.artist,
        album: data.result?.album,

        confidence: data.result?.score,

        rawResponse: data,
      };
    } catch (error: any) {
      console.error("AudD Provider Error:", error.response?.data || error.message);

      return {
        success: false,
        provider: "AudD",
        rawResponse: error.response?.data || error.message,
      };
    }
  }
}