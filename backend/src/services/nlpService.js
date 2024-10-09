const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
const remoteKeywords = ['remote', 'work from home', 'telecommute', 'virtual'];
const kentuckyKeywords = ['kentucky', 'ky', 'louisville', 'lexington', 'bowling green'];

function classifyJob(description, location) {
  const tokens = tokenizer.tokenize((description + ' ' + location).toLowerCase());
  
  const isRemote = remoteKeywords.some(keyword => 
    tokens.includes(keyword) || description.toLowerCase().includes(keyword)
  );
  
  const isKentucky = kentuckyKeywords.some(keyword => 
    tokens.includes(keyword) || description.toLowerCase().includes(keyword) || location.toLowerCase().includes(keyword)
  );

  return { isRemote, isKentucky };
}

module.exports = { classifyJob };
