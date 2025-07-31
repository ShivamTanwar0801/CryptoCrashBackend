const express = require("express");
const router = express.Router();
const { getWallet } = require("../controllers/walletController");
const { getAllPlayers } = require("../controllers/playerInfoController");

router.get("/player", getAllPlayers);
router.get("/wallet/:playerId", getWallet);

module.exports = router;
