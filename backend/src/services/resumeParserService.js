const natural = require('natural');
const nlp = require('compromise');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');

const tokenizer = new natural.WordTokenizer();

function extractLocationsFromText(text) {
  const doc = nlp(text);
  
  // Get locations using compromise's built-in location detection
  const locations = doc.places().out('array');
  
  // Get company names and their contexts
  const organizations = doc.organizations().out('array');
  
  // Enhanced remote work detection
  const remoteIndicators = text.toLowerCase().match(
    /remote|work from home|virtual|telecommute|distributed team|remote-first|fully remote|100% remote/g
  ) || [];
  
  // Enhanced location detection
  const stateAbbreviations = /\b(KY|TN|OH|IN|IL|MO|VA|WV|NC|SC|GA|AL|MS|FL)\b/g;
  const stateMatches = text.match(stateAbbreviations) || [];
  
  return {
    locations: [...new Set([...locations, ...stateMatches])],
    hasRemoteExperience: remoteIndicators.length > 0,
    organizations,
    remoteIndicators: remoteIndicators.length
  };
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

    // Extract work experience section using patterns
    const experienceSection = text.match(/EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|WORK HISTORY(.*?)(?=EDUCATION|SKILLS|$)/si)?.[1] || text;

    const parsed = extractLocationsFromText(experienceSection);
    
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

module.exports = { parseResume }; 