import { SCALE } from "../Graph/Const";
import { getShapePrompt, ShapePrompt, PuzzlePiece } from "./ShapePrompts";


/**
 * MinigameModel
 * Manages the state and logic for Shape Builder minigame including
 * - storing current shape prompt and target silhouette
 * - dragging and dropping puzzle pieces
 * - validating success/failure
 */

export type { ShapePrompt, PuzzlePiece };

const SNAP_THRESHOLD = 30; // pixels
const ROTATION_THRESHOLD = 15; // degrees

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
    private feedbackType: "success" | "error" | "neutral" = "neutral";
    private listeners: Function[];

    // 13.1 Track completion
    private isComplete: boolean;

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
        this.isComplete = false;
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
    public getIsComplete = () => this.isComplete;
    public getFeedbackType = () => this.feedbackType;

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
        // 13.2 Reset feedback
        this.feedbackType = "neutral";
        // 13.3 Reset completion state
        this.isComplete = false;
        this.notify();
    }

    // 10.0 Update piece position called during drag functionality
    public updatePiecePosition(pieceId: string, x: number, y: number){
        const piece = this.pieces.find(p => p.id === pieceId);
        if(!piece || piece.locked) return;
        piece.x = x;
        piece.y = y;
        // DO NOT notify during drag (for now?) to remove lag, causes drawing
        // this.notify(); 
    }

    // 12.0 Snap piece to target position logic
    public snapPiece(pieceId: string): boolean{
        const piece = this.pieces.find(p => p.id === pieceId);
        if(!piece || piece.locked) return false;

        // Compute distance from curr position to target
        const dx = piece.x - piece.targetX;
        const dy = piece.y - piece.targetY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Compute rotation difference
        const rotateDiff = Math.abs(piece.rotation - piece.targetRotation);

        // Check whether piece is close enough to snap into place
        if(distance <= SNAP_THRESHOLD && rotateDiff <= ROTATION_THRESHOLD){
            // Then snap, lock piece
            piece.x = piece.targetX;
            piece.y = piece.targetY;
            piece.rotation = piece.targetRotation;
            piece.locked = true;

            this.feedbackMsg = `${piece.id} locked in place!`;
            this.feedbackType = "success";
            // 13.4 Check if puzzle is finished
            this.checkCompletion();
            // // Trigger redraw to show the locked piece
            // this.notify();
            // return true;
        }
        else{
            // 13.5 Snap failure
            if(distance > SNAP_THRESHOLD){
                this.feedbackMsg = "Move piece closer to the outline.";
            }
            else{
                this.feedbackMsg = "Rotate piece to match the outline.";
            }
            this.feedbackType = "error";
        }
        // return false;
        this.notify();
    }

    // 13.6 Helper to count locked pieces
    private getLockedCount(): number{
        return this.pieces.filter(p => p.locked).length;
    }

    // 13.0 Check whether puzzle is complete
    public checkCompletion(): boolean{
        this.isComplete = this.pieces.every(p => p.locked);
        if(this.isComplete){
            this.feedbackMsg = "Puzzle Complete! Well done!";
            this.feedbackType = "success";
            // this.notify();
        }
        return this.isComplete;
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