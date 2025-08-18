import { NextRequest, NextResponse } from 'next/server';

interface Scene {
  id: number;
  title: string;
  description: string;
  dialogue: string;
  visualDescription: string;
}

interface VideoGenerationRequest {
  scenes: Scene[];
}

interface VideoResult {
  sceneId: number;
  videoUrl: string | null;
  status: 'success' | 'error';
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { scenes }: VideoGenerationRequest = await request.json();

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { error: 'Invalid scenes data provided' },
        { status: 400 }
      );
    }

    // Generate video prompts for each scene
    const videoPrompts = scenes.map(scene => ({
      sceneId: scene.id,
      prompt: `Create a cinematic podcast scene: ${scene.title}. ${scene.visualDescription}. Professional lighting, high quality, realistic style. Duration: 10-15 seconds. ${scene.description}`
    }));

    // Process videos in parallel with timeout
    const videoPromises = videoPrompts.map(async ({ sceneId, prompt }) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

        const response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer xxx',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: 'google/veo-3',
            input: {
              prompt: prompt,
              duration: 15,
              aspect_ratio: '16:9',
              quality: 'high'
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Video generation failed: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Poll for completion
        let videoUrl = null;
        if (result.id) {
          videoUrl = await pollForCompletion(result.id);
        }

        return {
          sceneId,
          videoUrl,
          status: 'success' as const
        };
      } catch (error) {
        console.error(`Error generating video for scene ${sceneId}:`, error);
        return {
          sceneId,
          videoUrl: null,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const videoResults = await Promise.all(videoPromises);

    return NextResponse.json({
      success: true,
      videos: videoResults,
      totalScenes: scenes.length,
      successCount: videoResults.filter(v => v.status === 'success').length
    });

  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate videos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function pollForCompletion(predictionId: string): Promise<string | null> {
  const maxAttempts = 60; // 5 minutes with 5-second intervals
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': 'Bearer xxx',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Polling failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.status === 'succeeded' && result.output) {
        return Array.isArray(result.output) ? result.output[0] : result.output;
      }

      if (result.status === 'failed') {
        throw new Error('Video generation failed');
      }

      // Wait 5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    } catch (error) {
      console.error('Polling error:', error);
      break;
    }
  }

  return null;
}