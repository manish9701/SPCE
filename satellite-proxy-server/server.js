const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const API_KEY = process.env.N2YO_API_KEY;
const BASE_URL = 'https://api.n2yo.com/rest/v1/satellite';

app.get('/api/satellite/positions/:id/:observer_lat/:observer_lng/:observer_alt/:seconds', async (req, res) => {
  try {
    const { id, observer_lat, observer_lng, observer_alt, seconds } = req.params;
    const response = await axios.get(`${BASE_URL}/positions/${id}/${observer_lat}/${observer_lng}/${observer_alt}/${seconds}/&apiKey=${API_KEY}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching satellite positions:', error);
    res.status(500).json({ error: 'Failed to fetch satellite positions' });
  }
});

app.get('/api/satellite/tle/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${BASE_URL}/tle/${id}&apiKey=${API_KEY}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching TLE data:', error);
    res.status(500).json({ error: 'Failed to fetch TLE data' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});
