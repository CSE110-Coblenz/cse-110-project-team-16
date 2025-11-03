
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

    private platformsData: Array<{ startX: number, endX: number }> = [];

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

        // MOCK only
        this.platformsData.push({ startX: -10, endX: -5 });
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
    getPlatformsData = () => this.platformsData;

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

            // for platform creation, MOCK only
            // 1. Clear old platform data
            this.platformsData = [];

            // 2. Generate a new random platform
            const mathMinX = -this.originX / this.scale;
            const mathMaxX = (this.width - this.originX) / this.scale;
            const randX1 = Math.random() * (mathMaxX - mathMinX) + mathMinX;
            const randX2 = Math.random() * (mathMaxX - mathMinX) + mathMinX;

            // 3. Add the new platform to the model's array
            this.platformsData.push({ startX: Math.min(randX1, randX2), endX: Math.max(randX1, randX2) });
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

}