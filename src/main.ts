import "../style.css";
import Konva from "konva";
import { UIManager } from "./MainGame/UI/UIManager";

import { GraphModel } from "./MainGame/Graph/GraphModel";
import { GraphView } from "./MainGame/Graph/GraphView";
import { GraphController } from "./MainGame/Graph/GraphController";

import { FeedbackModel } from "./MainGame/Popup/FeedbackModel";
import { FeedbackView } from "./MainGame/Popup/FeedbackView";
import { FeedbackController } from "./MainGame/Popup/FeedbackController";
import { PlayerStore, PlayerProfile } from "./MainGame/Player/PlayerStore";
import { requestQuit } from "./MainGame/UI/Quit";
import { showQuitDialog } from "./MainGame/UI/Quit";
import { showMainMenu } from "./MainGame/UI/MainMenu";

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

const uiManager = new UIManager({
  onRetry: () => model.resetLevel(),
  onNext: () => {
    model.nextLevel();
    if (profile) PlayerStore.updateLevel(profile.name, model.getLevel());
    updatePlayerInfoWrapper();
  },
  onRestartAll: () => {
    const ok = window.confirm("Restart all levels and go back to Level 1?");
    if (!ok) return;
    model.setLevel(1);
    if (profile) PlayerStore.updateLevel(profile.name, 1);
    updatePlayerInfoWrapper();
  },
  onQuit: () => {
    // Keep your existing quit logic here
    showQuitDialog(stage, {
      onReturnToGame: () => {},
      onHelp: () => tutorialController.open(),
      onQuitToMenu: () => {
        // Hide game UI and show main menu
        uiManager.toggleGameUI(false); // USE uiManager HERE
        // Hide game layers logic (we will move this next, keep as is for now)
        stage.find("Layer").forEach((layer: any, idx: number) => {
          if (idx !== 0) layer.hide();
          else layer.show();
        });
        showMainMenu(stage, {
          onStartGame: (name: string) => {
            applyPlayerName(name);
            uiManager.toggleGameUI(true); // USE uiManager HERE
            stage.find("Layer").forEach((layer: any, idx: number) => {
              if (idx < 3) layer.show();
            });
          },
          onHelp: () => {
            tutorialController.open();
          },
        });
      },

    });
  },
});

// Helper to bridge the gap between simple variables and the class for now
function updatePlayerInfoWrapper() {
  uiManager.updatePlayerInfo(model.getLevel(), profile?.name);
}


function applyPlayerName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  PlayerStore.setCurrentPlayerName(trimmed);
  const loaded = PlayerStore.loadProfile(trimmed);
  model.setLevel(loaded.currentLevel);
  profile = loaded;
  updatePlayerInfoWrapper(); // Changed from updatePlayerInfo()
}
// Subscribe to model changes
model.subscribe(() => {
  uiManager.toggleNextButton(model.isLevelCompleted());
  updatePlayerInfoWrapper();
});


// console.log("About to create minigame...");
// console.log("Stage layers before minigame:", stage.find("Layer").length);

// const minigameModel = new MinigameModel(model.getWidth(), model.getHeight());
// console.log("minigame model created successfully");


// Create minigame instances
const minigameModel = new MinigameModel(model.getWidth(), model.getHeight());
const minigameView = new MinigameView(minigameModel, stage);
let isMinigameActive = false;


// See when to index, hide layers
console.log("LAYER COUNT");
console.log("Total layers:", stage.find("Layer").length);
stage.find("Layer").forEach((layer: any, idx: number) => {
  console.log(`Layer ${idx}: ${layer.name() || '(unnamed)'}`);
});
console.log("=========");


// Hide minigame layers at first
stage.find("Layer").forEach((layer: any, idx: number) => {
  if (idx >= 3) layer.hide();
});

// Show minigame
function startMinigame(shapeId: string) {
  isMinigameActive = true;

  // Hide main game layers: graph, UI, feedback
  stage.find("Layer").forEach((layer: any, idx: number) => {
    if (idx < 3) layer.hide()
    else layer.show();
  });

  minigameModel.startShape(shapeId);

  // Hide UI buttons during minigame
  uiManager.toggleStandardButtons(false);
}

// Exit minigame
function exitMinigame() {
  isMinigameActive = false;

  // Show main game and hide minigame
  stage.find("Layer").forEach((layer: any, idx: number) => {
    if (idx < 3) layer.show();
    else layer.hide();
  });

  uiManager.toggleStandardButtons(true);
}

// Check completion in subscription
model.subscribe(() => {
  // After level completes check for minigame trigger
  if (model.isLevelCompleted() && !isMinigameActive) {
    const currentLevel = model.getLevel();

    // Trigger minigame after levels 3, 6, 9
    if (currentLevel % 3 === 0) {
      let shapeId = "house";
      if (currentLevel === 6) shapeId = "tree";
      else if (currentLevel === 9) shapeId = "sun";

      // Wait 1 second then show minigame
      setTimeout(() => startMinigame(shapeId), 1000);
    }
  }
});

// Subscribe to minigame completion
minigameModel.subscribe(() => {
  if (minigameModel.getIsComplete() && isMinigameActive) {
    // Wait 2 seconds to show celebration then exit
    setTimeout(() => {
      exitMinigame();
      model.nextLevel();
      if (profile) PlayerStore.updateLevel(profile.name, model.getLevel());
      updatePlayerInfoWrapper();
    }, 2200);
  }
});


// Initial State: Show Main Menu, Hide Game (except Grid)
uiManager.toggleGameUI(false);
stage.find("Layer").forEach((layer: any, idx: number) => {
  if (idx !== 0) layer.hide();
});

const inputEl = showMainMenu(stage, {
  onStartGame: (name: string) => {
    // Apply name and load profile
    applyPlayerName(name);

    // Show game UI
    uiManager.toggleGameUI(true);
    // Show game layers (excluding minigame layers if any)
    stage.find("Layer").forEach((layer: any, idx: number) => {
      if (idx < 3) layer.show();
    });
  },
  onHelp: () => {
    // Hide input while tutorial is open
    if (inputEl) inputEl.style.display = "none";

    tutorialController.open(() => {
      // Show input again when tutorial closes
      if (inputEl && document.body.contains(inputEl)) {
        inputEl.style.display = "block";
      }
    });
  }
});



// Initial update
updatePlayerInfoWrapper();