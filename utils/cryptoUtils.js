const crypto = require('crypto');

function generateTransactionHash() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = { generateTransactionHash };
