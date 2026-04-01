let coinsUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1';
let globalUrl = 'https://api.coingecko.com/api/v3/global';

let allCoins = [];
let displayedCoins = [];
let marketInfo = null;
let sortBy = 'market_cap_desc';
let isFetching = false;

let overviewSection = document.getElementById('marketOverview');
let tableBody = document.getElementById('tableRows');

document.addEventListener('DOMContentLoaded', function () {
  console.log('App loaded');
  getData();
  setupButtons();
});

async function getData() {
  if (isFetching) return;
  isFetching = true;
  clearError();

  try {
    let coinsResponse = await fetch(coinsUrl);
    let globalResponse = await fetch(globalUrl);

    if (!coinsResponse.ok || !globalResponse.ok) {
      throw new Error('Bad response from API');
    }

    let coinsJson = await coinsResponse.json();
    let globalJson = await globalResponse.json();

    allCoins = coinsJson;
    displayedCoins = allCoins.slice();
    marketInfo = globalJson.data;

    console.log('Data fetched successfully');
    showMarketOverview();
    sortAndShow();

  } catch (err) {
    displayError('Could not load data.');
  }

  isFetching = false;
}

function showMarketOverview() {
  if (!marketInfo) return;

  const mcap = marketInfo.total_market_cap?.usd || 0;
  const volume = marketInfo.total_volume?.usd || 0;
  const btcDom = marketInfo.market_cap_percentage?.btc || 0;
  const active = marketInfo.active_cryptocurrencies || 0;

  overviewSection.innerHTML = `
    <div class="info-box slide-in" style="animation-delay: 0s">
      <div class="box-title">Total Market Cap</div>
      <div class="box-number">${makeBigNumber(mcap)}</div>
    </div>
    <div class="info-box slide-in" style="animation-delay: 0.1s">
      <div class="box-title">24h Volume</div>
      <div class="box-number">${makeBigNumber(volume)}</div>
    </div>
    <div class="info-box slide-in" style="animation-delay: 0.2s">
      <div class="box-title">BTC Dominance</div>
      <div class="box-number">${btcDom.toFixed(1)}%</div>
    </div>
    <div class="info-box slide-in" style="animation-delay: 0.3s">
      <div class="box-title">Active Cryptos</div>
      <div class="box-number">${active.toLocaleString()}</div>
    </div>`;
}

function sortAndShow() {
  let sorted = displayedCoins.slice();

  if (sortBy === 'market_cap_desc') {
    sorted.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
  } else if (sortBy === 'price_desc') {
    sorted.sort((a, b) => (b.current_price || 0) - (a.current_price || 0));
  } else if (sortBy === 'change_desc') {
    sorted.sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
  }

  displayedCoins = sorted;
  buildTable();
}

function buildTable() {
  let rows = displayedCoins.map((coin, i) => {
    const isPos = coin.price_change_percentage_24h >= 0;
    return `
      <tr class="slide-in" style="animation-delay: ${i * 0.05}s">
        <td class="rank-cell">${coin.market_cap_rank || i + 1}</td>
        <td>
          <div class="coin-info">
            <img src="${coin.image}" width="32" height="32">
            <span>${coin.name}</span>
          </div>
        </td>
        <td class="price-cell">${showPrice(coin.current_price)}</td>
        <td class="change-cell">
          <span class="percent-badge ${isPos ? 'positive' : 'negative'}">
            ${isPos ? '▲' : '▼'} ${Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
          </span>
        </td>
        <td class="mcap-cell">${makeBigNumber(coin.market_cap)}</td>
      </tr>`;
  });
  tableBody.innerHTML = rows.join('');
}

function setupButtons() {
  let sortButtons = document.querySelectorAll('.pill-btn');

  sortButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      sortButtons.forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      sortBy = btn.getAttribute('data-sort');
      console.log('Sort by:', sortBy);
    });
  });
}

function makeBigNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  if (num >= 1000000000000) return '$' + (num / 1000000000000).toFixed(2) + 'T';
  if (num >= 1000000000) return '$' + (num / 1000000000).toFixed(2) + 'B';
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
  return '$' + num.toLocaleString();
}

function showPrice(price) {
  if (price === null || price === undefined || isNaN(price)) return '—';
  if (price < 1) return '$' + price.toFixed(4);
  return '$' + price.toFixed(2);
}

function displayError(message) {
  console.error('Error:', message);
}

function clearError() {
  console.log('Error cleared');
}
