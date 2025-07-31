const Player = require("../models/Player");
const { getPrice } = require("../services/priceService");

async function getAllPlayers(req, res) {
  try {
    const players = await Player.find();
    const result = [];

    for (const player of players) {
      const wallet = player.wallet || {};
      const enrichedWallet = {};

      for (const currency of Object.keys(wallet)) {
        const amount = wallet[currency];
        const price = await getPrice(currency.toLowerCase());

        if (!price || typeof price !== "number" || isNaN(price)) {
          enrichedWallet[currency.toUpperCase()] = {
            amount,
            usd: 0,
          };
        } else {
          enrichedWallet[currency.toUpperCase()] = {
            amount,
            usd: parseFloat((amount * price).toFixed(2)),
          };
        }
      }

      result.push({
        playerId: player._id,
        wallet: enrichedWallet,
      });
    }
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
module.exports = { getAllPlayers };
