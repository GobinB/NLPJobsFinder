const { isLocationMatch } = require('./resumeParserService');

function filterJobs(companies, resumeData, filters = {}) {
  return companies.filter(company => {
    // Check if company matches resume locations
    const locationMatches = isLocationMatch(resumeData.locations, company.location);
    
    // If remote is allowed and company offers remote
    const remoteMatches = 
      (resumeData.hasRemoteExperience || filters.includeRemote) && 
      company.location.toLowerCase().includes('remote');

    // Company should match either location or remote criteria
    return locationMatches || remoteMatches;
  });
} 