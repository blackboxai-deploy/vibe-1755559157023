import { NextRequest, NextResponse } from 'next/server';
import { callAIEndpoint, createScriptGenerationPayload, AI_CONFIG } from '@/lib/ai-config';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    console.log('Generating script for prompt:', prompt.substring(0, 100) + '...');

    // Use the AI configuration helper
    const payload = createScriptGenerationPayload(prompt);
    const data = await callAIEndpoint(payload, AI_CONFIG.TIMEOUTS.SCRIPT_GENERATION);

    console.log('AI Response received, processing...');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }

    let content = data.choices[0].message.content;
    
    // Clean up content if it's wrapped in markdown code blocks
    content = content.trim();
    
    // Remove opening markdown block
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '');
    }
    
    // Remove closing markdown block
    if (content.endsWith('```')) {
      content = content.replace(/\s*```$/, '');
    }
    
    // Final cleanup
    content = content.trim();
    
    try {
      const parsedContent = JSON.parse(content);
      
      if (!parsedContent.scenes || !Array.isArray(parsedContent.scenes) || parsedContent.scenes.length !== 5) {
        return NextResponse.json(
          { error: 'AI did not generate exactly 5 scenes as required' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        scenes: parsedContent.scenes,
        originalPrompt: prompt
      });

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Content length:', content.length);
      console.error('Cleaned content preview (first 200 chars):', content.substring(0, 200));
      console.error('Cleaned content preview (last 200 chars):', content.substring(Math.max(0, content.length - 200)));
      console.error('Parse error details:', parseError.message);
      
      // Try to find the JSON part more aggressively - look for the complete JSON object
      const jsonMatch = content.match(/\{[\s\S]*"scenes"[\s\S]*\][\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedContent = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed with regex extraction');
          
          if (!parsedContent.scenes || !Array.isArray(parsedContent.scenes) || parsedContent.scenes.length !== 5) {
            return NextResponse.json(
              { error: 'AI did not generate exactly 5 scenes as required' },
              { status: 500 }
            );
          }

          return NextResponse.json({
            success: true,
            scenes: parsedContent.scenes,
            originalPrompt: prompt
          });
        } catch (regexParseError) {
          console.error('Regex extraction also failed:', regexParseError.message);
        }
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response', 
          content: content.substring(0, 500),
          contentLength: content.length,
          parseError: parseError.message,
          lastChar: content.charCodeAt(content.length - 1),
          lastFewChars: content.substring(Math.max(0, content.length - 10))
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}