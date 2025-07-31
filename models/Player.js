const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  wallet: {
    bitcoin: { type: Number, default: 0 },
    ethereum: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('Player', playerSchema);
