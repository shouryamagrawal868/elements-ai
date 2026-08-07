-- AlterTable
ALTER TABLE "audio_features" ADD COLUMN     "chroma" JSONB,
ADD COLUMN     "mfcc" JSONB,
ADD COLUMN     "rmsEnergy" DOUBLE PRECISION,
ADD COLUMN     "rolloff" DOUBLE PRECISION,
ADD COLUMN     "spectralBandwidth" DOUBLE PRECISION,
ADD COLUMN     "spectralCentroid" DOUBLE PRECISION,
ADD COLUMN     "tempo" DOUBLE PRECISION,
ADD COLUMN     "zeroCrossingRate" DOUBLE PRECISION,
ALTER COLUMN "channels" DROP NOT NULL,
ALTER COLUMN "bitrate" DROP NOT NULL;
