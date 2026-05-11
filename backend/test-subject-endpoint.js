// Test script for subject endpoint
const http = require('http');

console.log("Testing /api/tasks/subject endpoint...");

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/tasks/subject/507f1f77bcf86cd799439011/507f1f77bcf86cd799439012/2024-01-15',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log(`Making request to: ${options.path}`);

const req = http.request(options, (res) => {
  console.log(`\nStatus Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:', data);
    try {
      const json = JSON.parse(data);
      console.log('\nParsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('\nNot JSON response');
    }
  });
});

req.on('error', (error) => {
  console.error('\nError:', error);
});

req.end();
