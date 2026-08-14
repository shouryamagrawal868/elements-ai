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

  // Tempo
  vector.push((features.tempo ?? 0) / 250.0);

  // MFCC - 13 coefficients
  const mfcc = features.mfcc ?? new Array(13).fill(0);

  const mfccArray = Array.isArray(mfcc)
    ? mfcc
    : new Array(13).fill(0);

  const mean =
    mfccArray.length > 0
      ? mfccArray.reduce((a, b) => a + b, 0) /
        mfccArray.length
      : 0;

  const std =
    mfccArray.length > 0
      ? Math.sqrt(
          mfccArray.reduce(
            (sum, value) =>
              sum + Math.pow(value - mean, 2),
            0
          ) / mfccArray.length
        )
      : 0;

  const normalizedMFCC =
    std > 0
      ? mfccArray.map(
          (value) => (value - mean) / std
        )
      : mfccArray;

  vector.push(...normalizedMFCC);

  // Chroma - 12 values
  const chroma = features.chroma ?? new Array(12).fill(0);

  const chromaArray = Array.isArray(chroma)
    ? chroma
    : new Array(12).fill(0);

  vector.push(...chromaArray);

  // Zero crossing rate
  vector.push(
    (features.zeroCrossingRate ?? 0) * 100
  );

  // RMS energy
  vector.push(
    (features.rmsEnergy ?? 0) * 10
  );

  return vector;
}

function getConfidence(similarity: number): string {
  const percentage = Math.max(
    0,
    Math.min(100, similarity * 100)
  );

  return `${percentage.toFixed(2)}%`;
}

export async function findSimilarSongsNode(
  uploadId: string,
  topK: number = 5
): Promise<SimilarityResult | null> {
  try {
    console.log("=================================");
    console.log("Node.js Similarity Engine");
    console.log("Upload ID:", uploadId);

    // --------------------------------------------------
    // 1. Get features of uploaded audio
    // --------------------------------------------------

    const uploadFeature =
      await prisma.audioFeature.findUnique({
        where: {
          uploadId,
        },
      });

    if (!uploadFeature) {
      console.log(
        "No audio features found for upload:",
        uploadId
      );

      return null;
    }

    // --------------------------------------------------
    // 2. Build query feature vector
    // --------------------------------------------------

    const queryVector = buildVector({
      tempo: uploadFeature.tempo,
      mfcc: Array.isArray(uploadFeature.mfcc)
        ? (uploadFeature.mfcc as number[])
        : null,
      chroma: Array.isArray(uploadFeature.chroma)
        ? (uploadFeature.chroma as number[])
        : null,
      zeroCrossingRate:
        uploadFeature.zeroCrossingRate,
      rmsEnergy:
        uploadFeature.rmsEnergy,
    });

    console.log(
      "Query vector length:",
      queryVector.length
    );

    // --------------------------------------------------
    // 3. Find dataset system user
    // --------------------------------------------------

    const systemUser =
      await prisma.user.findUnique({
        where: {
          email: "dataset@elements-ai.internal",
        },
      });

    if (!systemUser) {
      console.log(
        "Dataset system user not found"
      );

      return null;
    }

    // --------------------------------------------------
    // 4. Load dataset songs
    // --------------------------------------------------

    const datasetUploads =
      await prisma.upload.findMany({
        where: {
          userId: systemUser.id,
        },
        include: {
          audioFeature: true,
          fingerprint: {
            include: {
              song: true,
            },
          },
        },
      });

    console.log(
      "Dataset uploads found:",
      datasetUploads.length
    );

    if (datasetUploads.length === 0) {
      console.log(
        "No dataset songs found"
      );

      return {
        totalSongsCompared: 0,
        topMatches: [],
      };
    }

    // --------------------------------------------------
    // 5. Compare query against every dataset song
    // --------------------------------------------------

    const matches: SimilarityMatch[] = [];

    for (const datasetUpload of datasetUploads) {
      const feature =
        datasetUpload.audioFeature;

      const song =
        datasetUpload.fingerprint?.song;

      if (!feature || !song) {
        continue;
      }

      // Skip songs that do not have rich ML features
      if (
        !feature.mfcc ||
        !feature.chroma
      ) {
        continue;
      }

      const datasetVector =
        buildVector({
          tempo: feature.tempo,
          mfcc: Array.isArray(feature.mfcc)
            ? (feature.mfcc as number[])
            : null,
          chroma: Array.isArray(feature.chroma)
            ? (feature.chroma as number[])
            : null,
          zeroCrossingRate:
            feature.zeroCrossingRate,
          rmsEnergy:
            feature.rmsEnergy,
        });

      const similarity =
        cosineSimilarity(
          queryVector,
          datasetVector
        );

      console.log(
        `Song: ${song.title} | Similarity: ${similarity.toFixed(
          4
        )}`
      );

      matches.push({
        songId: song.id,
        title: song.title,
        artist: song.artist ?? "Unknown Artist",
        album: song.album ?? null,
        releaseYear:
          song.releaseYear ?? null,
        similarity,
        confidence:
          getConfidence(similarity),
      });
    }

    // --------------------------------------------------
    // 6. Sort by highest similarity
    // --------------------------------------------------

    matches.sort(
      (a, b) =>
        b.similarity - a.similarity
    );

    // --------------------------------------------------
    // 7. Return top matches
    // --------------------------------------------------

    const topMatches =
      matches.slice(0, topK);

    console.log(
      "================================="
    );
    console.log(
      "Songs Compared:",
      matches.length
    );
    console.log(
      "Top Match:",
      topMatches[0]?.title ??
        "No match"
    );
    console.log(
      "Top Similarity:",
      topMatches[0]
        ? topMatches[0].similarity.toFixed(4)
        : "N/A"
    );
    console.log(
      "================================="
    );

    return {
      totalSongsCompared:
        matches.length,
      topMatches,
    };
  } catch (error) {
    console.error(
      "Node.js Similarity Engine Error:",
      error
    );

    throw error;
  }
}