import { INPUT_PREFIX, SCALE } from "../Graph/Const";
import { LineEquation } from "../Graph/Equation";
import { ShapePrompt, getShapePrompt } from "./ShapePrompts";

/**
 * LineSegment represents one section of the prompted shape
 * where each shape contains a start point, end point, and correct equation
 */

// 2.0 Define LineSegment interface
export interface LineSegment{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    correctEquation: LineEquation;
    moe: number; // How closely accurate the user's line must be in units
}

/**
 * PlacedLine represents the line placed by the user successfully
 */
// #? Define PlacedLine interface
// export interface PlacedLine{
//     equation: LineEquation;
//     segmentIdx: number; // The segment's corresponding line
// }

/**
 * MinigameModel
 * Manages the state and logic for Shape Builder minigame including
 * - storing current shape prompt and target segments
 * - tracking user's equation input
 * - validating success/failure in user's input against target segments
 * - tracking completion progress
 * - using margin of error matching to account for slightly flawed equations
 * - calculating accuracy percent for user feedback
 */

// 3.0 Define MinigameModel class 
export class MinigameModel{
    // Dimensions of Canvas
    private width: number;
    private height: number;
    private originX: number;
    private originY: number;
    private scale: number;

    // Shape of current data
    private currPrompt: ShapePrompt | null;
    // 2.1 Declare targetSegments as arr of LineSegment
    private targetSegments: LineSegment[];
    // #? Declare placedLines as arr of PlacedLine
    // private placedLines: PlacedLine[];
    private listeners: Function[];

    constructor(width: number, height: number){
        this.width = width;
        this.height = height;
        this.originX = width / 2;
        this.originY = height / 2;
        // 3.1 Take SCALE from Graph/Const
        this.scale = SCALE;
        this.currPrompt = null;
        this.targetSegments = [];
        this.listeners = [];
    }

    // Public Getters
    public getWidth = () => this.width;
    public getHeight = () => this.height;
    public getOriginX = () => this.originX;
    public getOriginY = () => this.originY;
    public getScale = () => this.scale;
    public getCurrPrompt = () => this.currPrompt;
    public getTargetSegments = () => this.targetSegments;
    // public getPlacedLines = () => this.placedLines;

    // Initialize new shape challenge taken from Minigame/ShapePrompts.ts
    public startShape(shapeId: string){
        this.currPrompt = getShapePrompt(shapeId);
        this.targetSegments = this.currPrompt ? this.currPrompt.segments : [];
        this.notify();
    }

    // Subscribe listener function to model updates
    public subscribe(listener: Function){
        this.listeners.push(listener);
    }

    // Notify subscribed listeners of state changes
    private notify(){
        for(const listener of this.listeners){
            listener();
        }
    }
}