import Konva from "konva";
import { MinigameModel } from "./MinigameModel";

/**
 * MinigameView
 * Redners the Shape Builder minigame by implementing
 * - background layer: grid and axes
 * - target layer: faint outline of target shape
 * - lines layer: user's successful placed lines
 * - UI layer: equation input, visual feedback, progress bar
 */

// 4.0 Define MinigameView class
export class MinigameView{
    private model: MinigameModel;
    private stage: Konva.Stage;
    private backgroundLayer: Konva.Layer;
    private targetLayer: Konva.Layer;

    constructor(model: MinigameModel, stage: Konva.Stage){
        this.model = model;
        this.stage = stage;

        // Initalize Layers
        this.backgroundLayer = new Konva.Layer();
        this.targetLayer = new Konva.Layer();

        this.stage.add(this.backgroundLayer);
        this.stage.add(this.targetLayer);

        // Draw inital state
        // 4.2 Initalize drawBackground
        this.drawBackground();
        // 4.5 Initalize update
        this.update();
        // Subscribe to model updates
        this.model.subscribe(this.update);
    }

    // 4.1 Draw the coordinate grid and axes
    private drawBackground(){
        // Use getter methods from MinigameModel.ts
        const width = this.model.getWidth();
        const height = this.model.getHeight();
        const scale = this.model.getScale();
        const originX = this.model.getOriginX();
        const originY = this.model.getOriginY();

        // Define Axes
        const xAxis = new Konva.Line({
            points: [0, originX, width, originY],
            stroke: "#adacac",
            strokeWidth: 2,
        });

        const yAxis = new Konva.Line({
            points: [originX, 0, originX, height],
            stroke: "#adacac",
            strokeWidth: 2,
        })

        // Create grid lines

        this.backgroundLayer.add(xAxis, yAxis);
        this.backgroundLayer.draw();
    }

    // 4.3 Draw faint outline of target shape
    private drawTargetOutline(){
        // .destroyChildren() from Konva to clear prev outline
        this.targetLayer.destroyChildren()
        const segments = this.model.getTargetSegments();

        for(const segment of segments){
            const line = new Konva.Line({
                points:[
                    this.toCanvasX(segment.startX),
                    this.toCanvasY(segment.startY),
                    this.toCanvasX(segment.endX),
                    this.toCanvasY(segment.endY),
                ],
                stroke: "#ccc",
                strokeWidth: 2,
                dash: [10, 5],
                opacity: 0.5,
            });
            this.targetLayer.add(line);
        }

        this.targetLayer.draw();
    }

    // 4.4 Update the background grid
    private update = () => {
        this.drawTargetOutline();
    }

    private toCanvasX = (mathX: number): number => {
        return this.model.getOriginX() + mathX * this.model.getScale();
    };

    private toCanvasY = (mathY: number): number => {
        return this.model.getOriginY() + mathY * this.model.getScale();
    };
}