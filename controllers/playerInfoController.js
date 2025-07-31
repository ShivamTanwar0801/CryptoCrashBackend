// controllers/playerController.js
const Player = require("../models/Player");
const { getPrices } = require("../services/priceService");

async function getAllPlayers(req, res) {
  try {
    const players = await Player.find();
    const allCurrencies = new Set();

    // Collect all unique currencies
    players.forEach((p) => {
      Object.keys(p.wallet || {}).forEach((c) => {
        allCurrencies.add(c.toLowerCase());
      });
    });

    // Fetch prices in one request
    const priceData = await getPrices([...allCurrencies]);

    const result = players.map((player) => {
      const enrichedWallet = {};

      for (const currency of Object.keys(player.wallet || {})) {
        const amount = player.wallet[currency];
        const usd = priceData[currency.toLowerCase()]?.usd || 0;

        enrichedWallet[currency.toUpperCase()] = {
          amount,
          usd: parseFloat((amount * usd).toFixed(2)),
        };
      }

      return {
        playerId: player._id,
        wallet: enrichedWallet,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("❌ Failed in getAllPlayers:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getAllPlayers };
