const Player = require("../models/Player");
const Round = require("../models/Round");
const Transaction = require("../models/Transaction");
const { getPrices, SYMBOL_MAP } = require("../services/priceService");
const { generateTransactionHash } = require("../utils/cryptoUtils");
const {
  addBetToCurrentRound,
  getCurrentRound,
  emitEvent,
} = require("../services/socketService");

async function placeBet(req, res) {
  try {
    const { playerId, usdAmount, currency } = req.body;

    const prices = await getPrices();
    const symbol = SYMBOL_MAP[currency.toLowerCase()];
    const price = prices[symbol];

    if (!price) {
      return res
        .status(400)
        .json({ error: "Invalid currency or price unavailable" });
    }

    const cryptoAmount = usdAmount / price;

    const player = await Player.findById(playerId);
    if (!player || player.wallet[currency.toLowerCase()] < cryptoAmount) {
      return res
        .status(400)
        .json({ error: "Insufficient balance or invalid player" });
    }

    player.wallet[currency.toLowerCase()] -= cryptoAmount;
    await player.save();

    addBetToCurrentRound({
      playerId,
      usdAmount,
      cryptoAmount,
      currency,
      cashedOut: false,
      cashoutMultiplier: 0,
    });

    const currentRound = getCurrentRound();

    if (currentRound) {
      emitEvent("bet_placed", {
        playerId,
        usdAmount,
        cryptoAmount,
        currency,
        roundNumber: currentRound.roundNumber,
      });
    }

    const tx = new Transaction({
      playerId,
      usdAmount,
      cryptoAmount,
      currency,
      transactionType: "bet",
      transactionHash: generateTransactionHash(),
      priceAtTime: price,
    });
    await tx.save();

    res.json({
      success: true,
      cryptoAmount,
      currentRound: currentRound.roundNumber,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function cashOut(req, res) {
  try {
    const { playerId, roundNumber, multiplier, currency } = req.body;

    const round = getCurrentRound();
    if (!round || round.roundNumber !== roundNumber) {
      return res.status(404).json({ error: "Round not found or not active" });
    }

    const bet = round.bets.find(
      (b) => b.playerId.toString() === playerId && !b.cashedOut
    );
    if (!bet) return res.status(400).json({ error: "No active bet found" });

    if (parseFloat(multiplier) > parseFloat(round.crashPoint)) {
      return res.status(400).json({ error: "Game already crashed" });
    }

    const cryptoPayout = bet.cryptoAmount * multiplier;
    const player = await Player.findById(playerId);

    player.wallet[currency.toLowerCase()] += cryptoPayout;
    await player.save();

    bet.cashedOut = true;
    bet.cashoutMultiplier = multiplier;

    const prices = await getPrices();
    const symbol = SYMBOL_MAP[currency.toLowerCase()];
    const price = prices[symbol];

    if (!price) {
      return res.status(400).json({ error: "price not available for payout" });
    }

    const tx = new Transaction({
      playerId,
      usdAmount: cryptoPayout * price,
      cryptoAmount: cryptoPayout,
      currency,
      transactionType: "cashout",
      transactionHash: generateTransactionHash(),
      priceAtTime: price,
    });
    await tx.save();

    emitEvent("cashout", {
      playerId,
      cryptoPayout,
      currency,
      usdEquivalent: cryptoPayout * price,
      multiplier,
      roundNumber,
    });

    res.json({ success: true, cryptoPayout });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { placeBet, cashOut };
