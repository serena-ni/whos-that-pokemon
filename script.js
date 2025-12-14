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

const regions = {
  kanto: [1,151], johto: [152,251], hoenn: [252,386],
  sinnoh: [387,493], unova: [494,649], kalos: [650,721],
  alola: [722,809], galar: [810,898], paldea: [899,1017]
};

/* helpers */

const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const formatName = n =>
  n.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join("-");

const todayKey = () =>
  `daily-solved-${new Date().toISOString().slice(0,10)}`;

/* daily */

function dailyId() {
  const d = new Date().toISOString().slice(0,10);
  return ([...d].reduce((a,c)=>a+c.charCodeAt(0),0) % 1017) + 1;
}

/* ID selection */

function getPokemonId() {
  if (dailyMode) return dailyId();
  const r = regionSelect.value;
  if (r === "all") return Math.floor(Math.random()*1017)+1;
  const [min,max] = regions[r];
  return Math.floor(Math.random()*(max-min+1))+min;
}

/* game flow */

async function loadPokemon() {
  wrap.classList.remove("revealed");
  wrap.classList.add("silhouette");

  feedback.textContent = "";
  guessInput.value = "";
  tries = 0;
  triesEl.textContent = "Tries: 0";
  hintBtn.disabled = true;

  guessInput.disabled = false;
  skipBtn.disabled = false;
  guessBtn.disabled = false;

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${getPokemonId()}`);
  currentPokemon = await res.json();

  img.src = currentPokemon.sprites.other["official-artwork"].front_default;

  if (dailyMode && localStorage.getItem(todayKey())) {
    lockDailySolved();
  }
}

function reveal(correct) {
  wrap.classList.remove("silhouette");
  wrap.classList.add("revealed");

  if (correct) {
    score++;
    scoreEl.textContent = score;
  }
}

/* hint system */

function progressiveHint() {
  if (!currentPokemon) return "";

  if (tries === 3) {
    return `Hint: starts with “${formatName(currentPokemon.name)[0]}”`;
  }
  if (tries === 4) {
    return `Hint: type — ${currentPokemon.types.map(t=>t.type.name).join(", ")}`;
  }
  if (tries >= 5) {
    return `Hint: generation ${Math.ceil(currentPokemon.id / 151)}`;
  }
  return "";
}

/* daily lock */

function lockDailySolved() {
  feedback.textContent = "You’ve solved today’s Pokémon 🌤️";
  guessInput.disabled = true;
  guessBtn.disabled = true;
  skipBtn.disabled = true;
  hintBtn.disabled = true;
}

/* events */

guessBtn.onclick = () => {
  if (!currentPokemon) return;

  const guess = normalize(guessInput.value);
  const answer = normalize(currentPokemon.name);

  if (guess === answer) {
    reveal(true);
    feedback.textContent = `Correct! It’s ${formatName(currentPokemon.name)}.`;

    if (dailyMode) {
      localStorage.setItem(todayKey(), "true");
      lockDailySolved();
    }
    return;
  }

  tries++;
  triesEl.textContent = `Tries: ${tries}`;

  const hint = progressiveHint();
  feedback.textContent = hint || "Not quite — try again.";

  if (tries >= 3) hintBtn.disabled = false;
};

hintBtn.onclick = () => {
  feedback.textContent = progressiveHint();
};

skipBtn.onclick = loadPokemon;

dailyToggle.onchange = () => {
  dailyMode = dailyToggle.checked;
  loadPokemon();
};

regionSelect.onchange = () => {
  if (!dailyMode) loadPokemon();
};

/* start */

loadPokemon();
