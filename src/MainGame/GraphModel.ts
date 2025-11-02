
import { SCALE, INPUT_PREFIX } from './Const';
import { parseEquation, LineEquation } from './Equation';



export class GraphModel {

    // Application State
    private originX: number;
    private originY: number;

    private width: number;
    private height: number;
    private scale: number;
    private equationString: string;
    private errorMessage: string;
    private parsedEquation: LineEquation | null;


    // Observer pattern
    private listeners: Function[] = [];

    constructor() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.originX = this.width / 2;
        this.originY = this.height / 2;
        this.scale = SCALE;
        this.equationString = INPUT_PREFIX;
        this.errorMessage = "";
        this.parsedEquation = null;
    }

    // --- Public Getters ---
    getWidth = () => this.width;
    getHeight = () => this.height;
    getScale = () => this.scale;
    getEquationString = () => this.equationString;
    getErrorMessage = () => this.errorMessage;
    getParsedEquation = () => this.parsedEquation;
    getOriginX = () => this.originX;
    getOriginY = () => this.originY;

    // --- Public Methods (called by Controller) ---
    public setOrigin(x: number, y: number) {
        this.originX = x;
        this.originY = y;
        this.notify(); // Tell the views to redraw
    }

    public subscribe(listener: Function) {
        this.listeners.push(listener);
    }


    public appendCharacter(char: string) {
        this.clearError();
        this.equationString += char;
        this.notify();
    }

    public deleteCharacter() {
        this.clearError();
        if (this.equationString.length > INPUT_PREFIX.length) {
            this.equationString = this.equationString.slice(0, -1);
        }
        this.notify();
    }

    public parseAndPlot() {
        const parsed = parseEquation(this.equationString);
        if (parsed) {
            this.parsedEquation = parsed;
            this.errorMessage = "";
        } else {
            this.parsedEquation = null;
            this.errorMessage = "Invalid format. Use 'y = mx + b'";
        }
        this.notify();
    }

    // --- Private Helpers ---

    private notify() {
        for (const listener of this.listeners) {
            listener();
        }
    }

    private clearError() {
        if (this.errorMessage !== "") {
            this.errorMessage = "";
        }
    }



    public updateDimensions(width: number, height: number) {
        // Check if the origin was still the *old* center
        const oldCenterX = this.width / 2;
        const oldCenterY = this.height / 2;

        if (this.originX === oldCenterX) {
            this.originX = width / 2; // Move it to the new center
        }
        if (this.originY === oldCenterY) {
            this.originY = height / 2; // Move it to the new center
        }
        // If the user set a custom origin (e.g., bottom-left),
        // it will NOT equal the old center, so it will stay put.

        this.width = width;
        this.height = height;
        this.notify();
    }
}