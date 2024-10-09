const { fetchJobsFromGithub } = require('../backend/src/utils/githubFetcher');
const { classifyJob } = require('../backend/src/services/nlpService');
const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '..', 'backend', 'data', 'jobs.json');

async function updateJobs() {
  try {
    const jobs = await fetchJobsFromGithub();
    
    const classifiedJobs = jobs.map(job => {
      const { isRemote, isKentucky } = classifyJob(job.description);
      return { ...job, isRemote, isKentucky };
    });

    await fs.writeFile(dataPath, JSON.stringify(classifiedJobs, null, 2));
    
    console.log('Jobs updated successfully');
  } catch (error) {
    console.error('Error updating jobs:', error);
  }
}

updateJobs();