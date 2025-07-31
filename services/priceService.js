// services/priceService.js
const axios = require("axios");

let cache = {};

async function getPrices(currencies = []) {
  const now = Date.now();
  const cacheKey = currencies.sort().join(",");

  // If cached prices are fresh (within 10s), return
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < 10000) {
    return cache[cacheKey].data;
  }

  try {
    const res = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: currencies.join(","),
          vs_currencies: "usd",
        },
        headers: {
          "User-Agent": "CryptoCrashApp/1.0 (contact: your@email.com)",
          Accept: "application/json",
        },
      }
    );

    const data = res.data;
    cache[cacheKey] = { data, timestamp: now };
    return data;
  } catch (err) {
    console.error("🔥 CoinGecko bulk request failed:", err.message);
    throw new Error("Failed to fetch prices from CoinGecko");
  }
}

module.exports = { getPrices };
