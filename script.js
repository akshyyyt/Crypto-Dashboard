let coinsUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1';
let globalUrl = 'https://api.coingecko.com/api/v3/global';

let allCoins = [];
let displayedCoins = [];
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
    console.log('Data fetched successfully');

  } catch (err) {
    displayError('Could not load data.');
  }

  isFetching = false;
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
