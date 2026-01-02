// --------------------
// State
// --------------------
let countries = [];
let target = null;

// --------------------
// DOM Elements
// --------------------
const guessInput = document.getElementById("guess");
const datalist = document.getElementById("countries");
const history = document.getElementById("history");
const regionSelect = document.getElementById("region");
const submitBtn = document.getElementById("submit");

// --------------------
// Utility Math
// --------------------
function toRad(deg) {
  return deg * Math.PI / 180;
}

// Haversine distance (km)
function distanceKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) ** 2;

  return Math.round(2 * R * Math.asin(Math.sqrt(x)));
}

// Direction from one country to another
function direction(from, to) {
  const dLon = toRad(to.lon - from.lon);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const angle = Math.atan2(y, x) * 180 / Math.PI;
  const bearing = (angle + 360) % 360;

  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(bearing / 45) % 8];
}

// --------------------
// Game Setup
// --------------------
fetch("countries.json")
  .then(res => res.json())
  .then(data => {
    countries = data;
    startNewGame();
  });

function startNewGame() {
  history.innerHTML = "";
  guessInput.value = "";

  const region = regionSelect.value;

  const pool =
    region === "World"
      ? countries
      : countries.filter(c => c.continent === region);

  target = pool[Math.floor(Math.random() * pool.length)];

  // Populate autocomplete list
  datalist.innerHTML = "";
  pool.forEach(c => {
    const option = document.createElement("option");
    option.value = c.name;
    datalist.appendChild(option);
  });

  console.log("Target (for debugging):", target.name);
}

// --------------------
// Guess Handling
// --------------------
submitBtn.onclick = () => {
  const name = guessInput.value.trim();
  if (!name) return;

  const guess = countries.find(c => c.name === name);
  if (!guess) return;

  const li = document.createElement("li");

  if (guess.name === target.name) {
    li.textContent = `🎉 Correct! It was ${target.name}`;
    li.style.fontWeight = "bold";
  } else {
    const continentMatch =
      guess.continent === target.continent ? "✅" : "❌";

    const dist = distanceKm(guess, target);
    const dir = direction(guess, target);

    li.textContent =
      `${guess.name} — ` +
      `Continent: ${continentMatch}, ` +
      `Distance: ${dist} km, ` +
      `Direction: ${dir}`;
  }

  history.appendChild(li);
  guessInput.value = "";
};

// --------------------
// Region Change
// --------------------
regionSelect.onchange = startNewGame;
