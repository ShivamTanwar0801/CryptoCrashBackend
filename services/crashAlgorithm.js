const crypto = require('crypto');

function generateCrashPoint(seed, roundNumber) {
  const hash = crypto.createHash('sha256').update(seed + roundNumber).digest('hex');
  const hashNum = parseInt(hash.slice(0, 8), 16);
  return (1.0 + (hashNum % 12000) / 1000).toFixed(2);
}

module.exports = { generateCrashPoint };
