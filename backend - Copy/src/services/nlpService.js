const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
const remoteKeywords = ['remote', 'work from home', 'telecommute', 'virtual', 'anywhere'];
const hybridKeywords = ['hybrid', 'flexible', 'partially remote'];

function classifyJob(description, location) {
  const tokens = tokenizer.tokenize((description + ' ' + location).toLowerCase());
  
  const isRemote = remoteKeywords.some(keyword => 
    tokens.includes(keyword) || description.toLowerCase().includes(keyword) || location.toLowerCase().includes(keyword)
  );
  
  const isHybrid = hybridKeywords.some(keyword => 
    tokens.includes(keyword) || description.toLowerCase().includes(keyword) || location.toLowerCase().includes(keyword)
  );

  let jobType = 'On-site';
  if (isRemote && !isHybrid) jobType = 'Remote';
  else if (isHybrid) jobType = 'Hybrid';

  return { jobType };
}

module.exports = { classifyJob };
