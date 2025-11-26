import Konva from "konva";
import { MinigameModel, PuzzlePiece } from "./MinigameModel";

/**
 * MinigameView
 * Redners the Shape Builder minigame by implementing
 * - background layer: grid and axes
 * - target layer: faint outline of target shape
 * - pieces layer: draggable puzzle pieces
 * - UI layer: instructions/guidence, progress, completion
 */

// 9.0 Define MinigameView class
export class MinigameView{
    private model: MinigameModel;
    private stage: Konva.Stage;
    private backgroundLayer: Konva.Layer;
    private piecesLayer: Konva.Layer;
    private uiLayer: Konva.Layer;
    private titleText: Konva.Text;
    private captionText: Konva.Text;

    constructor(model: MinigameModel, stage: Konva.Stage){
        this.model = model;
        this.stage = stage;

        // Initalize Layers
        this.backgroundLayer = new Konva.Layer();
        this.piecesLayer = new Konva.Layer();
        this.uiLayer = new Konva.Layer();

        this.stage.add(this.backgroundLayer);
        this.stage.add(this.piecesLayer);
        this.stage.add(this.uiLayer);

        // Draw inital state
        // 9.2 Initalize startUI
        this.startUI();
        // 9.4 Initalize drawBackground
        this.drawBackground();
        // 9.9 Initalize update
        this.update();
        // Subscribe to model updates
        this.model.subscribe(this.update);
    }

    // 9.1 Start UI text elements initialization
    private startUI(){
        const width = this.model.getWidth();

        // Title
        this.titleText = new Konva.Text({
            x: width / 2,
            y: 20,
            text: "Shape Builder Puzzle",
            fontSize: 28,
            fontFamily: "sans-serif",
            fontStyle: "bold",
            fill: "#335",
        });
        this.titleText.offsetX(this.titleText.width() / 2);

        // Caption
        this.captionText = new Konva.Text({
            x: width / 2,
            y: 60,
            text: "",
            fontSize: 16,
            fontFamily: "sans-serif",
            fill: "#665",
            width: width - 100,
            align: "center",
        });
        this.captionText.offsetX(this.captionText.width() / 2);

        this.uiLayer.add(this.titleText, this.captionText);
    }

    // 9.3 Draw background silhouette
    private drawBackground(){
        // Use getter methods to create light background 
        const background = new Konva.Rect({
            x: 0,
            y: 0,
            width: this.model.getWidth(),
            height: this.model.getHeight(),
            fill: "#f9f9f9",
        });

        this.backgroundLayer.add(background);
        this.backgroundLayer.draw();
    }

    // 9.6 Draw all shape puzzle pieces
    private drawPieces(){
        // .destroyChildren() from Konva -> to clear previous pieces
        this.piecesLayer.destroyChildren()
        const pieces = this.model.getPieces();

        for(const piece of pieces){
            const group = this.createPieceGroup(piece);
            this.piecesLayer.add(group);
        }

        this.piecesLayer.draw();
    }

    // 9.5 Create Konva group for puzzle piece
    private createPieceGroup(piece: PuzzlePiece): Konva.Group{
        const group = new Konva.Group({
            x: piece.x,
            y: piece.y,
            rotation: piece.rotation,
        });

        // Construct shape based on type
        let shape: Konva.Shape;

        if(piece.type === "square" || piece.type === "rectangle"){
            shape = new Konva.Rect({
                x: -piece.width / 2,
                y: -piece.height / 2,
                width: piece.width,
                height: piece.height,
                fill: "#FFB74D",
                stroke: "#F57C00",
                strokeWidth: 3,
            });
        }
        else if(piece.type === "triangle" && piece.points){
            // Adjust necessary points to be centered
            const centerX = piece.width / 2;
            const centerY = piece.height / 2;
            const centeredPoints = piece.points.map((val, idx) =>
                idx % 2 === 0 ? val - centerX: val - centerY);

            shape = new Konva.Line({
                points: centeredPoints,
                fill: "#F57C00",
                stroke: "#F57C00",
                strokeWidth: 3,
                closed: true,
            });
        }
        else {
            // Default to rectangle
            shape = new Konva.Rect({
                x: -piece.width / 2,
                y: -piece.height / 2,
                width: piece.width,
                height: piece.height,
                fill: "#FFB74D",
                stroke: "#F57C00",
                strokeWidth: 3,
            }); 
        }

        // Shape added to group
        group.add(shape);
        group.draggable(true);

        // 11.0 Make pieces draggable
        group.on("dragmove", () => {
            this.model.updatePiecePosition(piece.id, group.x(), group.y());
        });

        group.on("mouseenter", () => {
            const container = this.stage.container();
            container.style.cursor = "move";
            shape.strokeWidth(4);
            this.piecesLayer.draw();
        });

        group.on("mouseleave", () => {
            const container = this.stage.container();
            container.style.cursor = "default";
            shape.strokeWidth(3);
            this.piecesLayer.draw();
        });

        return group;
    }

    // 9.7 Draw silhouette outline
    private drawSilhouette(){
        // Remove any previous silhouettes
        const prevSilhouettes = this.backgroundLayer.find(".silhouette");
        prevSilhouettes.forEach(s => s.destroy());

        const prompt = this.model.getCurrPrompt();
        if (!prompt || !prompt.silhouettePoints || prompt.silhouettePoints.length < 6){
            return;
        }

        const silhouette = new Konva.Line({
            points: prompt.silhouettePoints,
            stroke: "#ddd",
            strokeWidth: 3,
            dash: [10, 5],
            opacity: 0.5,
            closed: true,
            name: "silhouette"
        });

        this.backgroundLayer.add(silhouette);
        this.backgroundLayer.draw();
    }

    // 9.8 Update the main function
    private update = () => {
        this.drawSilhouette();
        this.drawPieces();

        const prompt = this.model.getCurrPrompt();
        if(prompt){
            this.titleText.text(`Shape Puzzle: ${prompt.name}`);
            this.titleText.offsetX(this.titleText.width() / 2);
            this.captionText.text(this.model.getFeedbackMsg());
            this.captionText.offsetX(this.captionText.width() / 2);
        }

        this.uiLayer.draw();
    };
}