// src/graphView.ts

import Konva from "konva";
import { GraphModel } from "./GraphModel";

export class GraphView {
    // render info
    private segmentInfoText: Konva.Text;
    private segmentErrorText: Konva.Text;

    private model: GraphModel;
    private stage: Konva.Stage;

    // --- Graph Layer ---
    private graphLayer: Konva.Layer;
    private currentLine: Konva.Line | null = null;
    private bridgesKeys: Set<string> = new Set();
    private lastLevel: number;

    // --- UI Elements (moved from UIView) ---
    private uiLayer: Konva.Layer;
    private equationText: Konva.Text;
    private equationBg: Konva.Rect;
    private errorText: Konva.Text;

    constructor(model: GraphModel, stage: Konva.Stage) {
        this.model = model;
        this.stage = stage;

        // 1. Initialize Graph Layer (for grid and lines)
        this.graphLayer = new Konva.Layer();
        this.stage.add(this.graphLayer);

        // 2. Initialize UI Layer (for text)
        this.uiLayer = new Konva.Layer();
        this.stage.add(this.uiLayer); // Added second, so it's on top

        // 3. Initialize UI Elements (disabled equation bar)
        this.equationBg = new Konva.Rect({ x: 0, y: 0, width: 0, height: 0, visible: false });
        this.equationText = new Konva.Text({ x: 0, y: 0, text: "", visible: false });
        this.errorText = new Konva.Text({ x: 0, y: 0, text: "", visible: false });
        // Do not add to UI layer to avoid showing 'y ='

        // Initial draw of the graph and platform
        this.drawGridAndAxes();
        const platforms = this.model.getPlatformsData();
        platforms.forEach(platform => {
            this.drawPlatform(platform.startX, platform.endX, (platform as any).y ?? 0, (platform as any).bridged ?? false);
        });


        // Track level for clearing on level changes
        this.lastLevel = this.model.getLevel();

        // Draw both layers
        this.graphLayer.draw();
        this.uiLayer.draw();


        this.segmentInfoText = new Konva.Text({
            x: 20,
            y: 20,
            text: "",
            fontSize: 22,
            fontFamily: "monospace",
            fill: "blue",
            visible: false
        });
        this.uiLayer.add(this.segmentInfoText);

        this.segmentErrorText = new Konva.Text({
            x: 20,
            y: 90,
            text: "",
            fontSize: 20,
            fontFamily: "monospace",
            fill: "red",
            visible: false
        });
        this.uiLayer.add(this.segmentErrorText);


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

    private showSegmentError(msg: string) {
        this.segmentErrorText.text(msg);
        this.segmentErrorText.visible(true);
    }

    private hideSegmentError() {
        this.segmentErrorText.visible(false);
    }


    private updateSegmentInfo(m: number, length: number) {
        const angleDeg = Math.atan(m) * 180 / Math.PI;

        this.segmentInfoText.text(
            `y = ${m.toFixed(2)}x\n` +
            `length = ${length.toFixed(2)}\n` +
            `angle = ${angleDeg.toFixed(1)}°`
        );

        this.segmentInfoText.visible(true);
    }

    private clearSegmentInfo() {
        this.segmentInfoText.visible(false);
    }

    // --- Drawing Methods ---
    private drawGridAndAxes() {
        const width = this.model.getWidth();
        const height = this.model.getHeight();
        const scale = this.model.getScale();
        const originX = this.model.getOriginX();
        const originY = this.model.getOriginY();

        // Axes (slightly darker)
        const xAxis = new Konva.Line({ points: [0, originY, width, originY], stroke: "#999", strokeWidth: 2 });
        const yAxis = new Konva.Line({ points: [originX, 0, originX, height], stroke: "#999", strokeWidth: 2 });
        this.graphLayer.add(xAxis, yAxis);

        // Grid
        for (let x = -Math.ceil(width / scale); x <= Math.ceil(width / scale); x++) {
            if (x === 0) continue;
            this.graphLayer.add(new Konva.Line({ points: [this.toCanvasX(x), 0, this.toCanvasX(x), height], stroke: "#ddd", strokeWidth: 1 }));
        }
        for (let y = -Math.ceil(height / scale); y <= Math.ceil(height / scale); y++) {
            if (y === 0) continue;
            this.graphLayer.add(new Konva.Line({ points: [0, this.toCanvasY(y), width, this.toCanvasY(y)], stroke: "#ddd", strokeWidth: 1 }));
        }

        // Ensure grid is behind everything
        xAxis.zIndex(0);
        yAxis.zIndex(0);
    }

    private drawEquationLine(m: number, b: number) {
        const width = this.model.getWidth();
        const scale = this.model.getScale();
        const originX = this.model.getOriginX();
        const xMin = -originX / scale;
        const xMax = (width - originX) / scale;

        // Prefer explicit segment input: start at anchor end with given slope/length
        let points: number[] = [];
        const seg = this.model.getSegmentInput();
        if (seg) {
            const x0 = this.model.getAnchorEndX();
            const y0 = this.model.getAnchorY();
            if (x0 !== null && y0 !== null) {
                const denom = Math.sqrt(1 + seg.m * seg.m) || 1;
                const dx = seg.length / denom; // always forward to the right
                const dy = seg.m * dx;
                const x1 = x0;
                const y1 = y0;
                const x2 = x0 + dx;
                const y2 = y0 + dy;
                points = [this.toCanvasX(x1), this.toCanvasY(y1), this.toCanvasX(x2), this.toCanvasY(y2)];
            }
        } else {
            // Draw only the current connection segment: end of anchor -> start of next
            const rc = this.model.getRecentConnectionPair();
            const pair = (m === 0 && b === 0 && rc) ? rc : this.model.getNextConnectionPair();
            if (pair) {
                const x1 = Math.max(Math.min(pair.fromX, xMax), xMin);
                const x2 = Math.max(Math.min(pair.toX, xMax), xMin);
                const y1 = pair.fromY;
                const y2 = pair.toY;
                points = [this.toCanvasX(x1), this.toCanvasY(y1), this.toCanvasX(x2), this.toCanvasY(y2)];
            }
        }
        // Fallback: if fewer than 2 platforms or degenerate, draw across full width
        if (points.length < 4) {
            if (m === 0) {
                const y = b;
                points = [this.toCanvasX(xMin), this.toCanvasY(y), this.toCanvasX(xMax), this.toCanvasY(y)];
            } else {
                const y1 = m * xMin + b;
                const y2 = m * xMax + b;
                points = [this.toCanvasX(xMin), this.toCanvasY(y1), this.toCanvasX(xMax), this.toCanvasY(y2)];
            }
        }

        // Draw or update the line
        if (this.currentLine) {
            this.currentLine.points(points);
        } else {
            this.currentLine = new Konva.Line({
                points: points,
                stroke: "red",
                strokeWidth: 3,
                lineCap: "round",
                lineJoin: "round",
            });
            this.graphLayer.add(this.currentLine);
            // Keep the drawn line behind platforms so platforms remain visible
            this.currentLine.zIndex(1);
        }
    }

    private drawPersistentBridgeSegment(fromX: number, fromY: number, toX: number, toY: number) {
        const width = this.model.getWidth();
        const scale = this.model.getScale();
        const originX = this.model.getOriginX();
        const xMin = -originX / scale;
        const xMax = (width - originX) / scale;
        const key = `${fromX}|${fromY}|${toX}|${toY}`;
        if (this.bridgesKeys.has(key)) return;
        const x1 = Math.max(Math.min(fromX, xMax), xMin);
        const x2 = Math.max(Math.min(toX, xMax), xMin);
        const y1 = fromY;
        const y2 = toY;
        const line = new Konva.Line({
            points: [this.toCanvasX(x1), this.toCanvasY(y1), this.toCanvasX(x2), this.toCanvasY(y2)],
            stroke: "red",
            strokeWidth: 3,
            lineCap: "round",
            lineJoin: "round",
            name: "bridgeSegment",
        });
        this.graphLayer.add(line);
        line.zIndex(1);
        this.bridgesKeys.add(key);
    }

    private clearPersistentBridgeSegments() {
        const segments = this.graphLayer.find('.bridgeSegment');
        segments.forEach(node => node.destroy());
        this.bridgesKeys.clear();
    }

    private drawPlatform(startX: number, endX: number, y: number, bridged: boolean) {
        // 1. Define math coordinates
        const mathY = y; // platform height

        // 2. Convert to pixel coordinates
        const points = [
            this.toCanvasX(startX),
            this.toCanvasY(mathY),
            this.toCanvasX(endX),
            this.toCanvasY(mathY)
        ];

        // 3. Create the Konva Line
        const platform = new Konva.Line({
            points: points,
            stroke: bridged ? "#2ecc71" : "black",
            strokeWidth: 6,
            lineCap: "round",
            zIndex: 1,
            name: "platform",
        });

        // 4. Add to the graph layer
        this.graphLayer.add(platform);
        platform.zIndex(2);
    }



    private clearEquationLine() {
        if (this.currentLine) {
            this.currentLine.destroy();
            this.currentLine = null;
        }
    }

    private clearAllPlatforms() {
        // Find all nodes on the layer with the name 'platform'
        const platforms = this.graphLayer.find('.platform');

        // Destroy them
        platforms.forEach(platformNode => {
            platformNode.destroy();
        });
    }

    /** This is the main update function called by the model's notification. */
    public update = () => {
        // Clear persistent segments when level changes or after a reset
        const currentLevel = this.model.getLevel();
        if (currentLevel !== this.lastLevel) {
            this.clearPersistentBridgeSegments();
            this.lastLevel = currentLevel;
        } else {
            // Heuristic: if input is reset and no equation, clear history (likely a retry)
            const eqText = this.model.getEquationString();
            if (eqText.trim() === 'y =') {
                this.clearPersistentBridgeSegments();
            }
        }
        // 1. Clear all old platforms
        this.clearAllPlatforms();


        // 2. Redraw all platforms (reading from the model)
        const platforms = this.model.getPlatformsData();
        platforms.forEach(platform => {
            this.drawPlatform(platform.startX, platform.endX, (platform as any).y ?? 0, (platform as any).bridged ?? false);
        });

        // 3. Update persistent and current line based on model data
        const rc = this.model.getRecentConnectionPair();
        if (rc) this.drawPersistentBridgeSegment(rc.fromX, rc.fromY, rc.toX, rc.toY);

        const seg = this.model.getSegmentInput();
        const eq = this.model.getParsedEquation();

        // If there is segment input, show info and preview line
        if (seg) {
            if (eq) this.drawEquationLine(eq.m, eq.b);
            this.updateSegmentInfo(seg.m, seg.length);

            // check if it can bridge
            if (this.model.canBridgeWithCurrentSegment()) {
                this.hideSegmentError();
            } else {
                this.showSegmentError("Cannot reach next platform");
            }

        } else {
            this.clearEquationLine();
            this.clearSegmentInfo();
            this.hideSegmentError();
        }


        // 4. UI equation display disabled

        // 5. Redraw both layers
        this.graphLayer.batchDraw();
        this.uiLayer.batchDraw();
    };
}
