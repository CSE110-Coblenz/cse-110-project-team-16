
import { SCALE, INPUT_PREFIX } from './Const';


interface LineEquation {
    m: number;
    b: number;
}

export class EquationParser {

    constructor() {
    }

    public parseEquation(eq: string): LineEquation | null {
        eq = eq.replace(/\s+/g, "");
        if (!eq.startsWith("y=")) return null;

        const expr = eq.substring(2);
        let m = 0;
        let b = 0;
        const xIndex = expr.indexOf("x");

        if (xIndex === -1) {
            m = 0;
            b = parseFloat(expr);
        } else {
            const mStr = expr.substring(0, xIndex);
            if (mStr === "") m = 1;
            else if (mStr === "-") m = -1;
            else m = parseFloat(mStr);

            const bStr = expr.substring(xIndex + 1);
            if (bStr === "") b = 0;
            else b = parseFloat(bStr);
        }

        if (isNaN(m) || isNaN(b)) return null;
        return { m, b };
    }
}


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
    private parser: EquationParser;

    // Observer pattern
    private listeners: Function[] = [];

    constructor() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.originX = this.width / 2;
        this.originY = this.height / 2;
        this.scale = SCALE;
        this.equationString = INPUT_PREFIX;
        this.errorMessage = "Click and start typing...";
        this.parsedEquation = null;
        this.parser = new EquationParser();
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
        const parsed = this.parser.parseEquation(this.equationString);
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