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
  .then(response => response.text())
  .then(data => {
    // Debugging statement 2: Print to check if fetch request was successful
    console.log('Data fetched from target:', data);

    // Display some debug information on the webpage along with the actual data
    res.send(`<h2>Request was successful!</h2><p>Data: ${data}</p>`);  // Send the response back
  })
  .catch(error => {
    // Debugging statement: Print to check for errors
    console.error('Error fetching data:', error);

    // Display the error on the webpage
    res.status(500).send(`<h2>Error fetching data</h2><p>Error: ${error.message}</p>`);  // Send the error response
  });
});

// Start the server
app.listen(8080, () => {
  console.log('Proxy server running on port 8080');
});
