let coinsUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true';
let globalUrl = 'https://api.coingecko.com/api/v3/global';

let allCoins = [];
let displayedCoins = [];
let marketInfo = null;
let sortBy = 'market_cap_desc';
let isFetching = false;

let overviewSection = document.getElementById('marketOverview');
let tableBody = document.getElementById('tableRows');
let errorDiv = document.getElementById('errorBox');
let errorP = document.getElementById('errorText');
let reloadButton = document.getElementById('reloadBtn');

document.addEventListener('DOMContentLoaded', function () {
  showLoadingRows();
  getData();
  setupButtons();
});

function setupButtons() {
  let sortButtons = document.querySelectorAll('.pill-btn');

  sortButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      sortButtons.forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      sortBy = btn.getAttribute('data-sort');
      sortAndShow();
    });
  });

  reloadButton.addEventListener('click', function () {
    getData();
  });
}

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

    showMarketOverview();
    sortAndShow();
  } catch (err) {
    console.log('Error:', err);
    displayError('Could not load data. Click refresh to try again.');
  }

  isFetching = false;
}

function showMarketOverview() {
  if (!marketInfo) return;

  let totalMarketCap = 0;
  let totalVolume = 0;
  let btcDominance = 0;
  let numCryptos = 0;
  let dayChange = 0;

  if (marketInfo.total_market_cap && marketInfo.total_market_cap.usd) {
    totalMarketCap = marketInfo.total_market_cap.usd;
  }
  if (marketInfo.total_volume && marketInfo.total_volume.usd) {
    totalVolume = marketInfo.total_volume.usd;
  }
  if (marketInfo.market_cap_percentage && marketInfo.market_cap_percentage.btc) {
    btcDominance = marketInfo.market_cap_percentage.btc;
  }
  if (marketInfo.active_cryptocurrencies) {
    numCryptos = marketInfo.active_cryptocurrencies;
  }
  if (marketInfo.market_cap_change_percentage_24h_usd) {
    dayChange = marketInfo.market_cap_change_percentage_24h_usd;
  }

  let changeClass = 'going-down';
  let changeArrow = '▼';
  if (dayChange >= 0) {
    changeClass = 'going-up';
    changeArrow = '▲';
  }

  let html = '';

  html += '<div class="info-box slide-in" style="animation-delay:0s">';
  html += '<div class="box-title">Total Market Cap</div>';
  html += '<div class="box-number">' + makeBigNumber(totalMarketCap) + '</div>';
  html += '<div class="box-extra ' + changeClass + '">';
  html += changeArrow + ' ' + Math.abs(dayChange).toFixed(2) + '% (24h)';
  html += '</div>';
  html += '</div>';

  html += '<div class="info-box slide-in" style="animation-delay:0.05s">';
  html += '<div class="box-title">24h Volume</div>';
  html += '<div class="box-number">' + makeBigNumber(totalVolume) + '</div>';
  html += '</div>';

  html += '<div class="info-box slide-in" style="animation-delay:0.1s">';
  html += '<div class="box-title">BTC Dominance</div>';
  html += '<div class="box-number">' + btcDominance.toFixed(1) + '%</div>';
  html += '</div>';

  html += '<div class="info-box slide-in" style="animation-delay:0.15s">';
  html += '<div class="box-title">Active Cryptos</div>';
  html += '<div class="box-number">' + numCryptos.toLocaleString() + '</div>';
  html += '</div>';

  overviewSection.innerHTML = html;
}

function sortAndShow() {
  let sorted = displayedCoins.slice();

  if (sortBy === 'market_cap_desc') {
    sorted.sort(function (a, b) {
      return (b.market_cap || 0) - (a.market_cap || 0);
    });
  } else if (sortBy === 'price_desc') {
    sorted.sort(function (a, b) {
      return (b.current_price || 0) - (a.current_price || 0);
    });
  } else if (sortBy === 'change_desc') {
    sorted.sort(function (a, b) {
      return (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0);
    });
  } else if (sortBy === 'volume_desc') {
    sorted.sort(function (a, b) {
      return (b.total_volume || 0) - (a.total_volume || 0);
    });
  }

  displayedCoins = sorted;
  buildTable();
}

function buildTable() {
  let rows = displayedCoins.map(function (coin, i) {
    let change = coin.price_change_percentage_24h || 0;
    let isPositive = change >= 0;
    let arrow = '▼';
    let badgeClass = 'negative';
    if (isPositive) {
      arrow = '▲';
      badgeClass = 'positive';
    }
    let rank = coin.market_cap_rank || (i + 1);

    let row = '';
    row += '<tr class="slide-in" style="animation-delay:' + (i * 0.03) + 's">';
    row += '<td class="rank-cell">' + rank + '</td>';
    row += '<td>';
    row += '<div class="coin-info">';
    row += '<img src="' + coin.image + '" alt="' + coin.name + '" loading="lazy" width="32" height="32">';
    row += '<div>';
    row += '<span class="coin-title">' + coin.name + '</span>';
    row += '<span class="coin-ticker">' + coin.symbol + '</span>';
    row += '</div>';
    row += '</div>';
    row += '</td>';
    row += '<td class="price-cell">' + showPrice(coin.current_price) + '</td>';
    row += '<td class="change-cell">';
    row += '<span class="percent-badge ' + badgeClass + '">';
    row += arrow + ' ' + Math.abs(change).toFixed(2) + '%';
    row += '</span>';
    row += '</td>';
    row += '<td class="mcap-cell">' + makeBigNumber(coin.market_cap) + '</td>';
    row += '<td class="vol-cell">' + makeBigNumber(coin.total_volume) + '</td>';
    row += '</tr>';
    return row;
  });

  tableBody.innerHTML = rows.join('');
}

function showLoadingRows() {
  let fakeRows = [];

  for (let i = 0; i < 10; i++) {
    let row = '';
    row += '<tr class="fake-row">';
    row += '<td><div class="fake-cell" style="width:24px;margin:0 auto"></div></td>';
    row += '<td>';
    row += '<div class="fake-coin-cell">';
    row += '<div class="fake-circle"></div>';
    row += '<div class="fake-cell fake-text"></div>';
    row += '</div>';
    row += '</td>';
    row += '<td><div class="fake-cell" style="width:80px;margin-left:auto"></div></td>';
    row += '<td><div class="fake-cell" style="width:64px;margin-left:auto"></div></td>';
    row += '<td><div class="fake-cell" style="width:90px;margin-left:auto"></div></td>';
    row += '<td><div class="fake-cell" style="width:80px;margin-left:auto"></div></td>';
    row += '</tr>';
    fakeRows.push(row);
  }

  tableBody.innerHTML = fakeRows.join('');
}

function displayError(message) {
  errorP.textContent = message;
  errorDiv.classList.remove('not-visible');
}

function clearError() {
  errorDiv.classList.add('not-visible');
}

function makeBigNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';

  if (num >= 1000000000000) {
    return '$' + (num / 1000000000000).toFixed(2) + 'T';
  }
  if (num >= 1000000000) {
    return '$' + (num / 1000000000).toFixed(2) + 'B';
  }
  if (num >= 1000000) {
    return '$' + (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return '$' + (num / 1000).toFixed(1) + 'K';
  }

  return '$' + num.toFixed(2);
}

function showPrice(price) {
  if (price === null || price === undefined || isNaN(price)) return '—';

  if (price < 0.01) {
    return '$' + price.toFixed(6);
  }
  if (price < 1) {
    return '$' + price.toFixed(4);
  }
  return '$' + price.toFixed(2);
}
