import ffmpeg from "fluent-ffmpeg";

export interface AudioFeatures {
  duration: number;
  sampleRate: number;
  channels: number;
  bitrate: number;
}

export class FeatureExtractor {
  async extract(audioPath: string): Promise<AudioFeatures> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (error, metadata) => {
        if (error) {
          return reject(error);
        }

        const stream = metadata.streams.find(
          (stream) => stream.codec_type === "audio"
        );

        if (!stream) {
          return reject(new Error("Audio stream not found."));
        }

        resolve({
          duration: Number(metadata.format.duration || 0),
          sampleRate: Number(stream.sample_rate || 0),
          channels: Number(stream.channels || 0),
          bitrate: Number(metadata.format.bit_rate || 0),
        });
      });
    });
  }
}

export const featureExtractor = new FeatureExtractor();