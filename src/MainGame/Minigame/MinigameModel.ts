import { SCALE } from "../Graph/Const";
import { getShapePrompt, ShapePrompt, PuzzlePiece } from "./ShapePrompts";


/**
 * MinigameModel
 * Manages the state and logic for Shape Builder minigame including
 * - storing current shape prompt and target silhouette
 * - dragging and dropping puzzle pieces
 * - validating success/failure
 */

export {ShapePrompt, PuzzlePiece};

// 8.0 Define MinigameModel class 
export class MinigameModel{
    // Dimensions of Canvas
    private width: number;
    private height: number;
    private originX: number;
    private originY: number;
    private scale: number;

    // Shape of current data
    private currPrompt: ShapePrompt | null;
    // 2.1 Declare pieces as arr of PuzzlePiece[]
    private pieces: PuzzlePiece[];
    private feedbackMsg: string;
    private listeners: Function[];

    constructor(width: number, height: number){
        this.width = width;
        this.height = height;
        this.originX = width / 2;
        this.originY = height / 2;
        // Take SCALE from Graph/Const
        this.scale = SCALE;
        this.currPrompt = null;
        this.pieces = [];
        this.feedbackMsg = "";
        // Observer pattern
        this.listeners = [];
    }

    // Public Getters
    public getWidth = () => this.width;
    public getHeight = () => this.height;
    public getOriginX = () => this.originX;
    public getOriginY = () => this.originY;
    public getScale = () => this.scale;
    public getCurrPrompt = () => this.currPrompt;
    public getPieces = () => this.pieces;
    public getFeedbackMsg = () => this.feedbackMsg;

    // 8.1 Initialize new shape puzzle taken from ../Minigame/ShapePrompts.ts
    public startShape(shapeId: string){
        const prompt = getShapePrompt(shapeId, this.width, this.height);
        if (!prompt){
            this.feedbackMsg = "Shape not found.";
            this.notify();
            return;
        }
        
        this.currPrompt = prompt;
        // Deep copy pieces to reset positions
        this.pieces = prompt.pieces.map(p => ({...p, locked: false}));
        // 8.2 Taken from ShapePrompt interface
        this.feedbackMsg = prompt.caption;
        this.notify();
    }

    // 10.0 Update piece position called during drag functionality
    public updatePiecePosition(pieceId: string, x: number, y: number){
        const piece = this.pieces.find(p => p.id === pieceId);
        if(!piece || piece.locked) return;

        piece.x = x;
        piece.y = y;
        this.notify();
    }

    // 8.3 Subscribe listener function to model updates
    public subscribe(listener: Function){
        this.listeners.push(listener);
    }

    // 8.4 Notify subscribed listeners of state changes
    private notify(){
        for(const listener of this.listeners){
            listener();
        }
    }
}