import { prisma } from "../config/prisma";

export interface SimilarityMatch {
  songId: string;
  title: string;
  artist: string;
  album: string | null;
  releaseYear: number | null;
  similarity: number;
  confidence: string;
}

export interface SimilarityResult {
  totalSongsCompared: number;
  topMatches: SimilarityMatch[];
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function buildVector(features: {
  tempo?: number | null;
  mfcc?: number[] | null;
  chroma?: number[] | null;
  zeroCrossingRate?: number | null;
  rmsEnergy?: number | null;
}): number[] {
  const vector: number[] = [];

  vector.push((features.tempo ?? 0) / 250.0);

  const mfcc = features.mfcc ?? new Array(13).fill(0);
  const mfccArray = mfcc as number[];
  const mean =
    mfccArray.reduce((a, b) => a + b, 0) / mfccArray.length;
  const std = Math.sqrt(
    mfccArray.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      mfccArray.length
  );
  const normalized =
    std > 0 ? mfccArray.map((x) => (x - mean) / std) : mfccArray;
  vector.push(...normalized);

  const chroma = features.chroma ?? new Array(12).fill(0);
  vector.push(...(chroma as number[]));

  vector.push((features.zeroCrossingRate ?? 0) * 100);
  vector.push((features.rmsEnergy ?? 0) * 10);

  return vector;
}

export async function findSimilarSongsNode(
  uploadId: string,
  topK: number = 5
): Promise<SimilarityResult | null> {
  try {
    // Get features of the uploaded audio
    const uploadFeature = await prisma.audioFeature.findUnique({
      where: { uploadId },
    });

    if (!uploadFeature) {
      console.log("No audio features found for upload:", uploadId);
      return null;
    }

    const queryVector = buildVector({
      tempo: uploadFeature.tempo,
      mfcc: uploadFeature.mfcc as number[],
      chroma: uploadFeature.chroma as number[],
      zeroCrossingRate: uploadFeature.zeroCrossingRate,
      rmsEnergy: uploadFeature.rmsEnergy,
    });

    // Get all dataset songs with features
    const datasetFeatures = await prisma.audioFeature.findMany({
      where: {
        upload: {
          userId: "dataset@elements-ai.internal",
        },
        mfcc: { not: null },
        chroma: { not: null },
      },
      include: {
        upload: {
          include: {
            fingerprint: {
              include: {
                song: true,
              },
            },
          },
        },
      },
    });

    if (datasetFeatures.length === 0) {
      console.log("No dataset features found");
      return null;
    }

    const results: SimilarityMatch[] = [];

    for (const feature of datasetFeatures) {
      const song = feature.upload?.fingerprint?.song;
      if (!song) continue;

      const songVector = buildVector({
        tempo: feature.tempo,
        mfcc: feature.mfcc as number[],
        chroma: feature.chroma as number[],
        zeroCrossingRate: feature.zeroCrossingRate,
        rmsEnergy: feature.rmsEnergy,
      });

      const similarity = cosineSimilarity(queryVector, songVector);

      results.push({
        songId: song.id,
        title: song.title,
        artist: song.artist ?? "",
        album: song.album,
        releaseYear: song.releaseYear,
        similarity: Math.round(similarity * 10000) / 10000,
        confidence: `${Math.round(similarity * 1000) / 10}%`,
      });
    }

    results.sort((a, b) => b.similarity - a.similarity);

    const topMatches = results.slice(0, topK);

    console.log("=================================");
    console.log("Node.js Similarity Results:");
    console.log("Songs compared:", results.length);
    if (topMatches.length > 0) {
      console.log(
        `Best match: ${topMatches[0].artist} - ${topMatches[0].title} (${topMatches[0].confidence})`
      );
    }

    return {
      totalSongsCompared: results.length,
      topMatches,
    };
  } catch (error) {
    console.error("Node similarity engine error:", error);
    return null;
  }
}
