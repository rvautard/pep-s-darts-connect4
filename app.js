const TRANSLATIONS = {
  fr: {
    kickerText: "NOUVEAU MATCH",
    title: "Soiree Flechettes + Puissance 4",
    subtitle: "Lance la partie en quelques secondes. Choisis les joueurs, leurs noms, puis appuie sur Demarrer la partie.",
    configTitle: "Configuration joueurs",
    configSubtitle: "De 1 a 8 joueurs",
    playerCountLabel: "Nombre de joueurs",
    playerLabel: (n) => `Joueur ${n}`,
    playerPlaceholder: (n) => `Nom du joueur ${n}`,
    startButton: "Demarrer la partie",
    errorEmpty: "Chaque joueur doit avoir un nom.",
    errorDuplicate: "Les noms des joueurs doivent etre differents.",
  },
  en: {
    kickerText: "NEW MATCH",
    title: "Darts + Connect 4 Night",
    subtitle: "Start the game in seconds. Choose your players, give them names, then click Start Game.",
    configTitle: "Player Setup",
    configSubtitle: "1 to 8 players",
    playerCountLabel: "Number of players",
    playerLabel: (n) => `Player ${n}`,
    playerPlaceholder: (n) => `Player ${n} name`,
    startButton: "Start Game",
    errorEmpty: "Each player must have a name.",
    errorDuplicate: "Player names must be different.",
  },
};

let currentLanguage = localStorage.getItem("gameLanguage") || "fr";

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem("gameLanguage", lang);
  document.documentElement.lang = lang;
  translatePage();
}

function t(key, ...args) {
  const translation = TRANSLATIONS[currentLanguage];
  if (typeof translation[key] === "function") {
    return translation[key](...args);
  }
  return translation[key] || TRANSLATIONS.fr[key];
}

function translatePage() {
  document.querySelector(".kicker").textContent = t("kickerText");
  document.querySelector("h1").textContent = t("title");
  document.querySelector(".subtitle").textContent = t("subtitle");
  document.querySelector(".setup-head h2").textContent = t("configTitle");
  document.querySelector(".setup-head p").textContent = t("configSubtitle");
  document.querySelector(".field-label").textContent = t("playerCountLabel");
  document.getElementById("start-game-btn").textContent = t("startButton");

  const fields = playersContainer.querySelectorAll(".player-field");
  fields.forEach((field, index) => {
    const label = field.querySelector("label");
    const input = field.querySelector("input");
    label.textContent = t("playerLabel", index + 1);
    input.placeholder = t("playerPlaceholder", index + 1);
  });
}

const playerCountSelect = document.getElementById("player-count");
const playersContainer = document.getElementById("players-container");
const startGameButton = document.getElementById("start-game-btn");
const statusMessage = document.getElementById("status-message");
const languageSelect = document.getElementById("language-select");

function createPlayerFields(count) {
  playersContainer.innerHTML = "";

  for (let i = 1; i <= count; i += 1) {
    const wrapper = document.createElement("div");
    wrapper.className = "player-field";

    const label = document.createElement("label");
    label.setAttribute("for", `player-name-${i}`);
    label.textContent = t("playerLabel", i);

    const input = document.createElement("input");
    input.className = "input-control";
    input.type = "text";
    input.id = `player-name-${i}`;
    input.maxLength = 18;
    input.placeholder = t("playerPlaceholder", i);
    input.value = t("playerLabel", i);

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    playersContainer.appendChild(wrapper);
  }
}

function sanitizePlayerNames() {
  const inputs = playersContainer.querySelectorAll("input");
  const names = [];
  const seen = new Set();

  for (const input of inputs) {
    const trimmedName = input.value.trim();

    if (!trimmedName) {
      return {
        ok: false,
        message: t("errorEmpty"),
      };
    }

    const lowered = trimmedName.toLowerCase();
    if (seen.has(lowered)) {
      return {
        ok: false,
        message: t("errorDuplicate"),
      };
    }

    seen.add(lowered);
    names.push(trimmedName);
  }

  return {
    ok: true,
    names,
  };
}

function setStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.classList.remove("ok", "error");
  if (type) {
    statusMessage.classList.add(type);
  }
}

languageSelect.value = currentLanguage;
languageSelect.addEventListener("change", (event) => {
  setLanguage(event.target.value);
});

playerCountSelect.addEventListener("change", (event) => {
  const value = Number(event.target.value);
  createPlayerFields(value);
  setStatus("", null);
});

startGameButton.addEventListener("click", () => {
  const result = sanitizePlayerNames();

  if (!result.ok) {
    setStatus(result.message, "error");
    return;
  }

  const setup = {
    createdAt: new Date().toISOString(),
    playerCount: result.names.length,
    players: result.names,
    language: currentLanguage,
  };

  localStorage.setItem("gameSetup", JSON.stringify(setup));

  setTimeout(() => {
    window.location.href = "game.html";
  }, 300);
});

createPlayerFields(Number(playerCountSelect.value));
translatePage();
