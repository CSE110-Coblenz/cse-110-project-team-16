import Knova from "konva"

export type ConfirmFn = (message?: string) => boolean;

/**
 * Ask user to confirm quitting the game. Returns true if quit is confirmed.
 * Extracted to enable testing without a browser confirm dialog.
 */
export function requestQuit(confirmFn: ConfirmFn, message = "Quit the game and return to main menu?") {
  return !!confirmFn(message);
}

export interface QuitDialogHandlers {
  onReturnToGame: () => void;
  onQuitToMenu: () => void;
  //onhelp 
  onHelp?: () => void;

}


//  Shows a Knova-based quit dialog centered on the stage.
//  Blocks the game visually with a semi-transparent overlay.
 
export function showQuitDialog(
  stage: Knova.Stage,
  handlers: QuitDialogHandlers
) {
  const modalLayer = new Knova.Layer();
  const width = stage.width();
  const height = stage.height();

  // button backround color 
  const backdrop = new Knova.Rect({
    x: 0,
    y: 0,
    width,
    height,
    fill: "rgba(0,0,0,0.4)",
  });

  const boxWidth = 300;
  const boxHeight = 150;

  const boxGroup = new Knova.Group({
    x: (width - boxWidth) / 2,
    y: (height - boxHeight) / 2,
  });

  const box = new Knova.Rect({
    x: 0,
    y: 0,
    width: boxWidth,
    height: boxHeight,
    fill: "white",
    cornerRadius: 10,
    shadowColor: "black",
    shadowBlur: 10,
    shadowOpacity: 0.3,
  });

  const title = new Knova.Text({
    x: 0,
    y: 12,
    width: boxWidth,
    align: "center",
    text: "Are you sure?",
    fontSize: 20,
    fontStyle: "bold",
    fill: "black",
  });

  
  const btnWidth = 120;
  const btnHeight = 30;
  const btnY = 80;

  // "Return to game" button 
  const returnGroup = new Knova.Group({
    x: 20,
    y: btnY,
  });

  const returnRect = new Knova.Rect({
    x: 0,
    y: 0,
    width: btnWidth,
    height: btnHeight,
    fill: "#e0e0e0",
    cornerRadius: 6,
  });

  const returnText = new Knova.Text({
    x: 0,
    y: 7,
    width: btnWidth,
    align: "center",
    text: "Return to game",
    fontSize: 14,
    fill: "black",
  });

  returnGroup.add(returnRect, returnText);

  // "Quit to main menu" button 
  const quitGroup = new Knova.Group({
    x: boxWidth - btnWidth - 20,
    y: btnY,
  });

  const quitRect = new Knova.Rect({
    x: 0,
    y: 0,
    width: btnWidth,
    height: btnHeight,
    fill: "#f5b0b0",
    cornerRadius: 6,
  });

  const quitText = new Knova.Text({
    x: 0,
    y: 7,
    width: btnWidth,
    align: "center",
    text: "Quit to menu",
    fontSize: 14,
    fill: "black",
  });

  quitGroup.add(quitRect, quitText);

   const helpWidth = 70;
  const helpHeight = 26;

  const helpGroup = new Knova.Group({
    x: boxWidth - helpWidth - 20,      // keep aligned to the right
    y: boxHeight - helpHeight - 10, 
  });

  const helpRect = new Knova.Rect({
    x: 0,
    y: 0,
    width: helpWidth,
    height: helpHeight,
    fill: "#e5e7eb",
    cornerRadius: helpHeight / 2,
  });

  const helpText = new Knova.Text({
    x: 0,
    y: 5,
    width: helpWidth,
    align: "center",
    text: "Help",
    fontSize: 14,
    fill: "#111827",
  });

  helpGroup.add(helpRect, helpText);


  const closeModal = () => {
    modalLayer.destroy();
    stage.batchDraw();
  };

  returnGroup.on("click tap", () => {
    closeModal();
    handlers.onReturnToGame();
  });

  quitGroup.on("click tap", () => {
    closeModal();
    handlers.onQuitToMenu();
  });


  // Go to the Help popup when help is clicked, 
  // and have the quit screen open still
  helpGroup.on("click tap", () => {
    if (handlers.onHelp) {
      handlers.onHelp();
    }
  });

  const container = stage.container();

  [returnGroup, quitGroup, helpGroup].forEach((group) => {
    group.on("mouseenter", () => {
      container.style.cursor = "pointer";
    });
    group.on("mouseleave", () => {
      container.style.cursor = "default";
    });
  });

  boxGroup.add(box, title, returnGroup, quitGroup, helpGroup);
  modalLayer.add(backdrop, boxGroup);
  stage.add(modalLayer);
  modalLayer.moveToTop();
  stage.batchDraw();
}