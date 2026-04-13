const ROWS = 4;
const COLS = 4;
const MAX_TOUCHES = 3;
const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, "B"];

const GAME_TRANSLATIONS = {
  fr: {
    gameTitle: "Partie en cours",
    backButton: "← Menu",
    playersTitle: "Joueurs",
    undoButton: "↶ Annuler",
    nextButton: "Joueur suivant",
    playAgainButton: "Rejouer",
    menuButton: "Retour au menu",
    currentPlayerTurn: (name) => `Tour de ${name}`,
    casesLeft: (n) => `${n} case${n > 1 ? "s" : ""} à sélectionner`,
    ownedCases: (n) => `${n} case${n > 1 ? "s" : ""}`,
    winnerMessage: (name) => `🎉 ${name} a gagné! 🎉`,
    winnerMessageEn: (name) => `🎉 ${name} won! 🎉`,
  },
  en: {
    gameTitle: "Game in progress",
    backButton: "← Menu",
    playersTitle: "Players",
    undoButton: "↶ Undo",
    nextButton: "Next Player",
    playAgainButton: "Play Again",
    menuButton: "Back to Menu",
    currentPlayerTurn: (name) => `${name}'s turn`,
    casesLeft: (n) => `${n} case${n > 1 ? "s" : ""} to select`,
    ownedCases: (n) => `${n} case${n > 1 ? "s" : ""}`,
    winnerMessage: (name) => `🎉 ${name} won! 🎉`,
    winnerMessageEn: (name) => `🎉 ${name} won! 🎉`,
  },
};

let currentLanguage = localStorage.getItem("gameLanguage") || "fr";

function setGameLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem("gameLanguage", lang);
  document.documentElement.lang = lang;
  translateGameUI();
}

function tGame(key, ...args) {
  const translation = GAME_TRANSLATIONS[currentLanguage];
  if (typeof translation[key] === "function") {
    return translation[key](...args);
  }
  return translation[key] || GAME_TRANSLATIONS.fr[key];
}

function translateGameUI() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = tGame(key);
  });
}

class GameState {
  constructor(players) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.board = this.initBoard();
    this.touches = this.initTouches();
    this.ownership = this.initOwnership();
    this.gameOver = false;
    this.winner = null;
    this.currentPlayerTouches = 0;
    this.lastTouchCell = null;
  }

  initBoard() {
    const shuffled = [...VALUES].sort(() => Math.random() - 0.5);
    return shuffled;
  }

  initTouches() {
    const touches = Array(ROWS * COLS)
      .fill(null)
      .map(() => ({}));

    for (let i = 0; i < ROWS * COLS; i += 1) {
      for (let p = 0; p < this.players.length; p += 1) {
        touches[i][p] = 0;
      }
    }

    return touches;
  }

  initOwnership() {
    return Array(ROWS * COLS).fill(null);
  }

  getCellIndex(row, col) {
    return row * COLS + col;
  }

  getRowCol(index) {
    return [Math.floor(index / COLS), index % COLS];
  }

  touchCell(cellIndex) {
    if (this.gameOver) return { success: false };
    if (this.ownership[cellIndex] !== null) return { success: false };

    const playerIndex = this.currentPlayerIndex;
    this.touches[cellIndex][playerIndex] += 1;
    this.currentPlayerTouches += 1;
    this.lastTouchCell = cellIndex;

    let shouldAutoNext = false;

    if (this.touches[cellIndex][playerIndex] === MAX_TOUCHES) {
      this.ownership[cellIndex] = playerIndex;
      const result = this.checkWin(playerIndex);
      if (result.won) {
        this.gameOver = true;
        this.winner = playerIndex;
        return { success: true, gameWon: true };
      }
    }

    if (this.currentPlayerTouches === MAX_TOUCHES) {
      shouldAutoNext = true;
    }

    return { success: true, shouldAutoNext };
  }

  undoLastTouch() {
    if (this.lastTouchCell === null || this.gameOver) return false;

    const playerIndex = this.currentPlayerIndex;
    const cellIndex = this.lastTouchCell;

    if (this.touches[cellIndex][playerIndex] === 0) return false;

    this.touches[cellIndex][playerIndex] -= 1;
    this.currentPlayerTouches -= 1;

    if (this.ownership[cellIndex] === playerIndex) {
      this.ownership[cellIndex] = null;
    }

    this.lastTouchCell = null;
    return true;
  }

  checkWin(playerIndex) {
    for (let row = 0; row < ROWS; row += 1) {
      let rowWin = true;
      for (let col = 0; col < COLS; col += 1) {
        if (this.ownership[this.getCellIndex(row, col)] !== playerIndex) {
          rowWin = false;
          break;
        }
      }
      if (rowWin) {
        return { won: true, type: "row", index: row };
      }
    }

    for (let col = 0; col < COLS; col += 1) {
      let colWin = true;
      for (let row = 0; row < ROWS; row += 1) {
        if (this.ownership[this.getCellIndex(row, col)] !== playerIndex) {
          colWin = false;
          break;
        }
      }
      if (colWin) {
        return { won: true, type: "col", index: col };
      }
    }

    let diagWin = true;
    for (let i = 0; i < ROWS; i += 1) {
      if (this.ownership[this.getCellIndex(i, i)] !== playerIndex) {
        diagWin = false;
        break;
      }
    }
    if (diagWin) {
      return { won: true, type: "diag", index: 0 };
    }

    diagWin = true;
    for (let i = 0; i < ROWS; i += 1) {
      if (this.ownership[this.getCellIndex(i, COLS - 1 - i)] !== playerIndex) {
        diagWin = false;
        break;
      }
    }
    if (diagWin) {
      return { won: true, type: "diag", index: 1 };
    }

    return { won: false };
  }

  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.currentPlayerTouches = 0;
    this.lastTouchCell = null;
  }
}

let gameState = null;

function loadGameSetup() {
  const setup = localStorage.getItem("gameSetup");
  if (!setup) {
    window.location.href = "index.html";
    return null;
  }
  const parsedSetup = JSON.parse(setup);
  if (parsedSetup.language) {
    setGameLanguage(parsedSetup.language);
  }
  return parsedSetup;
}

function initGame() {
  const setup = loadGameSetup();
  gameState = new GameState(setup.players);
  renderBoard();
  updatePlayersStatus();
  updateCurrentPlayerStatus();
}

function renderBoard() {
  const boardEl = document.getElementById("game-board");
  boardEl.innerHTML = "";

  for (let i = 0; i < ROWS * COLS; i += 1) {
    const cell = document.createElement("div");
    cell.className = "board-cell";

    const isOwned = gameState.ownership[i] !== null;
    if (isOwned) {
      cell.classList.add("disabled");
    }

    const value = gameState.board[i];
    const valueEl = document.createElement("div");
    valueEl.className = "cell-value";
    valueEl.textContent = value;
    cell.appendChild(valueEl);

    const indicatorEl = document.createElement("div");
    indicatorEl.className = "cell-indicator";

    for (let p = 0; p < gameState.players.length; p += 1) {
      const touches = gameState.touches[i][p];
      if (touches > 0) {
        const marker = document.createElement("div");
        marker.className = `touch-marker player-${p + 1}`;
        marker.textContent = touches;
        indicatorEl.appendChild(marker);
      }
    }

    cell.appendChild(indicatorEl);

    if (isOwned) {
      const badgeEl = document.createElement("div");
      const ownerIndex = gameState.ownership[i];
      badgeEl.className = `ownership-badge player-${ownerIndex + 1}`;
      badgeEl.textContent = ownerIndex + 1;
      badgeEl.title = `Possédée par ${gameState.players[ownerIndex]}`;
      cell.appendChild(badgeEl);
    }

    cell.addEventListener("click", () => {
      if (!isOwned && !gameState.gameOver) {
        const result = gameState.touchCell(i);
        if (result.success) {
          renderBoard();
          updatePlayersStatus();
          updateCurrentPlayerStatus();

          if (result.gameWon) {
            showWinner();
          } else if (result.shouldAutoNext) {
            setTimeout(() => {
              gameState.nextPlayer();
              renderBoard();
              updatePlayersStatus();
              updateCurrentPlayerStatus();
            }, 600);
          }
        }
      }
    });

    boardEl.appendChild(cell);
  }
}

function updatePlayersStatus() {
  const listEl = document.getElementById("players-status");
  listEl.innerHTML = "";

  for (let p = 0; p < gameState.players.length; p += 1) {
    const li = document.createElement("li");
    li.className = `player-item player-${p + 1}`;

    if (p === gameState.currentPlayerIndex && !gameState.gameOver) {
      li.classList.add("current");
    }

    if (gameState.winner === p) {
      li.classList.add("winner");
    }

    const nameEl = document.createElement("span");
    nameEl.className = "player-name";
    nameEl.textContent = gameState.players[p];

    const caseCount = gameState.ownership.filter((own) => own === p).length;

    const casesEl = document.createElement("span");
    casesEl.className = "player-cases";
    casesEl.textContent = tGame("ownedCases", caseCount);

    li.appendChild(nameEl);
    li.appendChild(casesEl);
    listEl.appendChild(li);
  }
}

function updateCurrentPlayerStatus() {
  const playerNameEl = document.getElementById("current-player-name");
  const touchesLeftEl = document.getElementById("touches-left");
  const currentPlayerName = gameState.players[gameState.currentPlayerIndex];
  const touchesLeft = MAX_TOUCHES - gameState.currentPlayerTouches;
  const playerColorClass = `player-${gameState.currentPlayerIndex + 1}`;

  playerNameEl.textContent = tGame("currentPlayerTurn", currentPlayerName);
  playerNameEl.className = `player-name-display ${playerColorClass}`;
  touchesLeftEl.textContent = tGame("casesLeft", touchesLeft);
}

function showWinner() {
  const overlay = document.getElementById("winner-overlay");
  const messageEl = document.getElementById("winner-message");
  const winnerName = gameState.players[gameState.winner];
  messageEl.textContent = tGame("winnerMessage", winnerName);
  overlay.classList.remove("hidden");
}

function resetGame() {
  const setup = loadGameSetup();
  gameState = new GameState(setup.players);
  document.getElementById("winner-overlay").classList.add("hidden");
  renderBoard();
  updatePlayersStatus();
  updateCurrentPlayerStatus();
}

function backToMenu() {
  window.location.href = "index.html";
}

document.getElementById("back-btn").addEventListener("click", backToMenu);
document.getElementById("play-again-btn").addEventListener("click", resetGame);
document.getElementById("menu-btn").addEventListener("click", backToMenu);
document.getElementById("next-player-btn").addEventListener("click", () => {
  gameState.nextPlayer();
  renderBoard();
  updatePlayersStatus();
  updateCurrentPlayerStatus();
});
document.getElementById("undo-btn").addEventListener("click", () => {
  const result = gameState.undoLastTouch();
  if (result) {
    renderBoard();
    updateCurrentPlayerStatus();
  }
});

const languageSelect = document.getElementById("language-select");
languageSelect.value = currentLanguage;
languageSelect.addEventListener("change", (event) => {
  setGameLanguage(event.target.value);
  translateGameUI();
});

initGame();
translateGameUI();
