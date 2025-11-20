import "../style.css";
import Konva from "konva";
// import MVC of differnt modules
import { GraphModel } from "./MainGame/Graph/GraphModel";
import { GraphView } from "./MainGame/Graph/GraphView";
import { GraphController } from "./MainGame/Graph/GraphController";
import { PlayerStore, PlayerProfile } from "./MainGame/Player/PlayerStore";
import { requestQuit } from "./MainGame/UI/Quit";
import { showQuitDialog } from "./MainGame/UI/Quit";
// 1. Create the Model (the data)
const model = new GraphModel();
// const padding = 20;
// model.setOrigin(padding, model.getHeight() - padding);


// 2. Create the shared Konva Stage
const stage = new Konva.Stage({
  container: "container",
  width: model.getWidth(),
  height: model.getHeight(),
});

// 3. Create the Views, passing them the model and the shared stage
// Each view will create and manage its own Konva.Layer
const graphView = new GraphView(model, stage);

// 4. Create the Controller
// The controller now only needs to talk to the model.
new GraphController(model);

// --- Player & UI Wiring ---
let profile: PlayerProfile | null = null;
const storedName = PlayerStore.getCurrentPlayerName();
if (storedName) {
  profile = PlayerStore.loadProfile(storedName);
  model.setLevel(profile.currentLevel);
}

const retryBtn = document.getElementById("retryBtn") as HTMLButtonElement | null;
const nextBtn = document.getElementById("nextBtn") as HTMLButtonElement | null;
const restartAllBtn = document.getElementById("restartAllBtn") as HTMLButtonElement | null;
const quitBtn = document.getElementById("quitBtn") as HTMLButtonElement | null;
const playerInfo = document.getElementById("playerInfo") as HTMLSpanElement | null;
const playerNameInput = document.getElementById("playerNameInput") as HTMLInputElement | null;
const slopeInput = document.getElementById("slopeInput") as HTMLInputElement | null;
const lengthInput = document.getElementById("lengthInput") as HTMLInputElement | null;
const drawBtn = document.getElementById("drawBtn") as HTMLButtonElement | null;

function updatePlayerInfo() {
  if (playerInfo) playerInfo.textContent = `Level: ${model.getLevel()}`;
  if (playerNameInput && profile) playerNameInput.value = profile.name;
}

function applyPlayerName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  PlayerStore.setCurrentPlayerName(trimmed);
  const loaded = PlayerStore.loadProfile(trimmed);
  // Persist current level to this profile so switching names mid-run keeps progress
  loaded.currentLevel = model.getLevel();
  PlayerStore.saveProfile(loaded);
  profile = loaded;
  updatePlayerInfo();
}

if (retryBtn) {
  retryBtn.onclick = () => {
    model.resetLevel();
  };
}
if (nextBtn) {
  nextBtn.onclick = () => {
    model.nextLevel();
    if (profile) PlayerStore.updateLevel(profile.name, model.getLevel());
    updatePlayerInfo();
  };
}
if (restartAllBtn) {
  restartAllBtn.onclick = () => {
    const ok = window.confirm("Restart all levels and go back to Level 1?");
    if (!ok) return;
    model.setLevel(1);
    if (profile) PlayerStore.updateLevel(profile.name, 1);
    updatePlayerInfo();
  };
}


if (quitBtn) {
  quitBtn.onclick = () => {
    showQuitDialog(stage, {
      onReturnToGame: () => {
        // Do nothing; dialog already closed.
        // Game just resumes as-is.
      },
      onQuitToMenu: () => {
        // For now, we don't have a main menu.
        // Simplest behavior: reload the page or reset to level 1.
        // Option A: reload everything:
        window.location.reload();

        // Option B (if you prefer staying on page):
        // model.setLevel(1);
        // if (profile) PlayerStore.updateLevel(profile.name, 1);
        // updatePlayerInfo();
      },
    });
  };
}

if (playerNameInput) {
  if (profile) playerNameInput.value = profile.name;
  playerNameInput.placeholder = "Player name";
  playerNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      applyPlayerName(playerNameInput.value);
      playerNameInput.blur();
    }
  });
  playerNameInput.addEventListener("blur", () => {
    applyPlayerName(playerNameInput.value);
  });
}

function triggerDrawFromInputs() {
  if (!slopeInput || !lengthInput) return;
  const m = parseMaybeFraction(slopeInput.value);
  const L = parseFloat(lengthInput.value);
  if (m === null || isNaN(L) || L <= 0) return;
  model.setSegmentInput(m, L);
  model.tryBridgeWithSegment();
}

function parseMaybeFraction(text: string): number | null {
  if (!text) return null;
  const s = text.trim();
  if (s.includes('/')) {
    const [numStr, denStr] = s.split('/').map(t => t.trim());
    if (!numStr || !denStr) return null;
    const num = parseFloat(numStr);
    const den = parseFloat(denStr);
    if (!isFinite(num) || !isFinite(den) || den === 0) return null;
    return num / den;
  }
  const v = parseFloat(s);
  return isFinite(v) ? v : null;
}

if (drawBtn) {
  drawBtn.onclick = () => triggerDrawFromInputs();
}
if (slopeInput && lengthInput) {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerDrawFromInputs();
    }
  };
  slopeInput.addEventListener('keydown', onKey);
  lengthInput.addEventListener('keydown', onKey);
}

// Subscribe to model changes to toggle Next button and info
model.subscribe(() => {
  if (nextBtn) nextBtn.style.display = model.isLevelCompleted() ? "inline-block" : "none";
  updatePlayerInfo();
});

updatePlayerInfo();

// The app is running.
