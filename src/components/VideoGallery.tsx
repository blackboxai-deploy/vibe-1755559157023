"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Scene {
  id: number;
  title: string;
  description: string;
  dialogue: string;
  videoPrompt: string;
  videoUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  error?: string;
}

interface VideoGalleryProps {
  scenes: Scene[];
  onRegenerateVideo: (sceneId: number) => void;
  isGenerating: boolean;
}

export default function VideoGallery({ scenes, onRegenerateVideo, isGenerating }: VideoGalleryProps) {
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  const handleVideoPlay = (sceneId: number) => {
    setPlayingVideo(sceneId);
  };

  const handleVideoPause = () => {
    setPlayingVideo(null);
  };

  const handleDownload = async (videoUrl: string, sceneTitle: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sceneTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getStatusBadge = (status: Scene['status']) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Pending' },
      generating: { variant: 'default' as const, text: 'Generating...' },
      completed: { variant: 'default' as const, text: 'Completed' },
      error: { variant: 'destructive' as const, text: 'Error' }
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className="mb-2">
        {config.text}
      </Badge>
    );
  };

  if (scenes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No scenes generated yet. Enter a prompt above to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Generated Video Scenes</h2>
        <div className="text-sm text-muted-foreground">
          {scenes.filter(s => s.status === 'completed').length} of {scenes.length} videos ready
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenes.map((scene) => (
          <Card key={scene.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{scene.title}</CardTitle>
                {getStatusBadge(scene.status)}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">{scene.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Video Player */}
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {scene.status === 'completed' && scene.videoUrl ? (
                  <video
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    onPlay={() => handleVideoPlay(scene.id)}
                    onPause={handleVideoPause}
                    poster={`${scene.videoUrl}?t=1`}
                  >
                    <source src={scene.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : scene.status === 'generating' ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="text-sm text-muted-foreground">Generating video...</p>
                    </div>
                  </div>
                ) : scene.status === 'error' ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                      <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
                      <p className="text-sm text-destructive">Generation failed</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                      <Play className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Waiting to generate</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {scene.status === 'error' && scene.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {scene.error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Video Prompt */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Video Prompt:</h4>
                <p className="text-xs text-muted-foreground bg-muted p-2 rounded line-clamp-3">
                  {scene.videoPrompt}
                </p>
              </div>

              {/* Dialogue Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Dialogue:</h4>
                <p className="text-xs text-muted-foreground bg-muted p-2 rounded line-clamp-4">
                  {scene.dialogue}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {scene.status === 'completed' && scene.videoUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(scene.videoUrl!, scene.title)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                )}
                
                {(scene.status === 'error' || scene.status === 'completed') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRegenerateVideo(scene.id)}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                    Regenerate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Generating videos... This may take several minutes.
          </div>
        </div>
      )}
    </div>
  );
}