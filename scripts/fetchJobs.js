const { fetchJobsFromGithub } = require('../backend/src/utils/githubFetcher');
const { classifyCompany } = require('../backend/src/services/nlpService');
const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '..', 'backend', 'data', 'companies.json');

async function updateCompanies() {
  try {
    const companies = await fetchJobsFromGithub();

    if (!Array.isArray(companies) || companies.length === 0) {
      throw new Error('No companies fetched or invalid data received');
    }

    const classifiedCompanies = companies.map(company => {
      const { jobType, region, isRemote, isKentucky } = classifyCompany(company.description, company.location);
      return { ...company, jobType, region, isRemote, isKentucky };
    });

    await fs.writeFile(dataPath, JSON.stringify(classifiedCompanies, null, 2));

    console.log(`Companies updated successfully. Total companies: ${classifiedCompanies.length}`);
  } catch (error) {
    console.error('Error updating companies:', error.message);
    process.exit(1);
  }
}

updateCompanies();
