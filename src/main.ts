import "../style.css";
import Konva from "konva";

import { GraphModel } from "./MainGame/Graph/GraphModel";
import { GraphView } from "./MainGame/Graph/GraphView";
import { GraphController } from "./MainGame/Graph/GraphController";

import { FeedbackModel } from "./MainGame/Popup/FeedbackModel";
import { FeedbackView } from "./MainGame/Popup/FeedbackView";
import { FeedbackController } from "./MainGame/Popup/FeedbackController";
import { PlayerStore, PlayerProfile } from "./MainGame/Player/PlayerStore";
import { requestQuit } from "./MainGame/UI/Quit";
import { showQuitDialog } from "./MainGame/UI/Quit";

import { MinigameModel } from "./MainGame/Minigame/MinigameModel";
import { MinigameView } from "./MainGame/Minigame/MinigameView";
// import { start } from "repl";

//Added tutorial imports here 
import { TutorialModel } from "./MainGame/Tutorial/TutorialModel";
import { TutorialView } from "./MainGame/Tutorial/TutorialView";
import { TutorialController } from "./MainGame/Tutorial/TutorialController";

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

// Feedback MVC
const feedbackModel = new FeedbackModel();
const feedbackView = new FeedbackView(stage);
const feedbackController = new FeedbackController(feedbackModel, feedbackView);

// Tutorial MVC
// Stores the slides and mangages the slides 
// Renders the tutorial popup 
// User button interactions updateing model and view
const tutorialModel = new TutorialModel();
const tutorialView = new TutorialView(stage);
const tutorialController = new TutorialController(tutorialModel, tutorialView);

// 4. Create Controller (now includes slope input handling)
new GraphController(model, feedbackController);


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
    showQuitDialog(stage, {
      onReturnToGame: () => {
        // Do nothing; dialog already closed.
        // Game just resumes as-is.
      },
      //here we implment the onHelp function to open the tutorial 
      onHelp: () => {
        tutorialController.open();
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
  playerNameInput.addEventListener("blur", () => applyPlayerName(playerNameInput.value));
}

// Subscribe to model changes
model.subscribe(() => {
  if (nextBtn) nextBtn.style.display = model.isLevelCompleted() ? "inline-block" : "none";
  updatePlayerInfo();
});

updatePlayerInfo();

// console.log("About to create minigame...");
// console.log("Stage layers before minigame:", stage.find("Layer").length);

// const minigameModel = new MinigameModel(model.getWidth(), model.getHeight());
// console.log("minigame model created successfully");


// Create minigame instances
const minigameModel = new MinigameModel(model.getWidth(), model.getHeight());
const minigameView = new MinigameView(minigameModel, stage);

let isMinigameActive = false;

// Hide minigame layers at first
stage.find("Layer").forEach((layer: any, idx: number) => {
  if(idx >= 3) layer.hide();
});

// Show minigame
function startMinigame(shapeId: string){
  isMinigameActive = true;

  // Hide main game layers: graph, UI, feedback
  stage.find("Layer").forEach((layer: any, idx: number) => {
    if(idx < 3) layer.hide()
    else layer.show();
  });

  minigameModel.startShape(shapeId);

  // Hide UI buttons during minigame
  if (retryBtn) retryBtn.style.display = "none";
  if (nextBtn) nextBtn.style.display = "none";
  if (restartAllBtn) restartAllBtn.style.display = "none";
  if (quitBtn) quitBtn.style.display = "none";
}

  // Exit minigame
  function exitMinigame(){
    isMinigameActive = false;

    // Show main game and hide minigame
    stage.find("Layer").forEach((layer: any, idx: number) => {
      if(idx < 3) layer.show();
      else layer.hide();
    });

    // Restore UI buttons
    if(retryBtn) retryBtn.style.display = "inline-block";
    if(restartAllBtn) restartAllBtn.style.display = "inline-block";
    if(quitBtn) quitBtn.style.display = "inline-block";
  }

  // Autoexit after 15 sec (completion detection needed)
  let minigameTimer: number | null = null;

  function startMinigameWithTimer(shapeId: string){
    startMinigame(shapeId);

    minigameTimer = window.setTimeout(() => {
      console.log("Minigame auto-exiting (completion detection needed)");
      exitMinigame();
      model.nextLevel();
      if(profile) PlayerStore.updateLevel(profile.name, model.getLevel());
      updatePlayerInfo();
    }, 15000); // 15 ms
  }

  // Add new subscription to model for the minigame trigger
  model.subscribe(() => {
    // Check for minigame trigger after the level completes
    if(model.isLevelCompleted() && !isMinigameActive){
      const currentLevel = model.getLevel();

      // Trigger minigame after levels 3, 6, 9
      if(currentLevel % 3 === 0){
        let shapeId = "house";
        if(currentLevel === 6) shapeId = "tree";
        else if(currentLevel === 9) shapeId = "sun";

        // Wait 1 second, show minigame
        setTimeout(() => startMinigameWithTimer(shapeId), 1000); // 1 ms
      }
    }
  });