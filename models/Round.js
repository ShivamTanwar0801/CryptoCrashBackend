const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  roundNumber: Number,
  crashPoint: Number,
  seed: String,
  bets: [{
    playerId: mongoose.Schema.Types.ObjectId,
    cryptoAmount: Number,
    usdAmount: Number,
    currency: String,
    cashedOut: Boolean,
    cashoutMultiplier: Number
  }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Round', roundSchema);
