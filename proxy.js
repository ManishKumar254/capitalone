const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');  // Import the CORS middleware
const app = express();

app.use(cors());  // Enable CORS for all routes
app.use(express.json());

// Proxy route to forward requests with modified Origin header
app.post('/proxy', (req, res) => {
  const { targetUrl } = req.body;

  // Debugging statement 1: Print to check if the proxy route is being hit
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
    // Debugging statement 2: Print response headers
    console.log('Response headers:', response.headers.raw());

    // Get the response headers and body
    const headers = response.headers.raw();
    const body = await response.text();

    // Send both headers and body back to the frontend
    res.json({
      headers: headers,
      body: body
    });
  })
  .catch(error => {
    // Debugging statement: Print to check for errors
    console.error('Error fetching data:', error);

    // Display the error on the webpage
    res.status(500).json({ error: error.message });  // Send the error response as JSON
  });
});

// Start the server
app.listen(8080, () => {
  console.log('Proxy server running on port 8080');
});
