const natural = require('natural');
const nlp = require('compromise');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');

// Add more sophisticated NLP plugins
nlp.extend(require('compromise-dates'))   // For context around work locations

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

  // Create a classifier for location validation
  const classifier = new natural.BayesClassifier();
  
  // Train the classifier with common location patterns
  classifier.addDocument('located in', 'location');
  classifier.addDocument('based in', 'location');
  classifier.addDocument('office in', 'location');
  classifier.addDocument('headquarters in', 'location');
  classifier.addDocument('relocated to', 'location');
  classifier.train();

  // Use compromise's smart entity recognition with context
  doc.match('#Place+').forEach(place => {
    const phrase = place.before(3).after(3).text(); // Get context
    if (classifier.classify(phrase) === 'location') {
      const location = normalizeLocation(place.text());
      if (location.length > 2 && !isCommonWord(location)) {
        locations.add(location);
      }
    }
  });

  // Look for location patterns with strong indicators
  const locationIndicators = [
    'in', 'at', 'from', 'near', 'around', 
    'relocated to', 'based in', 'located in', 'moved to'
  ];

  locationIndicators.forEach(indicator => {
    const matches = doc.match(`${indicator} #Place+`);
    matches.forEach(match => {
      const location = normalizeLocation(match.groups().places?.[0]?.text() || '');
      if (location && !isCommonWord(location)) {
        locations.add(location);
      }
    });
  });

  // Extract locations from structured formats
  const structuredPatterns = [
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})\b/, // City, State
    /([A-Z]{2})\s*-\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/, // State - City
    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+(?:Area|Region|District)\b/ // Areas
  ];

  text.split(/[.,;]/).forEach(segment => {
    structuredPatterns.forEach(pattern => {
      const match = segment.match(pattern);
      if (match) {
        const location = normalizeLocation(match[0]);
        if (!isCommonWord(location)) {
          locations.add(location);
        }
      }
    });
  });

  // Smart remote work detection
  const remoteContext = doc.match('(work|working|worked) (from|remotely|virtually|at home)').found ||
    doc.match('remote (#Verb|position|role|work|team)').found ||
    doc.match('(distributed|virtual|global) team').found;

  // Look for remote work duration for stronger evidence
  const remoteWithDuration = doc.match([
    '(remote|virtual) .{0,20} (#Duration|#Date)',
    'worked remotely for #Duration',
    'remote (#Position|work) (#Date|since|for)'
  ].join('|'));

  hasRemoteExperience = remoteContext || remoteWithDuration.found;

  return {
    locations: Array.from(locations),
    hasRemoteExperience,
    organizations: extractOrganizations(doc)
  };
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