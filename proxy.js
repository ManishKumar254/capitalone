const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// Proxy route to forward requests with modified Origin header
app.post('/proxy', (req, res) => {
  const { targetUrl } = req.body;

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
    res.send(data);  // Send the response back
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  });
});

// Start the server
app.listen(8080, () => {
  console.log('Proxy server running on port 8080');
});
