const natural = require('natural');
const nlp = require('compromise');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');

// Add more comprehensive location data
nlp.extend(require('compromise-location'))

function normalizeLocation(location) {
  return location
    .toLowerCase()
    .trim()
    .replace(/[.,]/g, ''); // Remove periods and commas
}

function extractLocationsFromText(text) {
  const doc = nlp(text);
  let locations = [];
  let hasRemoteExperience = false;
  
  // Extract locations using compromise-location plugin
  const places = doc.places();
  places.forEach(place => {
    const location = place.normalize().text().toLowerCase();
    // Only add unique locations and filter out generic terms
    if (!locations.includes(location) && location.length > 2) {
      locations.push(location);
    }
  });

  // Extract countries and regions
  const countries = doc.places().countries().normalize().out('array');
  const regions = doc.places().regions().normalize().out('array');
  
  // Add countries and regions if not already included
  [...countries, ...regions].forEach(place => {
    const location = place.toLowerCase();
    if (!locations.includes(location)) {
      locations.push(location);
    }
  });

  // Check for remote work experience
  const remotePatterns = [
    /\b(?:remote|virtual|work from home|telecommute|distributed team)\b/i,
    /\b(?:worked remotely|remote position|remote role|remote work)\b/i
  ];

  hasRemoteExperience = remotePatterns.some(pattern => pattern.test(text));

  // Add specific location handling for common formats
  const locationPatterns = [
    /\b(?:united states|usa|u\.s\.a\.|america)\b/i,
    /\b(?:uk|united kingdom|great britain)\b/i
  ];

  locationPatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match && !locations.includes(match[0].toLowerCase())) {
      locations.push(match[0].toLowerCase());
    }
  });

  // Normalize locations before returning
  locations = locations
    .map(loc => normalizeLocation(loc))
    .filter(loc => loc.length > 2)
    .filter((loc, index, self) => self.indexOf(loc) === index);

  return {
    locations,
    hasRemoteExperience,
    organizations: extractOrganizations(doc)
  };
}

function extractOrganizations(doc) {
  return doc.organizations().normalize().out('array')
    .map(org => org.toLowerCase())
    .filter((org, index, self) => self.indexOf(org) === index);
}

async function parseResume(buffer, fileType) {
  let text = '';
  
  try {
    if (fileType === 'application/pdf') {
      const pdfData = await pdf(buffer);
      text = pdfData.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      throw new Error('Unsupported file type');
    }

    // Extract work experience section using more comprehensive patterns
    const experienceSectionPattern = /(?:EXPERIENCE|WORK|EMPLOYMENT|HISTORY).*?(?=EDUCATION|SKILLS|PROJECTS|ACHIEVEMENTS|$)/is;
    const experienceSection = text.match(experienceSectionPattern)?.[0] || text;

    const parsed = extractLocationsFromText(experienceSection);
    console.log('Parsed locations:', parsed.locations); // For debugging
    
    return {
      locations: parsed.locations,
      hasRemoteExperience: parsed.hasRemoteExperience,
      organizations: parsed.organizations
    };
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}

// Add new function to check if locations match
function isLocationMatch(resumeLocations, companyLocation) {
  // If no resume locations, don't filter
  if (!resumeLocations || resumeLocations.length === 0) {
    return true;
  }

  const normalizedCompanyLocations = companyLocation
    .split(/[\/;]/) // Split on / or ;
    .map(loc => normalizeLocation(loc));

  // Check if any resume location matches any company location
  return resumeLocations.some(resumeLoc => 
    normalizedCompanyLocations.some(companyLoc => 
      companyLoc.includes(resumeLoc) || resumeLoc.includes(companyLoc)
    )
  );
}

module.exports = {
  parseResume,
  extractLocationsFromText,
  isLocationMatch
}; 