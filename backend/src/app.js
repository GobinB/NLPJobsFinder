const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { classifyJob } = require('./services/nlpService');
const cron = require('node-cron');
const { exec } = require('child_process');

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

// Read companies from JSON file
app.get('/api/companies', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '..', 'data', 'companies.json'), 'utf8');
    const companies = JSON.parse(data);
    res.json(companies);
  } catch (error) {
    console.error('Error reading companies:', error);
    res.status(500).json({ message: 'Error reading companies' });
  }
});

// Schedule the cron job to run every Sunday at midnight
cron.schedule('0 0 * * 0', () => {
  console.log('Running weekly company data update');
  const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'fetch_companies.py');
  exec(`python ${scriptPath}`, (error, stdout, stderr) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
