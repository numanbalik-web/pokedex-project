const pokeContainer = document.getElementById("pokeContainer");
const searchInput = document.getElementById("searchInput");
const statusText = document.getElementById("status");

const POKEMON_COUNT = 151;
let pokemonList = [];

const typeIcons = {
  grass: "fa-leaf",
  fire: "fa-fire",
  water: "fa-droplet",
  bug: "fa-bug",
  normal: "fa-circle",
  poison: "fa-skull-crossbones",
  electric: "fa-bolt",
  ground: "fa-mountain",
  fairy: "fa-wand-sparkles",
  fighting: "fa-hand-fist",
  psychic: "fa-brain",
  rock: "fa-gem",
  ghost: "fa-ghost",
  ice: "fa-snowflake",
  dragon: "fa-dragon",
  dark: "fa-moon",
  steel: "fa-shield-halved",
  flying: "fa-dove",
};

async function fetchPokemonList() {
  try {
    statusText.textContent = "Loading Pokémon...";

    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${POKEMON_COUNT}`,
    );

    if (!response.ok) {
      throw new Error("Pokemon list could not be fetched.");
    }

    const data = await response.json();

    const pokemonPromises = data.results.map((pokemon) =>
      fetchPokemonDetails(pokemon.url),
    );

    pokemonList = await Promise.all(pokemonPromises);

    renderPokemonCards(pokemonList);
    statusText.textContent = `${pokemonList.length} Pokémon loaded.`;
  } catch (error) {
    statusText.textContent = "An error occurred while loading Pokémon.";
    console.error(error);
  }
}

async function fetchPokemonDetails(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Pokemon details could not be fetched.");
  }

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    image:
      data.sprites.other["official-artwork"].front_default ||
      data.sprites.front_default,
    types: data.types.map((item) => item.type.name),
    height: data.height / 10,
    weight: data.weight / 10,
    baseExp: data.base_experience ?? "?",
  };
}

function renderPokemonCards(pokemons) {
  pokeContainer.innerHTML = "";

  if (pokemons.length === 0) {
    statusText.textContent = "No Pokémon found.";
    return;
  }

  statusText.textContent = `${pokemons.length} Pokémon found.`;

  pokemons.forEach((pokemon) => {
    const card = document.createElement("article");

    const mainType = pokemon.types[0];
    const iconClass = typeIcons[mainType] || "fa-star";

    card.className = `pokemon ${mainType}`;

    card.innerHTML = `
      <div class="image-container">
        <img src="${pokemon.image}" alt="${pokemon.name}" loading="lazy" />
      </div>

      <div class="poke-info">
        <span class="poke-id">#${String(pokemon.id).padStart(3, "0")}</span>
        <h3 class="poke-name">${pokemon.name}</h3>

        <div class="poke-meta">
          <span><i class="fa-solid fa-flask"></i> ${pokemon.baseExp} Exp</span>
          <span><i class="fa-solid fa-weight-hanging"></i> ${pokemon.weight} kg</span>
        </div>

        <div class="poke-type">
          <i class="fa-solid ${iconClass}"></i>
          ${pokemon.types.join(", ")}
        </div>
      </div>
    `;

    pokeContainer.appendChild(card);
  });
}

function filterPokemon() {
  const searchValue = searchInput.value.trim().toLowerCase();

  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchName = pokemon.name.toLowerCase().includes(searchValue);
    const matchId = String(pokemon.id).includes(searchValue);
    const matchType = pokemon.types.some((type) =>
      type.toLowerCase().includes(searchValue),
    );

    return matchName || matchId || matchType;
  });

  renderPokemonCards(filteredPokemon);
}

searchInput.addEventListener("input", filterPokemon);

fetchPokemonList();
