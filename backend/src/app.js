const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, '..', 'data', 'jobs.json');

// Read jobs from JSON file
app.get('/api/jobs', async (req, res) => {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    const jobs = JSON.parse(data);
    res.json(jobs);
  } catch (error) {
    console.error('Error reading jobs:', error);
    res.status(500).json({ message: 'Error reading jobs' });
  }
});

// Routes will be added here

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});