import Konva from "konva";

export interface MenuHandlers {
    onStartGame: (name: string) => void;
    onHelp: () => void;
}

export function showMainMenu(stage: Konva.Stage, handlers: MenuHandlers) {
    const layer = new Konva.Layer();
    const width = stage.width();
    const height = stage.height();

    // Background
    const background = new Konva.Rect({
        x: 0,
        y: 0,
        width: width,
        height: height,
        fill: "rgba(255, 255, 255, 0.7)", // Semi-transparent to show grid
    });

    // Title
    const title = new Konva.Text({
        x: 0,
        y: height / 4,
        width: width,
        text: "Bridge Builder",
        fontSize: 48,
        fontStyle: "bold",
        align: "center",
        fill: "#333",
    });

    // Input Field (HTML)
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter Player Name";
    input.style.position = "absolute";
    input.style.top = `${height / 2 - 60}px`;
    input.style.left = "50%";
    input.style.transform = "translateX(-50%)";
    input.style.padding = "10px";
    input.style.fontSize = "16px";
    input.style.borderRadius = "5px";
    input.style.border = "1px solid #ccc";
    input.style.zIndex = "1000"; // Ensure it's on top
    input.style.width = "200px";
    input.style.textAlign = "center";

    // Pre-fill if there's a stored name (optional, but good UX)
    const storedName = localStorage.getItem("currentPlayerName");
    if (storedName) {
        input.value = storedName;
    }

    document.body.appendChild(input);

    // Button dimensions
    const btnWidth = 200;
    const btnHeight = 50;
    const startBtnY = height / 2;
    const helpBtnY = startBtnY + btnHeight + 20;

    // Helper to create buttons
    const createButton = (y: number, text: string, color: string, onClick: () => void) => {
        const group = new Konva.Group({
            x: (width - btnWidth) / 2,
            y: y,
        });

        const rect = new Konva.Rect({
            width: btnWidth,
            height: btnHeight,
            fill: color,
            cornerRadius: 10,
            shadowColor: "black",
            shadowBlur: 5,
            shadowOpacity: 0.2,
            shadowOffset: { x: 2, y: 2 },
        });

        const label = new Konva.Text({
            width: btnWidth,
            height: btnHeight,
            text: text,
            fontSize: 20,
            fontStyle: "bold",
            align: "center",
            verticalAlign: "middle",
            fill: "white",
            padding: 15, // Approximate centering vertically
        });
        // Better vertical centering
        label.y((btnHeight - label.height()) / 2);


        group.add(rect, label);

        group.on("click tap", onClick);

        // Hover effects
        group.on("mouseenter", () => {
            stage.container().style.cursor = "pointer";
            rect.opacity(0.8);
        });
        group.on("mouseleave", () => {
            stage.container().style.cursor = "default";
            rect.opacity(1);
        });

        return group;
    };

    const startBtn = createButton(startBtnY, "Start Game", "#4CAF50", () => {
        const name = input.value.trim();
        if (!name) {
            alert("Please enter a name to start.");
            return;
        }

        // Cleanup
        if (document.body.contains(input)) {
            document.body.removeChild(input);
        }
        layer.destroy();
        handlers.onStartGame(name);
    });

    const helpBtn = createButton(helpBtnY, "Help / Tutorial", "#2196F3", () => {
        // Don't destroy layer, just open help?
        // Or destroy and let tutorial handle it?
        // User asked for help button to be better placed.
        // Tutorial usually opens a popup.
        handlers.onHelp();
    });

    layer.add(background, title, startBtn, helpBtn);
    stage.add(layer);
    layer.draw();
}
