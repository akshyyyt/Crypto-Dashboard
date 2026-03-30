let allCoins = [];
let displayedCoins = [];
let sortBy = 'market_cap_desc';

let overviewSection = document.getElementById('marketOverview');
let tableBody = document.getElementById('tableRows');

document.addEventListener('DOMContentLoaded', function () {
  console.log('App loaded');
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
