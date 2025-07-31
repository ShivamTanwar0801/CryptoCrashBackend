const axios = require("axios");

const API_KEY = process.env.CMC_API_KEY;
const BASE_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";

const SYMBOL_MAP = {
  bitcoin: "BTC",
  ethereum: "ETH",
};

let cache = {
  data: {},
  timestamp: 0,
};

async function getPrices() {
  const now = Date.now();
  const CACHE_DURATION = 10 * 1000; // 10 seconds

  if (cache.data && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  try {
    const symbols = Object.values(SYMBOL_MAP).join(",");
    const res = await axios.get(`${BASE_URL}?symbol=${symbols}&convert=USD`, {
      headers: {
        "X-CMC_PRO_API_KEY": API_KEY,
      },
    });

    const prices = {};
    for (const [key, value] of Object.entries(res.data.data)) {
      prices[key] = parseFloat(value.quote.USD.price);
    }

    cache = {
      data: prices,
      timestamp: now,
    };

    return prices;
  } catch (err) {
    console.error("🔥 CoinMarketCap bulk request failed:", err.message);
    throw new Error("Failed to fetch prices from CoinMarketCap");
  }
}

module.exports = { getPrices, SYMBOL_MAP };
