const mongoose = require('mongoose');
const Player = require('../models/Player');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Player.deleteMany({});

  await Player.insertMany([
    { username: 'Alice', wallet: { bitcoin: 0.01, ethereum: 0.5 } },
    { username: 'Bob', wallet: { bitcoin: 0.005, ethereum: 0.3 } },
    { username: 'Charlie', wallet: { bitcoin: 0.02, ethereum: 1 } }
  ]);

  console.log('Seed complete');
  process.exit();
});
