export type ConfirmFn = (message?: string) => boolean;

/**
 * Ask user to confirm quitting the game. Returns true if quit is confirmed.
 * Extracted to enable testing without a browser confirm dialog.
 */
export function requestQuit(confirmFn: ConfirmFn, message = "Quit the game and return to main menu?") {
  return !!confirmFn(message);
}

