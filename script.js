const imgEl = document.getElementById("pokemonImg");
const wrapEl = document.getElementById("pokemonWrap");
const guessInput = document.getElementById("guessInput");
const feedbackEl = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const regionSelect = document.getElementById("regionSelect");
const regionLabel = document.getElementById("regionLabel");
const dailyToggle = document.getElementById("dailyToggle");

let currentPokemon = null;
let score = 0;
let attempts = 0;

const generations = {
  all: [1, 1025],
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1025],
};

const regionNames = {
  all: "All Regions",
  1: "Kanto",
  2: "Johto",
  3: "Hoenn",
  4: "Sinnoh",
  5: "Unova",
  6: "Kalos",
  7: "Alola",
  8: "Galar",
  9: "Paldea",
};

for (const key in regionNames) {
  const opt = document.createElement("option");
  opt.value = key;
  opt.textContent = regionNames[key];
  regionSelect.appendChild(opt);
}

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function dailyPokemonId() {
  const today = new Date().toISOString().slice(0, 10);
  const seed = Number(today.replaceAll("-", ""));
  const [start, end] = generations[regionSelect.value];
  return Math.floor(seededRandom(seed) * (end - start + 1)) + start;
}

function randomPokemonId() {
  const [start, end] = generations[regionSelect.value];
  return Math.floor(Math.random() * (end - start + 1)) + start;
}

async function loadPokemon() {
  attempts = 0;
  feedbackEl.textContent = "";
  guessInput.value = "";
  wrapEl.classList.remove("revealed");

  const id = dailyToggle.checked
    ? dailyPokemonId()
    : randomPokemonId();

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();

  currentPokemon = data;
  imgEl.src = data.sprites.other["official-artwork"].front_default;
  regionLabel.textContent = regionNames[regionSelect.value];
}

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function showHint() {
  const firstLetter = currentPokemon.name[0].toUpperCase();
  feedbackEl.textContent = `Hint: starts with “${firstLetter}”`;
}

function checkGuess() {
  if (!currentPokemon) return;

  const guess = normalize(guessInput.value);
  const answer = normalize(currentPokemon.name);
  if (!guess) return;

  attempts++;

  if (guess === answer) {
    score++;
    scoreEl.textContent = score;
    feedbackEl.textContent = `Correct! It's ${currentPokemon.name}.`;
    wrapEl.classList.add("revealed");

    if (!dailyToggle.checked) {
      setTimeout(loadPokemon, 1200);
    }
  } else {
    if (attempts === 3) {
      showHint();
    } else {
      feedbackEl.textContent = "Not quite — try again.";
    }
  }
}

document.getElementById("guessBtn").onclick = checkGuess;
document.getElementById("skipBtn").onclick = loadPokemon;

guessInput.addEventListener("keydown", e => {
  if (e.key === "Enter") checkGuess();
});

regionSelect.addEventListener("change", loadPokemon);
dailyToggle.addEventListener("change", loadPokemon);

loadPokemon();
