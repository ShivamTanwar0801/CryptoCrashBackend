const axios = require('axios');
let cache = {};

async function getPrice(currency) {
  const now = Date.now();
  currency = currency.toLowerCase();

  if (cache[currency] && now - cache[currency].timestamp < 10000) {
    return cache[currency].price;
  }

  try {
    const res = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${currency}&vs_currencies=usd`,
      {
        headers: {
          'User-Agent': 'CryptoCrashApp/1.0 (Render Server)',
          'Accept': 'application/json',
        },
      }
    );

    const price = res.data[currency]?.usd;
    if (price === undefined) throw new Error("Price not found in response");

    cache[currency] = { price, timestamp: now };
    return price;
  } catch (err) {
    console.error(`🔥 CoinGecko request failed for ${currency}:`, err.message);
    throw err;
  }
}

module.exports = { getPrice };
