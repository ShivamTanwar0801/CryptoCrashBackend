const Round = require("../models/Round");
const { generateCrashPoint } = require("./crashAlgorithm");

let ioInstance = null;
let currentRound = null;
let roundNumber = 1;
let interval = null;
let multiplier = 1.0;
let seed = "secure_seed_123";
const GROWTH_RATE = 0.05;

function socketService(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("cashout_request", async ({ playerId }) => {
      if (!currentRound) return;
      const bet = currentRound.bets.find(
        (b) => b.playerId === playerId && !b.cashedOut
      );
      if (bet) {
        const cryptoPayout = bet.cryptoAmount * multiplier;
        bet.cashedOut = true;
        bet.cashoutMultiplier = multiplier;

        io.emit("cashout", {
          playerId,
          cryptoPayout,
          usdEquivalent: "mocked",
        });
      }
    });
  });

  setInterval(() => {
    startNewRound(io);
  }, 10000);
}

async function startNewRound(io) {
  if (currentRound) {
    await Round.create(currentRound);
  }

  multiplier = 1.0;
  const crashPoint = parseFloat(generateCrashPoint(seed, roundNumber));
  currentRound = {
    roundNumber,
    crashPoint,
    seed,
    bets: [],
  };
  io.emit("round_start", { roundNumber, crashPoint });

  let timeElapsed = 0;
  if (interval) clearInterval(interval);
  interval = setInterval(async () => {
    timeElapsed += 0.1;
    multiplier = 1 + timeElapsed * GROWTH_RATE;
    multiplier = parseFloat(multiplier.toFixed(2));

    if (multiplier >= crashPoint) {
      clearInterval(interval);
      io.emit("round_crash", { roundNumber, crashPoint });
      return;
    }

    io.emit("multiplier_update", { multiplier });
  }, 100);
  roundNumber++;
}

function emitEvent(event, payload) {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
}

module.exports = {
  socketService,
  emitEvent,
  getCurrentRound: () => currentRound,
  addBetToCurrentRound: (bet) => {
    if (currentRound) {
      currentRound.bets.push(bet);
    }
  },
};
