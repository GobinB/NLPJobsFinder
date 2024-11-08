const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { classifyJob } = require('./services/nlpService');
const cron = require('node-cron');
const { exec, spawn } = require('child_process');

const app = express();

app.use(cors());
app.use(express.json());

// Define dynamic paths
const dataPath = path.join(__dirname, '..', 'data', 'jobs.json');
const locationParserScriptPath = path.join(__dirname, '..','..', 'scripts', 'search_by_location.py');
const fetchCompaniesScriptPath = path.join(__dirname, '..', 'scripts', 'fetch_companies.py');

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

// Endpoint to parse location using Python script
app.get('/api/parse-location', (req, res) => {
  const text = req.query.text || '';  // Text to parse

  // Spawn a new Python process to run location_parser.py
  const pythonProcess = spawn('python', [locationParserScriptPath, text]);

  let pythonData = '';

  // Collect data from the Python script
  pythonProcess.stdout.on('data', (data) => {
    pythonData += data.toString();
  });

  pythonProcess.stdout.on('end', () => {
    try {
      const parsedData = JSON.parse(pythonData);
      res.json(parsedData);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      res.status(500).json({ message: 'Error parsing location data' });
    }
  });

  // Handle errors from the Python script
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
    res.status(500).json({ message: 'Error in Python location parser' });
  });

  pythonProcess.on('error', (error) => {
    console.error('Failed to start Python process:', error);
    res.status(500).json({ message: 'Error starting Python process' });
  });
});

// Schedule the cron job to run every Sunday at midnight
cron.schedule('0 0 * * 0', () => {
  console.log('Running weekly company data update');
  exec(`python ${fetchCompaniesScriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(`Company data updated: ${stdout}`);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
