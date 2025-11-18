import "../style.css";
import Konva from "konva";

import { GraphModel } from "./MainGame/Graph/GraphModel";
import { GraphView } from "./MainGame/Graph/GraphView";
import { GraphController } from "./MainGame/Graph/GraphController";

import { PlayerStore, PlayerProfile } from "./MainGame/Player/PlayerStore";
import { requestQuit } from "./MainGame/UI/Quit";

// 1. Create the Model (the data)
const model = new GraphModel();

// 2. Create Konva Stage
const stage = new Konva.Stage({
  container: "container",
  width: model.getWidth(),
  height: model.getHeight(),
});

// 3. Create View
new GraphView(model, stage);

// 4. Create Controller (now includes slope input handling)
new GraphController(model);

// --- Player & UI Data ---
let profile: PlayerProfile | null = null;
const storedName = PlayerStore.getCurrentPlayerName();
if (storedName) {
  profile = PlayerStore.loadProfile(storedName);
  model.setLevel(profile.currentLevel);
}

// UI ELEMENTS
const retryBtn = document.getElementById("retryBtn") as HTMLButtonElement | null;
const nextBtn = document.getElementById("nextBtn") as HTMLButtonElement | null;
const restartAllBtn = document.getElementById("restartAllBtn") as HTMLButtonElement | null;
const quitBtn = document.getElementById("quitBtn") as HTMLButtonElement | null;
const playerInfo = document.getElementById("playerInfo") as HTMLSpanElement | null;
const playerNameInput = document.getElementById("playerNameInput") as HTMLInputElement | null;

// --- Player Name Logic ---
function updatePlayerInfo() {
  if (playerInfo) playerInfo.textContent = `Level: ${model.getLevel()}`;
  if (playerNameInput && profile) playerNameInput.value = profile.name;
}

function applyPlayerName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  PlayerStore.setCurrentPlayerName(trimmed);
  const loaded = PlayerStore.loadProfile(trimmed);
  loaded.currentLevel = model.getLevel();
  PlayerStore.saveProfile(loaded);
  profile = loaded;
  updatePlayerInfo();
}

if (retryBtn) {
  retryBtn.onclick = () => model.resetLevel();
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
    if (requestQuit(window.confirm)) {
      window.location.reload();
    }
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
  playerNameInput.addEventListener("blur", () => applyPlayerName(playerNameInput.value));
}

// Subscribe to model changes
model.subscribe(() => {
  if (nextBtn) nextBtn.style.display = model.isLevelCompleted() ? "inline-block" : "none";
  updatePlayerInfo();
});

updatePlayerInfo();
