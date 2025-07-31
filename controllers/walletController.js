const Player = require('../models/Player');
const { getPrice } = require('../services/priceService');

async function getWallet(req, res) {
  try {
    const player = await Player.findById(req.params.playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const btcPrice = await getPrice('bitcoin');
    const ethPrice = await getPrice('ethereum');

    res.json({
      BTC: {
        amount: player.wallet.bitcoin,
        usd: player.wallet.bitcoin * btcPrice
      },
      ETH: {
        amount: player.wallet.ethereum,
        usd: player.wallet.ethereum * ethPrice
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getWallet };
