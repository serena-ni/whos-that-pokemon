const pokemonImage = document.getElementById("pokemonImage");
const pokemonWrap = document.getElementById("pokemonWrap");
const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const hintBtn = document.getElementById("hintBtn");
const giveUpBtn = document.getElementById("giveUpBtn");
const nextBtn = document.getElementById("nextBtn");
const feedback = document.getElementById("feedback");
const hintsRemainingEl = document.getElementById("hintsRemaining");
const regionSelect = document.getElementById("regionSelect");

let currentPokemon = null;
let acceptedNames = [];
let hintsLeft = 3;
let revealed = false;

/* regions */

const REGIONS = {
  all: [1, 1025],
  kanto: [1, 151],
  johto: [152, 251],
  hoenn: [252, 386],
  sinnoh: [387, 493],
  unova: [494, 649],
  kalos: [650, 721],
  alola: [722, 809],
  galar: [810, 905],
  paldea: [906, 1025]
};

/* helpers */
function randomPokemonId() {
  const [min, max] = REGIONS[regionSelect.value];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function titleCase(name) {
  return name
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* load pokemon */
async function loadPokemon() {
  feedback.textContent = "";
  guessInput.value = "";
  hintsLeft = 3;
  revealed = false;
  hintsRemainingEl.textContent = `Hints: ${hintsLeft}`;

  pokemonWrap.classList.add("silhouette");
  pokemonWrap.classList.remove("revealed");

  const id = randomPokemonId();
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();

  currentPokemon = data;

  pokemonImage.src =
    data.sprites.other["official-artwork"].front_default ||
    data.sprites.front_default;

  const baseName = data.species.name.replace(/-/g, " ");
  acceptedNames = [
    normalize(baseName),
    normalize(data.species.name.split("-")[0])
  ];
}

/* guess */
function handleGuess() {
  if (!currentPokemon || revealed) return;

  const guess = normalize(guessInput.value);
  if (!guess) return;

  if (acceptedNames.includes(guess)) {
    revealPokemon(`Correct! It's ${titleCase(currentPokemon.species.name.split("-")[0])}.`);
    setTimeout(loadPokemon, 1200);
  } else {
    feedback.textContent = "Not quite — try again.";
  }
}

function revealPokemon(message) {
  revealed = true;
  pokemonWrap.classList.remove("silhouette");
  pokemonWrap.classList.add("revealed");
  feedback.textContent = message;
}

/* hints */
function giveHint() {
  if (!currentPokemon || revealed || hintsLeft <= 0) return;

  hintsLeft--;
  hintsRemainingEl.textContent = `Hints: ${hintsLeft}`;

  const name = currentPokemon.species.name.split("-")[0];

  if (hintsLeft === 2) {
    feedback.textContent = `Hint: Starts with "${name[0].toUpperCase()}"`;
  } else if (hintsLeft === 1) {
    const types = currentPokemon.types
      .map(t => titleCase(t.type.name))
      .join(" / ");
    feedback.textContent = `Hint: Type — ${types}`;
  } else {
    feedback.textContent = "Last hint used!";
  }
}

/* give up */
function giveUp() {
  if (!currentPokemon || revealed) return;
  revealPokemon(`It's ${titleCase(currentPokemon.species.name.split("-")[0])}.`);
}

/* events */
guessBtn.addEventListener("click", handleGuess);

guessInput.addEventListener("keydown", e => {
  if (e.key === "Enter") handleGuess();
});

hintBtn.addEventListener("click", giveHint);
giveUpBtn.addEventListener("click", giveUp);
nextBtn.addEventListener("click", loadPokemon);
regionSelect.addEventListener("change", loadPokemon);

/* init */
loadPokemon();
