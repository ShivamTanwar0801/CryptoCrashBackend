const axios = require('axios');
let cache = {};

async function getPrice(currency) {
  const now = Date.now();
  currency = currency.toLowerCase();
  if (cache[currency] && now - cache[currency].timestamp < 10000) {
    return cache[currency].price;
  }
  const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${currency}&vs_currencies=usd`);
  const price = res.data[currency].usd;
  cache[currency] = { price, timestamp: now };
  return price;
}

module.exports = { getPrice };
