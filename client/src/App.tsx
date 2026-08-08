import { useState, useCallback } from 'react'
import { Upload, Music, Loader2, CheckCircle, XCircle, Database } from 'lucide-react'
import { recognizeMusic } from './services/api'

interface Match {
  songId: string
  title: string
  artist: string
  album: string | null
  releaseYear: number | null
  similarity: number
  confidence: string
}

interface RecognitionResult {
  success: boolean
  found: boolean
  bestMatch?: {
    title: string
    artist: string
    album: string | null
    releaseYear: number | null
    confidence: string
    similarity: number
  }
  allMatches?: Match[]
  totalSongsCompared?: number
  queryFeatures?: {
    tempo: number
    duration: number
  }
}

type Status = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export default function App() {
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<RecognitionResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string>('')

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name)
    setStatus('uploading')
    setResult(null)

    try {
      setStatus('processing')
      const data = await recognizeMusic(file)
      setResult(data)
      setStatus('done')
    } catch (err) {
      setStatus('error')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const reset = () => {
    setStatus('idle')
    setResult(null)
    setFileName('')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className="w-6 h-6 text-violet-400" />
            <span className="text-xl font-semibold tracking-tight">elements.ai</span>
          </div>
          <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            Phase 1 — BGM Recognition
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            What's that{' '}
            <span className="text-violet-400">music?</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Upload any video or audio clip. Our AI identifies the background music in seconds — no Shazam, no paid APIs.
          </p>
        </div>

        {/* Upload Area */}
        {status === 'idle' && (
          <label
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            className={`block border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-violet-400 bg-violet-400/5'
                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            }`}
          >
            <input
              type="file"
              className="hidden"
              accept="video/*,audio/*,.mp3,.mp4,.wav,.mov"
              onChange={handleInputChange}
            />
            <Upload className="w-12 h-12 mx-auto mb-4 text-white/30" />
            <p className="text-white/70 text-lg mb-2">
              Drop your video or audio here
            </p>
            <p className="text-white/30 text-sm">
              MP4, MOV, MP3, WAV supported
            </p>
          </label>
        )}

        {/* Processing */}
        {(status === 'uploading' || status === 'processing') && (
          <div className="border border-white/10 rounded-2xl p-16 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-violet-400 animate-spin" />
            <p className="text-white/70 text-lg mb-2">
              {status === 'uploading' ? 'Uploading...' : 'AI is analyzing the audio...'}
            </p>
            <p className="text-white/30 text-sm">{fileName}</p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-12 text-center">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-white/70 text-lg mb-6">Recognition failed. Please try again.</p>
            <button onClick={reset} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg text-sm transition-colors">
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {status === 'done' && result && (
          <div className="space-y-6">
            {result.found && result.bestMatch ? (
              <>
                {/* Best Match Card */}
                <div className="border border-violet-500/30 bg-violet-500/5 rounded-2xl p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-2 text-violet-400 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Music identified
                    </div>
                    <span className="text-2xl font-bold text-violet-400">
                      {result.bestMatch.confidence}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-1">
                    {result.bestMatch.title}
                  </h2>
                  <p className="text-white/60 text-xl mb-6">
                    {result.bestMatch.artist}
                  </p>
                  <div className="flex gap-4 text-sm text-white/40">
                    {result.bestMatch.album && (
                      <span>Album: {result.bestMatch.album}</span>
                    )}
                    {result.bestMatch.releaseYear && (
                      <span>Year: {result.bestMatch.releaseYear}</span>
                    )}
                    {result.queryFeatures && (
                      <span>Tempo: {result.queryFeatures.tempo.toFixed(1)} BPM</span>
                    )}
                  </div>
                </div>

                {/* All Matches */}
                {result.allMatches && result.allMatches.length > 1 && (
                  <div className="border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4 text-white/40 text-sm">
                      <Database className="w-4 h-4" />
                      All matches — {result.totalSongsCompared} songs compared
                    </div>
                    <div className="space-y-3">
                      {result.allMatches.map((match, i) => (
                        <div key={match.songId} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-white/20 text-sm w-4">{i + 1}</span>
                            <div>
                              <p className="text-sm font-medium">{match.title}</p>
                              <p className="text-xs text-white/40">{match.artist}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-white/70">{match.confidence}</p>
                            <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-violet-400 rounded-full"
                                style={{ width: `${match.similarity * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="border border-white/10 rounded-2xl p-12 text-center">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-white/30" />
                <p className="text-white/70 text-lg mb-2">No match found</p>
                <p className="text-white/30 text-sm mb-6">
                  This song isn't in the dataset yet
                </p>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full border border-white/10 hover:bg-white/5 rounded-xl py-3 text-sm text-white/50 transition-colors"
            >
              Try another file
            </button>
          </div>
        )}
      </main>
    </div>
  )
}