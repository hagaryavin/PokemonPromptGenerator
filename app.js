const prompts = [
  "[ancient/future] paradox form of [pokemon]",
  "[pokemon]'s new evolution!",
  "[pokemon] as a [type]/[type] type",
  "[pokemon] in gen [1≤n≤9] style",
  "[pokemon]",
  "What! [evolution-chain] is evolving!",
  "[pokemon] uses [move]!",
  "Type: [type]/[type], Ability: [ability], Shape: [shape], Egg Group: [egg-group], Height: [height],<br> Color Palette: [RGB#hex]"
];

async function imagePrompt() {
  const randomPromptIndex = Math.floor(Math.random() * 5);
  const chosenPrompt = prompts[randomPromptIndex];
  const finalPrompt = await implementPrompt(chosenPrompt);
  document.getElementById('prompt').textContent = finalPrompt;
}
async function animationPrompt() {
  const randomPromptIndex = Math.floor(Math.random() * 3) + 4;
  const chosenPrompt = prompts[randomPromptIndex];
  const finalPrompt = await implementPrompt(chosenPrompt);
  document.getElementById('prompt').textContent = finalPrompt;
}
async function fokemonPrompt() {
  const chosenPrompt = prompts[7];
  const finalPrompt = await implementPrompt(chosenPrompt);
  document.getElementById('prompt').textContent = finalPrompt;
  highlightHexColors('prompt');
  const audio = new Audio('sounds/pkmncenter.ogg');
  audio.play();
  pokedex.innerHTML ="";
}
async function implementPrompt(text) {
  try {
    if (text.includes("[pokemon]")) {
      text = text.replace("[pokemon]", capitalize(await fetchRandomPokemon()));
    }
    if (text.includes("[type]/[type]")) {
      text = text.replace("[type]/[type]", await fetchRandomTypes());
    }
    if (text.includes("[1≤n≤9]")) {
      text = text.replace("[1≤n≤9]", fetchRandomOneToNine());
    }
    if (text.includes("[move]")) {
      text = text.replace("[move]", removeSpaces(await fetchRandomMove()));
    }
    if (text.includes("[evolution-chain]")) {
      text = text.replace("[evolution-chain]", capitalize(await fetchRandomEvolutionSpecies()));
    }
    if (text.includes("[ancient/future]")) {
      text = text.replace("[ancient/future]", fetchRandomAncientOrFuture());
    }
    if (text.includes("[ability]")) {
      text = text.replace("[ability]",removeSpaces(await fetchRandomAbility()));
    }
    if (text.includes("[shape]")) {
      text = text.replace("[shape]",await fetchRandomShape());
    }
    if (text.includes("[egg-group]")) {
        text = text.replace("[egg-group]",await fetchRandomEggGroup());
    }
    if (text.includes("[height]")) {
        text = text.replace("[height]",fetchRandomHeight());
    }
    if (text.includes("[RGB#hex]")) {
        text = text.replace("[RGB#hex]",fetchRandomColor(3,1));
    }
    return text;
  } catch (error) {
    console.error("Error in implementPrompt:", error);
    return "Failed to load Info.";
  }
}

async function fetchRandomPokemon() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0");
  const data = await response.json();
  const pokemons = data.results;
  const index = Math.floor(Math.random() * pokemons.length);
  const pokemonName = pokemons[index].name;
  await fetchPokemonCry(pokemons[index].url);
  await fetchPokemonPic(pokemons[index].url) 
  return pokemonName;
}

async function fetchPokemonCry(url) {
  const response = await fetch(url);
  const data = await response.json();
  const cryUrl = data.cries?.latest;
  if (cryUrl) {
    const audio = new Audio(cryUrl);
    audio.play();
  } else {
    console.log("No cry found for this Pokémon.");
  }
}
async function fetchPokemonPic(url) {
  const response = await fetch(url);
  const data = await response.json();
  const pokedex = document.getElementById("pokedex");
  const picUrl = data.sprites?.front_default;
  if (picUrl) {
          pokedex.innerHTML = `<img src="${picUrl}" alt="Displayed Image" style="max-width: 100%; height: auto;">`;
  } else {
    console.log("No pic found for this Pokémon.");
  }
}

async function fetchRandomTypes() {
  const response = await fetch("https://pokeapi.co/api/v2/type?limit=100000&offset=0");
  const data = await response.json();
  const types = data.results;
  const t1 = types[Math.floor(Math.random() * 18)].name;
  const t2 = types[Math.floor(Math.random() * 18)].name;
  return `${t1}/${t2}`;
}

async function fetchRandomMove() {
  const response = await fetch("https://pokeapi.co/api/v2/move?limit=100000&offset=0");
  const data = await response.json();
  const moves = data.results;
  const index = Math.floor(Math.random() * moves.length);
  return moves[index].name;
}
async function fetchRandomAbility() {
  const response = await fetch("https://pokeapi.co/api/v2/ability?limit=100000&offset=0");
  const data = await response.json();
  const abilities = data.results;
  const index = Math.floor(Math.random() * abilities.length);
  return abilities[index].name;
}
async function fetchRandomShape() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon-shape?limit=100000&offset=0");
  const data = await response.json();
  const shapes = data.results;
  const index = Math.floor(Math.random() * shapes.length);
  return shapes[index].name;
}
async function fetchRandomEggGroup() {
  const response = await fetch("https://pokeapi.co/api/v2/egg-group?limit=100000&offset=0");
  const data = await response.json();
  const eggGroups = data.results;
  const index = Math.floor(Math.random() * eggGroups.length);
  return eggGroups[index].name;
}
async function fetchRandomEvolutionSpecies() {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/evolution-chain?limit=100000&offset=0");
    const data = await response.json();
    const urls = data.results.map(entry => entry.url);
    let speciesName = null;
    while (!speciesName) {
      const url = urls[Math.floor(Math.random() * urls.length)];
      const evolutionResponse = await fetch(url);
      const evolutionData = await evolutionResponse.json();
      const chain = evolutionData.chain;
      if (chain && chain.evolves_to && chain.evolves_to.length > 0) {
        speciesName = chain.species?.name;
        await fetchPokemonPokedex(chain.species?.url)
      }
    }
    const audio = new Audio('sounds/pokemon-evolve.ogg');
    audio.play();
    return speciesName;
  } catch (error) {
    console.error("Error fetching evolution species:", error);
    return "Error fetching species";
  }
}
async function fetchPokemonPokedex(url) {
  const response = await fetch(url);
  const data = await response.json();
  const pokedex = document.getElementById("pokedex");
  const englishEntry = data.flavor_text_entries.find(entry => entry.language.name === "en");
  if (englishEntry) {
    var pokedexText=englishEntry.flavor_text;
    pokedexText=pokedexText.replace(/\f/g, " ");
    pokedexText=pokedexText.replace(". ", ".<br>")
    pokedex.innerHTML=pokedexText;
  } else {
    console.log("No English Pokédex entry found for this Pokémon.");
  }
}

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
function removeSpaces(name) {
  while(name.includes("-"))
    name=name.replace("-"," ");
  return name;
}

function fetchRandomOneToNine() {
  return Math.floor(Math.random() * 9) + 1;
}

function fetchRandomAncientOrFuture() {
  return Math.random() < 0.5 ? "Ancient" : "Future";
}
function fetchRandomColor(n,hex){
 function rndcol(hex){
  let col=[1,2,3].map(v=>Math.floor(Math.random()*256).toString(hex?16:10).padStart(hex?2:1,"0"));
  return hex?`#${col.join("")}`:`rgb(${col.join(",")})`;
 }
 return [...Array(n)].map(v=>rndcol(hex));
}
function fetchRandomHeight() {
  const min = 0.2;
  const max = 10.9;
  const height = Math.random() * (max - min) + min;
  return (parseFloat(height.toFixed(1)))+"m";
}
function highlightHexColors(elementId) {
    const hexPattern = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
    const label = document.getElementById(elementId);
    label.innerHTML = label.textContent.replace(hexPattern, match =>
      `<span class="color-span" style="color:${match}">${match}</span>`
    );
  }
 
