const express = require('express');
const fetch = require('node-fetch');
const zlib = require('zlib');  // Import zlib for gzip decompression
const cors = require('cors');  // Import the CORS middleware
const app = express();

app.use(cors());  // Enable CORS for all routes
app.use(express.json());

// Proxy route to forward requests with modified Origin header
app.post('/proxy', (req, res) => {
  const { targetUrl } = req.body;

  console.log('Received request to proxy with targetUrl:', targetUrl);

  fetch(targetUrl, {
    method: 'GET',
    headers: {
      'Origin': 'https://chinamayjoshi.xyz?xyz.capitalone.com',  // Fake origin
      'Content-Type': 'application/json'
    },
    credentials: 'include'  // Include cookies if needed
  })
  .then(async response => {
    const statusCode = response.status;  // Log the response status code
    console.log(`Response Status Code: ${statusCode}`);

    const headers = response.headers.raw();
    console.log('Response headers:', headers);

    // Handle gzip content encoding
    const encoding = response.headers.get('content-encoding');
    let body;

    if (encoding === 'gzip') {
      const buffer = await response.buffer();  // Get response body as buffer
      body = zlib.gunzipSync(buffer).toString();  // Decompress GZIP buffer
    } else {
      body = await response.text();  // For non-gzipped responses
    }

    // Log and send both headers and decompressed body back to the frontend
    console.log('Response body:', body);

    res.json({
      status: statusCode,
      headers: headers,
      body: body
    });
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: error.message });
  });
});

// Start the server
app.listen(8080, () => {
  console.log('Proxy server running on port 8080');
});
