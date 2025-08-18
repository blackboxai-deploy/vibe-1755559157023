// Test the AI endpoint directly to see the full response
const http = require('http');

const postData = JSON.stringify({
  prompt: "Test"
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

const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n=== FULL RESPONSE ===');
    console.log(data);
    console.log('\n=== END RESPONSE ===');
    
    try {
      const json = JSON.parse(data);
      if (json.content) {
        console.log('\n=== AI CONTENT (first 1000 chars) ===');
        console.log(json.content.substring(0, 1000));
        console.log('\n=== AI CONTENT (last 500 chars) ===');
        console.log(json.content.substring(Math.max(0, json.content.length - 500)));
      }
    } catch (e) {
      console.log('Could not parse as JSON');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();