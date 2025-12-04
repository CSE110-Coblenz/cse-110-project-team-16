export interface UIManagerHandlers {
    onRetry: () => void;
    onNext: () => void;
    onRestartAll: () => void;
    onQuit: () => void;
}

export class UIManager {
    private retryBtn = document.getElementById("retryBtn") as HTMLButtonElement | null;
    private nextBtn = document.getElementById("nextBtn") as HTMLButtonElement | null;
    private restartAllBtn = document.getElementById("restartAllBtn") as HTMLButtonElement | null;
    private quitBtn = document.getElementById("quitBtn") as HTMLButtonElement | null;   
    private playerInfo = document.getElementById("playerInfo") as HTMLSpanElement | null;
    private playerNameInput = document.getElementById("playerNameInput") as HTMLInputElement | null;
    private uiContainer = document.getElementById("ui");

    constructor (handlers: UIManagerHandlers) {
        this.bindEvents(handlers);
    }
    private bindEvents(handlers: UIManagerHandlers) {
        if (this.retryBtn) this.retryBtn.onclick = handlers.onRetry;
        if (this.nextBtn) this.nextBtn.onclick = handlers.onNext;
        if (this.restartAllBtn) this.restartAllBtn.onclick = handlers.onRestartAll;
        if (this.quitBtn) this.quitBtn.onclick = handlers.onQuit;
    }
    // Show/Hide the entire Game UI overlay
    public toggleUIVisibility(visible: boolean) {
        if (this.uiContainer) {
            this.uiContainer.style.display = visible ? "block" : "none";
        }
    }
    // Update player name
    public updatePlayerInfo(level: number, name?: string) {
        if (this.playerInfo) {
            this.playerInfo.textContent = `Level: ${level}`;
        }
        if (this.playerNameInput && name) {
        this.playerNameInput.value = name;
        this.playerNameInput.disabled = true; // Read-only
        }
    }
    // Toggle the visibility of the "Next Level" button
    public toggleNextButton(visible: boolean) {
        if (this.nextBtn) {
            this.nextBtn.style.display = visible ? "inline-block" : "none";
        }
    }
    // Helper to hide buttons during minigames
    public toggleStandardButtons(visible: boolean) {
        const displayStyle = visible ? "inline-block" : "none";
        if (this.retryBtn) this.retryBtn.style.display = displayStyle;
        if (this.restartAllBtn) this.restartAllBtn.style.display = displayStyle;
        if (this.quitBtn) this.quitBtn.style.display = displayStyle;

        // Always hide next button if we are hiding standard buttons
        if (!visible && this.nextBtn) {
            this.nextBtn.style.display = "none";
        }
    }
}