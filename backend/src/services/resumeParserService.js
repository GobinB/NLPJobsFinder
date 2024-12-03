const natural = require('natural');
const nlp = require('compromise');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');
const compromise_numbers = require('compromise-numbers')
nlp.extend(compromise_numbers)

function normalizeLocation(location) {
  return location
    .toLowerCase()
    .trim()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ');
}

function extractLocationsFromText(text) {
  const doc = nlp(text);
  let locations = new Set();
  let hasRemoteExperience = false;

  console.log('Processing text:', text.substring(0, 200) + '...'); // Debug log

  // First pass: Use compromise's built-in place recognition
  const places = doc.places();
  places.forEach(place => {
    const location = normalizeLocation(place.text());
    if (location.length > 2 && !isCommonWord(location)) {
      locations.add(location);
      console.log('Found place:', location); // Debug log
    }
  });

  // Second pass: Look for city-state combinations
  const cityStatePattern = /([A-Za-z\s]+),\s*([A-Z]{2})/g;
  let match;
  while ((match = cityStatePattern.exec(text)) !== null) {
    const location = normalizeLocation(match[0]);
    if (!isCommonWord(location)) {
      locations.add(location);
      console.log('Found city-state:', location); // Debug log
    }
  }

  // Third pass: Look for remote work indicators
  const remoteIndicators = [
    /(remote|virtual|work from home|telecommute)/i,
    /(distributed team|global team)/i,
    /(work anywhere|work from anywhere)/i
  ];

  hasRemoteExperience = remoteIndicators.some(pattern => pattern.test(text));
  if (hasRemoteExperience) {
    console.log('Found remote experience'); // Debug log
  }

  // Fourth pass: Look for locations near work-related terms
  const workTerms = ['worked', 'working', 'based', 'located', 'office', 'headquarters'];
  workTerms.forEach(term => {
    const pattern = new RegExp(`${term}\\s+(?:in|at|from)\\s+([A-Za-z\\s,]+)`, 'gi');
    while ((match = pattern.exec(text)) !== null) {
      const location = normalizeLocation(match[1]);
      if (location.length > 2 && !isCommonWord(location)) {
        locations.add(location);
        console.log('Found work-related location:', location); // Debug log
      }
    }
  });

  const result = {
    locations: Array.from(locations),
    hasRemoteExperience,
    organizations: extractOrganizations(doc)
  };

  console.log('Final parsed result:', result); // Debug log
  return result;
}

// Helper function to filter out common words that might be mistaken for locations
function isCommonWord(word) {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'without',
    'about', 'above', 'across', 'after', 'against', 'along', 'among',
    'around', 'at', 'before', 'behind', 'below', 'beneath', 'beside',
    'between', 'beyond', 'by', 'down', 'during', 'except', 'for', 'from',
    'front', 'inside', 'into', 'like', 'near', 'of', 'off', 'on', 'out',
    'outside', 'over', 'past', 'since', 'through', 'throughout', 'till',
    'to', 'toward', 'under', 'underneath', 'until', 'up', 'upon', 'with',
    'within', 'without', 'experience', 'work', 'working', 'company',
    'business', 'project', 'team', 'development', 'software', 'engineering',
    'position', 'role', 'job', 'career', 'skills', 'technologies'
  ]);
  
  return commonWords.has(word.toLowerCase()) || word.length < 2;
}

// Enhanced organization extraction with location context
function extractOrganizations(doc) {
  const orgs = new Set();
  
  doc.organizations().forEach(org => {
    const orgText = org.text().toLowerCase();
    const context = org.before('{2}').after('{2}').text();
    
    if (context.match(/work|position|role|company|team|project/i)) {
      orgs.add(orgText);
    }
  });

  return Array.from(orgs);
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

// Modify isLocationMatch to be more flexible
function isLocationMatch(resumeLocations, companyLocation) {
  if (!resumeLocations || resumeLocations.length === 0) {
    console.log('No resume locations to match against'); // Debug log
    return true;
  }

  console.log('Matching resume locations:', resumeLocations); // Debug log
  console.log('Against company location:', companyLocation); // Debug log

  const normalizedCompanyLocations = companyLocation
    .split(/[\/,;\(\)&]/) // Split on more delimiters
    .map(loc => normalizeLocation(loc))
    .filter(loc => loc.length > 2);

  console.log('Normalized company locations:', normalizedCompanyLocations); // Debug log

  // More flexible matching
  const matches = resumeLocations.some(resumeLoc => {
    return normalizedCompanyLocations.some(companyLoc => {
      const match = 
        companyLoc.includes(resumeLoc) || 
        resumeLoc.includes(companyLoc) ||
        levenshteinDistance(resumeLoc, companyLoc) <= 2; // Allow for minor typos
      if (match) {
        console.log(`Match found: ${resumeLoc} matches ${companyLoc}`); // Debug log
      }
      return match;
    });
  });

  console.log('Match result:', matches); // Debug log
  return matches;
}

// Add helper function for fuzzy matching
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

module.exports = {
  parseResume,
  extractLocationsFromText,
  isLocationMatch
}; 