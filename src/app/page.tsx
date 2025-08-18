'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Play, Download, RefreshCw, Mic, Video, Sparkles } from 'lucide-react'

interface Scene {
  title: string
  description: string
  dialogue: string
  visualDescription: string
}

interface GeneratedScript {
  scenes: Scene[]
  totalScenes: number
}

interface VideoResult {
  sceneIndex: number
  videoUrl: string
  status: 'generating' | 'completed' | 'failed'
  prompt: string
}

export default function PodcastSceneGenerator() {
  const [prompt, setPrompt] = useState('')
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false)
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null)
  const [videos, setVideos] = useState<VideoResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [scriptProgress, setScriptProgress] = useState(0)
  const [videoProgress, setVideoProgress] = useState(0)

  const generateScript = async () => {
    if (!prompt.trim()) return

    setIsGeneratingScript(true)
    setError(null)
    setScriptProgress(0)
    setGeneratedScript(null)
    setVideos([])

    try {
      const progressInterval = setInterval(() => {
        setScriptProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`Failed to generate script: ${response.statusText}`)
      }

      const data = await response.json()
      setGeneratedScript(data)
      setScriptProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate script')
      setScriptProgress(0)
    } finally {
      setIsGeneratingScript(false)
    }
  }

  const generateVideos = async () => {
    if (!generatedScript) return

    setIsGeneratingVideos(true)
    setError(null)
    setVideoProgress(0)

    try {
      const initialVideos: VideoResult[] = generatedScript.scenes.map((scene, index) => ({
        sceneIndex: index,
        videoUrl: '',
        status: 'generating' as const,
        prompt: scene.visualDescription
      }))
      setVideos(initialVideos)

      const progressInterval = setInterval(() => {
        setVideoProgress(prev => Math.min(prev + 2, 90))
      }, 1000)

      const response = await fetch('/api/generate-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenes: generatedScript.scenes }),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`Failed to generate videos: ${response.statusText}`)
      }

      const data = await response.json()
      setVideos(data.videos)
      setVideoProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate videos')
      setVideoProgress(0)
    } finally {
      setIsGeneratingVideos(false)
    }
  }

  const regenerateScene = async (sceneIndex: number) => {
    if (!generatedScript) return

    const scene = generatedScript.scenes[sceneIndex]
    setVideos(prev => prev.map(v => 
      v.sceneIndex === sceneIndex 
        ? { ...v, status: 'generating' as const }
        : v
    ))

    try {
      const response = await fetch('/api/generate-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenes: [scene], sceneIndex }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate scene')
      }

      const data = await response.json()
      setVideos(prev => prev.map(v => 
        v.sceneIndex === sceneIndex 
          ? data.videos[0]
          : v
      ))
    } catch (err) {
      setVideos(prev => prev.map(v => 
        v.sceneIndex === sceneIndex 
          ? { ...v, status: 'failed' as const }
          : v
      ))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Podcast Scene Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your podcast ideas into cinematic scenes. Enter a prompt and watch AI create 5 unique scenes with generated videos.
          </p>
        </div>

        {/* Input Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-purple-600" />
              Podcast Scene Prompt
            </CardTitle>
            <CardDescription>
              Describe your podcast scene idea. Be specific about the setting, characters, and mood.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: A late-night radio show where two hosts discuss mysterious urban legends in a dimly lit studio filled with vintage equipment..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none border-gray-200 focus:border-purple-400"
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {prompt.length}/1000 characters
              </span>
              <Button 
                onClick={generateScript}
                disabled={!prompt.trim() || isGeneratingScript}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGeneratingScript ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Script...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Scenes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicators */}
        {(isGeneratingScript || isGeneratingVideos) && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              {isGeneratingScript && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Generating Script...</span>
                    <span className="text-sm text-gray-500">{scriptProgress}%</span>
                  </div>
                  <Progress value={scriptProgress} className="h-2" />
                </div>
              )}
              {isGeneratingVideos && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Generating Videos...</span>
                    <span className="text-sm text-gray-500">{videoProgress}%</span>
                  </div>
                  <Progress value={videoProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Generated Script Display */}
        {generatedScript && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-green-600" />
                  Generated Podcast Scenes
                </CardTitle>
                <Button
                  onClick={generateVideos}
                  disabled={isGeneratingVideos}
                  variant="outline"
                  className="border-purple-200 hover:bg-purple-50"
                >
                  {isGeneratingVideos ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Videos...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Generate Videos
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {generatedScript.scenes.map((scene, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        Scene {index + 1}
                      </Badge>
                      <h3 className="font-semibold text-lg">{scene.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{scene.description}</p>
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">Dialogue:</h4>
                      <p className="text-sm bg-white p-3 rounded border italic">
                        "{scene.dialogue}"
                      </p>
                    </div>
                    <div className="space-y-2 mt-3">
                      <h4 className="font-medium text-sm text-gray-700">Visual Description:</h4>
                      <p className="text-sm text-gray-600">{scene.visualDescription}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Gallery */}
        {videos.length > 0 && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                Generated Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {videos.map((video, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Scene {video.sceneIndex + 1}
                      </Badge>
                      {video.status === 'generating' && (
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                      )}
                      {video.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => regenerateScene(video.sceneIndex)}
                          className="text-xs"
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                    
                    {video.status === 'completed' && video.videoUrl ? (
                      <div className="space-y-3">
                        <video
                          controls
                          className="w-full rounded border"
                          poster="/api/placeholder/300/200"
                        >
                          <source src={video.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Play className="h-3 w-3 mr-1" />
                            Play
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : video.status === 'generating' ? (
                      <div className="aspect-video bg-gray-200 rounded border flex items-center justify-center">
                        <div className="text-center">
                          <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Generating video...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-red-50 rounded border flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-sm text-red-500">Generation failed</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {video.prompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            Powered by AI • Claude Sonnet 4 for scripts • Google Veo-3 for videos
          </p>
        </div>
      </div>
    </div>
  )
}