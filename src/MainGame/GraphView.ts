// src/graphView.ts

import Konva from "konva";
import { GraphModel } from "./GraphModel"; // Changed for consistency

export class GraphView {
    private model: GraphModel;
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private currentLine: Konva.Line | null = null;

    constructor(model: GraphModel, stage: Konva.Stage) {
        this.model = model;
        this.stage = stage; // Store the shared stage

        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        // Initial draw
        this.drawGridAndAxes();
        this.layer.draw();

        // Subscribe to model changes
        this.model.subscribe(this.update);
    }

    // --- Coordinate Helpers ---
    private toCanvasX = (mathX: number) => {
        // Use the model's origin
        return this.model.getOriginX() + mathX * this.model.getScale();
    };
    private toCanvasY = (mathY: number) => {
        // Use the model's origin (and flip Y-axis)
        return this.model.getOriginY() - mathY * this.model.getScale();
    };

    // --- Drawing Methods ---
    private drawGridAndAxes() {
        const width = this.model.getWidth();
        const height = this.model.getHeight();
        const scale = this.model.getScale();
        const originX = this.model.getOriginX();
        const originY = this.model.getOriginY();

        // Axes
        const xAxis = new Konva.Line({ points: [0, originY, width, originY], stroke: "#aaa", strokeWidth: 2 });
        const yAxis = new Konva.Line({ points: [originX, 0, originX, height], stroke: "#aaa", strokeWidth: 2 });
        this.layer.add(xAxis, yAxis);

        // Grid
        for (let x = -Math.ceil(width / scale); x <= Math.ceil(width / scale); x++) {
            if (x === 0) continue;
            this.layer.add(new Konva.Line({ points: [this.toCanvasX(x), 0, this.toCanvasX(x), height], stroke: "#eee", strokeWidth: 1 }));
        }
        for (let y = -Math.ceil(height / scale); y <= Math.ceil(height / scale); y++) {
            if (y === 0) continue;
            this.layer.add(new Konva.Line({ points: [0, this.toCanvasY(y), width, this.toCanvasY(y)], stroke: "#eee", strokeWidth: 1 }));
        }

        // Ensure grid is behind everything
        xAxis.zIndex(0);
        yAxis.zIndex(0);
    }

    private drawEquationLine(m: number, b: number) {
        const width = this.model.getWidth();
        const scale = this.model.getScale();
        const originX = this.model.getOriginX();

        const mathX1 = -originX / scale;
        const mathY1 = m * mathX1 + b;
        const mathX2 = (width - originX) / scale;
        const mathY2 = m * mathX2 + b;

        const points = [this.toCanvasX(mathX1), this.toCanvasY(mathY1), this.toCanvasX(mathX2), this.toCanvasY(mathY2)];

        if (this.currentLine) {
            this.currentLine.points(points);
        } else {
            this.currentLine = new Konva.Line({
                points: points,
                stroke: "red",
                strokeWidth: 3,
                lineCap: "round",
                lineJoin: "round",
                zIndex: 1, // Above grid
            });
            this.layer.add(this.currentLine);
        }
    }

    private clearEquationLine() {
        if (this.currentLine) {
            this.currentLine.destroy();
            this.currentLine = null;
        }
    }

    /** This is the main update function called by the model's notification. */
    public update = () => {
        // 1. Check if a resize is needed
        this.handleResize();

        // 2. Update the line based on model data
        const eq = this.model.getParsedEquation();
        if (eq) {
            this.drawEquationLine(eq.m, eq.b);
        } else {
            this.clearEquationLine();
        }

        this.layer.batchDraw();
    };

    /** Checks for window resize and rebuilds the grid if needed. */
    private handleResize() {
        const newWidth = this.model.getWidth();
        const newHeight = this.model.getHeight();

        // Check if stage size differs from model's size
        if (this.stage.width() !== newWidth || this.stage.height() !== newHeight) {
            // Resize stage
            this.stage.width(newWidth);
            this.stage.height(newHeight);

            // Clear and redraw grid/axes
            this.layer.destroyChildren();
            this.drawGridAndAxes();

            // Force redraw of line on next update
            this.currentLine = null;
        }
    }
}