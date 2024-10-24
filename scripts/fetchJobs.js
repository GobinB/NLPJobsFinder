const { fetchJobsFromGithub } = require('../backend/src/utils/githubFetcher');
const { classifyJob } = require('../backend/src/services/nlpService');
const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '..', 'backend', 'data', 'jobs.json');

async function updateJobs() {
  try {
    const jobs = await fetchJobsFromGithub();
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
      throw new Error('No jobs fetched or invalid data received');
    }

    const classifiedJobs = jobs.map(job => {
      const { isRemote, isKentucky, jobType } = classifyJob(job.description, job.location);
      return { ...job, isRemote, isKentucky, jobType };
    });

    await fs.writeFile(dataPath, JSON.stringify(classifiedJobs, null, 2));
    
    console.log(`Jobs updated successfully. Total jobs: ${classifiedJobs.length}`);
  } catch (error) {
    console.error('Error updating jobs:', error.message);
    process.exit(1);
  }
}

updateJobs();
