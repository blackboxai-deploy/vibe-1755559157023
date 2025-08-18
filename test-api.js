#!/usr/bin/env node

// Simple test script to validate API endpoints
const https = require('https');
const http = require('http');

async function testAPI() {
  console.log('🧪 Testing AI Podcast Scene Generator APIs...\n');
  
  // Test data
  const testPrompt = "A tech startup founder pitches their AI-powered coffee machine to investors";
  
  // Test script generation API
  console.log('📝 Testing Script Generation API...');
  
  const postData = JSON.stringify({
    prompt: testPrompt
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate-script',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });
      
      req.on('error', (e) => {
        reject(e);
      });
      
      req.write(postData);
      req.end();
    });
    
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`📊 Content-Type: ${response.headers['content-type']}`);
    
    if (response.statusCode === 200) {
      try {
        const json = JSON.parse(response.data);
        console.log(`🎯 Script generated successfully with ${json.scenes ? json.scenes.length : 0} scenes`);
        if (json.scenes && json.scenes.length > 0) {
          console.log(`📋 First scene: "${json.scenes[0].title}"`);
        }
      } catch (e) {
        console.log(`⚠️  Response not JSON:`, response.data.substring(0, 200));
      }
    } else {
      console.log(`❌ Error response:`, response.data.substring(0, 200));
    }
    
  } catch (error) {
    console.log('❌ Script generation failed:', error.message);
  }
  
  console.log('\n🎬 Testing Video Generation API...');
  
  // Test with minimal scene data
  const testScenes = [
    {
      title: "Test Scene",
      description: "A simple test scene",
      dialogue: "Hello world",
      videoPrompt: "A person saying hello in a bright room"
    }
  ];
  
  const videoPostData = JSON.stringify({
    scenes: testScenes
  });
  
  const videoOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate-videos',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(videoPostData)
    }
  };
  
  try {
    const videoResponse = await new Promise((resolve, reject) => {
      const req = http.request(videoOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });
      
      req.on('error', (e) => {
        reject(e);
      });
      
      req.write(videoPostData);
      req.end();
    });
    
    console.log(`✅ Status: ${videoResponse.statusCode}`);
    console.log(`📊 Content-Type: ${videoResponse.headers['content-type']}`);
    
    if (videoResponse.statusCode === 200) {
      try {
        const json = JSON.parse(videoResponse.data);
        console.log(`🎥 Videos generated successfully`);
        console.log(`📈 Processing status:`, json.status || 'Unknown');
      } catch (e) {
        console.log(`⚠️  Response not JSON:`, videoResponse.data.substring(0, 200));
      }
    } else {
      console.log(`❌ Error response:`, videoResponse.data.substring(0, 200));
    }
    
  } catch (error) {
    console.log('❌ Video generation failed:', error.message);
  }
  
  console.log('\n🏁 API testing completed!');
}

// Run the test
testAPI().catch(console.error);