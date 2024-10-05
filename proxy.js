const express = require('express');
const fetch = require('node-fetch');
const zlib = require('zlib');  // Import zlib for gzip decompression
const cors = require('cors');  // Import the CORS middleware
const app = express();

app.use(cors());  // Enable CORS for all routes
app.use(express.json());

// Proxy route to forward requests with modified Origin header and browser-like headers
app.post('/proxy', (req, res) => {
  const { targetUrl } = req.body;

  // Define request options (headers, method, etc.)
  const requestOptions = {
    method: 'GET',
    headers: {
      'Origin': 'https://chinamayjoshi.xyz?#xyz.capitalone.com',  // Fake origin
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.134 Safari/537.36',  // Mimic Chrome browser
      'Accept-Encoding': 'gzip, deflate',  // Accept gzip and deflate encoded responses
      'Accept': '*/*',  // Accept all content types ,  // Optionally add cookies if needed
      'Referer': 'https://coaf-prequalification.capitalone.com/',
      'Sec-Ch-Ua': '".Not/A)Brand";v="99", "Google Chrome";v="114", "Chromium";v="114"',
      'Sec-Ch-Ua-Platform': 'Windows',
      'Sec-Ch-Ua-Mobile': '?0',
    },
    credentials: 'include'  // Include cookies if needed
  };

  // Log the full request before sending it
  console.log(`Sending request to Capital One: ${targetUrl}`);
  console.log('Request Headers:', JSON.stringify(requestOptions.headers, null, 2));

  fetch(targetUrl, requestOptions)
    .then(async response => {
      const statusCode = response.status;  // Log the response status code
      console.log(`Response Status Code: ${statusCode}`);

      const headers = response.headers.raw();
      console.log('Response headers:', headers);

      // Handle response body as buffer to process chunked encoding or gzip
      const buffer = await response.buffer();
    
      // Determine if content-encoding is gzip
      const encoding = response.headers.get('content-encoding');
      let body;
    
      try {
        if (encoding === 'gzip') {
          // Decompress Gzip response body
          body = zlib.gunzipSync(buffer).toString();
        } else if (encoding === 'deflate') {
          // Decompress Deflate-encoded response body
          body = zlib.inflateSync(buffer).toString();
        } else {
          // If not gzipped or deflated, convert buffer to string directly
          body = buffer.toString();
        }
      } catch (err) {
        console.error('Error decompressing data:', err);
        body = 'Error decompressing response';
      }

      // Log and send both headers and body back to the frontend
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
