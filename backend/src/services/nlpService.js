const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
const remoteKeywords = ['remote', 'work from home', 'telecommute', 'virtual', 'anywhere'];
const hybridKeywords = ['hybrid', 'flexible', 'partially remote'];

const usaLocations = ['usa', 'united states', 'kentucky'];
const ukLocations = ['england', 'uk', 'united kingdom', 'kent', 'london', 'manchester'];

function classifyJob(description, location) {
  const tokens = tokenizer.tokenize((description + ' ' + location).toLowerCase());
  
  const isRemote = remoteKeywords.some(keyword => 
    tokens.includes(keyword) || description.toLowerCase().includes(keyword) || location.toLowerCase().includes(keyword)
  );
  
  const isHybrid = hybridKeywords.some(keyword => 
    tokens.includes(keyword) || description.toLowerCase().includes(keyword) || location.toLowerCase().includes(keyword)
  );

  const isUSALocation = usaLocations.some(keyword => tokens.includes(keyword));
  const isUKLocation = ukLocations.some(keyword => tokens.includes(keyword));

  let jobType = 'On-site';
  if (isRemote && !isHybrid) jobType = 'Remote';
  else if (isHybrid) jobType = 'Hybrid';

  
  let region = 'Unknown';
  if (isUSALocation) region = 'USA';
  else if (isUKLocation) region = 'UK';
  
  return { jobType, region };
}

module.exports = { classifyJob };
