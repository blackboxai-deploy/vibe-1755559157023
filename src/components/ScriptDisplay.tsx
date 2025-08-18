import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play, Download } from 'lucide-react';

interface Scene {
  id: number;
  title: string;
  description: string;
  dialogue: string;
  visualDescription: string;
  videoPrompt?: string;
  videoUrl?: string;
  isGenerating?: boolean;
}

interface ScriptDisplayProps {
  scenes: Scene[];
  isLoading?: boolean;
  onRegenerateScene?: (sceneId: number) => void;
  onGenerateVideo?: (sceneId: number) => void;
  onDownloadScript?: () => void;
}

export default function ScriptDisplay({ 
  scenes, 
  isLoading = false, 
  onRegenerateScene,
  onGenerateVideo,
  onDownloadScript 
}: ScriptDisplayProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Generating Script...</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!scenes || scenes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Generated Podcast Script</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDownloadScript}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Script
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {scenes.map((scene) => (
          <Card key={scene.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Scene {scene.id}</Badge>
                  <CardTitle className="text-lg">{scene.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                  {onRegenerateScene && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRegenerateScene(scene.id)}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Regenerate
                    </Button>
                  )}
                  {onGenerateVideo && !scene.videoUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onGenerateVideo(scene.id)}
                      disabled={scene.isGenerating}
                      className="flex items-center gap-1"
                    >
                      {scene.isGenerating ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      {scene.isGenerating ? 'Generating...' : 'Generate Video'}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Description</h4>
                <p className="text-gray-700">{scene.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Dialogue</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                    {scene.dialogue}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Visual Description</h4>
                <p className="text-gray-700 text-sm italic">{scene.visualDescription}</p>
              </div>

              {scene.videoPrompt && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Video Prompt</h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-800 text-sm">{scene.videoPrompt}</p>
                  </div>
                </div>
              )}

              {scene.videoUrl && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Generated Video</h4>
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video 
                      controls 
                      className="w-full h-auto"
                      poster="/api/placeholder/640/360"
                    >
                      <source src={scene.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 mt-6">
        Generated {scenes.length} scenes • Ready for video generation
      </div>
    </div>
  );
}