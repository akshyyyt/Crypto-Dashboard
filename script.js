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
