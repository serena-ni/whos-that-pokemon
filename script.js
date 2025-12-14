const img = document.getElementById("pokemon-img");
const wrap = document.querySelector(".pokemon-wrap");
const input = document.getElementById("guess-input");
const feedback = document.getElementById("feedback");
const stats = document.getElementById("stats");
const regionSelect = document.getElementById("region");

const guessBtn = document.getElementById("guess-btn");
const nextBtn = document.getElementById("next-btn");
const hintBtn = document.getElementById("hint-btn");

let currentName = "";
let currentTypes = [];
let currentGen = 1;
let revealed = false;
let hintsUsed = 0;

/* region ranges */
const regions = {
  kanto: [1, 151],
  johto: [152, 251],
  hoenn: [252, 386],
  sinnoh: [387, 493],
  unova: [494, 649],
  kalos: [650, 721],
  alola: [722, 809],
  galar: [810, 898],
  paldea: [899, 1010]
};

/* random id by region */
function randomId() {
  const r = regionSelect.value;
  if (r === "all") return Math.floor(Math.random() * 1010) + 1;

  const [min, max] = regions[r];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* load pokemon */
async function loadPokemon() {
  revealed = false;
  hintsUsed = 0;
  feedback.textContent = "";
  stats.textContent = "Hints: 3";
  input.value = "";
  input.disabled = false;
  input.focus();

  wrap.classList.add("silhouette");
  wrap.classList.remove("revealed");

  const id = randomId();
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();

  currentName = data.name;
  currentTypes = data.types.map(t => t.type.name);
  currentGen = getGeneration(id);
  img.src = data.sprites.other["official-artwork"].front_default;
}

/* generation by ID */
function getGeneration(id) {
  for (const r in regions) {
    const [min, max] = regions[r];
    if (id >= min && id <= max) return r;
  }
  return "Unknown";
}

/* normalize */
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z]/g, "");
}

/* reveal */
function reveal(correct) {
  revealed = true;
  input.disabled = true;
  wrap.classList.remove("silhouette");
  wrap.classList.add("revealed");

  const name = currentName[0].toUpperCase() + currentName.slice(1);

  feedback.textContent = correct
    ? `Correct! It's ${name}.`
    : `It's ${name}.`;

  // auto-next after 1.5s
  if (correct) setTimeout(loadPokemon, 1500);
}

/* guess */
function guess() {
  if (revealed) return;
  const g = normalize(input.value);
  const a = normalize(currentName);

  if (!g) return;

  if (g === a) {
    reveal(true);
  } else {
    feedback.textContent = "Not quite — try again.";
  }
}

/* hint */
function hint() {
  if (revealed || hintsUsed >= 3) return;
  hintsUsed++;

  let text;
  if (hintsUsed === 1) text = `Starts with "${currentName[0].toUpperCase()}"`;
  else if (hintsUsed === 2) text = `Type: ${currentTypes.join(", ")}`;
  else text = `Generation: ${currentGen[0].toUpperCase() + currentGen.slice(1)}`;

  feedback.textContent = text;
  stats.textContent = `Hints: ${3 - hintsUsed}`;
}

/* events */
guessBtn.onclick = guess;
nextBtn.onclick = loadPokemon;
hintBtn.onclick = hint;
regionSelect.onchange = loadPokemon;

input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    revealed ? loadPokemon() : guess();
  }
});

/* init */
loadPokemon();
