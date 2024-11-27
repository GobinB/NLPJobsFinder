const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
const remoteKeywords = ['remote', 'work from home', 'telecommute', 'virtual', 'anywhere'];
const hybridKeywords = ['hybrid', 'flexible', 'partially remote'];

const usaLocations = ['usa', 'united states', 'kentucky'];
const ukLocations = ['england', 'uk', 'united kingdom', 'kent', 'london', 'manchester'];

function classifyJob(description, location) {
  const tokens = tokenizer.tokenize((description + ' ' + location).toLowerCase());
  const locationLower = location.toLowerCase();
  
  // Check for Kentucky locations with word boundaries
  const kentuckyPatterns = [
    /\bky\b/,
    /\bkentucky\b/,
    /\blexington,?\s*ky\b/,
    /\blouisville,?\s*ky\b/,
    /\belizabethtown,?\s*ky\b/,
    /\bbowling green,?\s*ky\b/
  ];

  const isRemote = remoteKeywords.some(keyword => 
    locationLower.includes(keyword) || description.toLowerCase().includes(keyword)
  );
  
  const isHybrid = hybridKeywords.some(keyword => 
    locationLower.includes(keyword) || description.toLowerCase().includes(keyword)
  );

  const isKentucky = kentuckyPatterns.some(pattern => pattern.test(locationLower));

  let jobType = 'On-site';
  if (isKentucky) jobType = 'Kentucky';
  else if (isRemote && !isHybrid) jobType = 'Remote';
  else if (isHybrid) jobType = 'Hybrid';

  let region = 'Unknown';
  if (isKentucky || usaLocations.some(loc => locationLower.includes(loc))) region = 'USA';
  else if (ukLocations.some(loc => locationLower.includes(loc))) region = 'UK';
  
  return { jobType, region };
}

module.exports = { classifyJob };
