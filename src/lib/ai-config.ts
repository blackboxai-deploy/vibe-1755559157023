export const AI_CONFIG = {
  // Custom endpoint configuration
  ENDPOINT: 'https://oi-server.onrender.com/chat/completions',
  HEADERS: {
    'customerId': 'cus_SGPn4uhjPI0F4w',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  },
  
  // Model configurations
  MODELS: {
    SCRIPT_GENERATION: 'openrouter/claude-sonnet-4',
    VIDEO_GENERATION: 'replicate/google/veo-3'
  },
  
  // Timeout configurations (in milliseconds)
  TIMEOUTS: {
    SCRIPT_GENERATION: 120000, // 2 minutes
    VIDEO_GENERATION: 300000   // 5 minutes
  },
  
  // System prompts
  PROMPTS: {
    SCRIPT_GENERATION: `You are an expert podcast script writer. Generate exactly 5 engaging podcast scenes based on the user's prompt. Each scene should be cinematic and visually compelling.

Return your response as a JSON object with this exact structure:
{
  "scenes": [
    {
      "id": 1,
      "title": "Scene Title",
      "description": "Brief scene description",
      "dialogue": "Complete dialogue for the scene",
      "visualDescription": "Detailed visual description for video generation",
      "duration": "estimated duration in seconds"
    }
  ]
}

Requirements:
- Exactly 5 scenes
- Each scene should be 30-60 seconds long
- Include natural dialogue and conversation
- Visual descriptions should be cinematic and detailed
- Make scenes flow logically from one to the next
- Focus on visual storytelling elements`,

    VIDEO_GENERATION: (sceneDescription: string, dialogue: string) => 
      `Create a cinematic podcast scene video based on this description: ${sceneDescription}

Dialogue context: ${dialogue}

Video requirements:
- Professional podcast studio setting
- High-quality cinematic lighting
- Multiple camera angles
- Professional audio equipment visible
- Engaging visual composition
- 30-60 second duration
- Realistic human expressions and gestures
- Modern podcast studio aesthetic`
  }
};

// API helper functions
export async function callAIEndpoint(payload: any, timeout: number = AI_CONFIG.TIMEOUTS.SCRIPT_GENERATION) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(AI_CONFIG.ENDPOINT, {
      method: 'POST',
      headers: AI_CONFIG.HEADERS,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI request timed out');
    }
    throw error;
  }
}

export function createScriptGenerationPayload(userPrompt: string) {
  return {
    model: AI_CONFIG.MODELS.SCRIPT_GENERATION,
    messages: [
      {
        role: 'system',
        content: AI_CONFIG.PROMPTS.SCRIPT_GENERATION
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    temperature: 0.7,
    max_tokens: 4000
  };
}

export function createVideoGenerationPayload(sceneDescription: string, dialogue: string) {
  return {
    model: AI_CONFIG.MODELS.VIDEO_GENERATION,
    input: {
      prompt: AI_CONFIG.PROMPTS.VIDEO_GENERATION(sceneDescription, dialogue),
      duration: 60,
      aspect_ratio: "16:9",
      quality: "high"
    }
  };
}