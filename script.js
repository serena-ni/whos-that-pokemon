const img = document.getElementById("pokemonImg");
const wrap = document.getElementById("pokemonWrap");
const guessInput = document.getElementById("guessInput");
const feedback = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const triesEl = document.getElementById("tries");

const skipBtn = document.getElementById("skipBtn");
const guessBtn = document.getElementById("guessBtn");
const hintBtn = document.getElementById("hintBtn");
const dailyToggle = document.getElementById("dailyToggle");
const regionSelect = document.getElementById("regionSelect");

let currentPokemon = null;
let score = 0;
let tries = 0;
let dailyMode = false;

/* regions */

const regions = {
  kanto: [1, 151],
  johto: [152, 251],
  hoenn: [252, 386],
  sinnoh: [387, 493],
  unova: [494, 649],
  kalos: [650, 721],
  alola: [722, 809],
  galar: [810, 898],
  paldea: [899, 1017]
};

/* helpers */

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatName(name) {
  return name
    .split("-")
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join("-");
}

/* daily */

function getDailyId() {
  const today = new Date().toISOString().slice(0, 10);
  let seed = 0;
  for (const c of today) seed += c.charCodeAt(0);
  return (seed % 1017) + 1;
}

/* ID selection */

function getPokemonId() {
  if (dailyMode) return getDailyId();

  const region = regionSelect.value;
  if (region === "all") {
    return Math.floor(Math.random() * 1017) + 1;
  }
  const [min, max] = regions[region];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* game flow */

async function loadPokemon() {
  const id = getPokemonId();

  // reset visual + state
  wrap.classList.remove("revealed");
  wrap.classList.add("silhouette");

  feedback.textContent = "";
  guessInput.value = "";
  tries = 0;
  triesEl.textContent = "Tries: 0";
  hintBtn.disabled = true;
  currentPokemon = null;

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();

  currentPokemon = data;
  img.src = data.sprites.other["official-artwork"].front_default;
}

function reveal(correct) {
  wrap.classList.remove("silhouette");
  wrap.classList.add("revealed");

  if (correct) {
    score++;
    scoreEl.textContent = score;
  }
}

/* events */

guessBtn.onclick = () => {
  if (!currentPokemon) return;

  const guess = normalize(guessInput.value);
  const answer = normalize(currentPokemon.name);

  if (guess === answer) {
    reveal(true);
    feedback.textContent = `Correct! It's ${formatName(currentPokemon.name)}.`;
  } else {
    tries++;
    triesEl.textContent = `Tries: ${tries}`;
    feedback.textContent = "Not quite — try again.";

    if (tries >= 3) hintBtn.disabled = false;
  }
};

skipBtn.onclick = () => {
  loadPokemon();
};

hintBtn.onclick = () => {
  if (!currentPokemon) return;
  feedback.textContent =
    `Hint: starts with “${formatName(currentPokemon.name)[0]}”`;
};

dailyToggle.onchange = () => {
  dailyMode = dailyToggle.checked;
  loadPokemon();
};

regionSelect.onchange = () => {
  if (!dailyMode) loadPokemon();
};

/* start */

loadPokemon();
