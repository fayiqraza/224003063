const http = require('http');
const axios = require('axios');
const url = require('url');

const server = http.createServer(async (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const urls = Array.isArray(queryObject.url) ? queryObject.url : [queryObject.url].filter(Boolean);

  if (!urls.length) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid URL parameter(s)' }));
    return;
  }

  const uniqueNumbers = new Set();

  try {
    for (const url of urls) {
      try {
        const response = await axios.get(url);
        if (response.status === 200 && response.data && Array.isArray(response.data.numbers)) {
          response.data.numbers.forEach((number) => {
            uniqueNumbers.add(number);
          });
        }
      } catch (error) {
        // Handle HTTP request errors or timeouts here if needed
        console.error(`Error fetching data from ${url}: ${error.message}`);
      }
    }

    const sortedNumbers = Array.from(uniqueNumbers).sort((a, b) => a - b);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ numbers: sortedNumbers }));
  } catch (error) {
    console.error('Error processing requests:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

const port = process.env.PORT || 8008;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
