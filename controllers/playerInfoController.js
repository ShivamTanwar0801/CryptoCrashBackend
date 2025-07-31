// controllers/playerController.js
const Player = require("../models/Player");
const { getPrices, SYMBOL_MAP } = require("../services/priceService");

async function getAllPlayers(req, res) {
  try {
    const players = await Player.find();
    const prices = await getPrices(); // One call for all prices
    const result = [];

    for (const player of players) {
      const wallet = player.wallet || {};
      const enrichedWallet = {};

      for (const currency of Object.keys(wallet)) {
        const amount = wallet[currency];
        const symbol = SYMBOL_MAP[currency.toLowerCase()];
        const price = prices[symbol] || 0;

        enrichedWallet[currency.toUpperCase()] = {
          amount,
          usd: parseFloat((amount * price).toFixed(2)),
        };
      }

      result.push({
        playerId: player._id,
        wallet: enrichedWallet,
      });
    }

    res.json(result);
  } catch (err) {
    console.error("❌ Failed in getAllPlayers:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { getAllPlayers };
