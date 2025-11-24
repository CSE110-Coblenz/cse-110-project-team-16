import { SCALE, INPUT_PREFIX } from '../Graph/Const';
import { parseEquation, LineEquation } from '../Graph/Equation';
export class FeedbackModel {
    // data members
    visible: boolean;
    feedbackText: string[];

    // observers for this model
    private listeners: Function[] = [];

    // initialize
    constructor() { 
        this.visible = false;
        this.feedbackText = [];
    }
    // register observer
    addListener(listener: Function) {
        this.listeners.push(listener);
    }
    // notify observer
    notify() {
        for (let listener of this.listeners) {
            listener();
        }
    }

    setFeedbackText(texts: string[], visible: boolean) {
        this.feedbackText = texts;
        this.visible = visible;
        this.notify();
    }
    calculateDeviation(expected: LineEquation, actual: LineEquation) {
        // calculate deviation between expected and actual line equations
        const slopeDeviation = (expected.m - actual.m);
        const interceptDeviation = (expected.b - actual.b);
        return { slopeDeviation, interceptDeviation };
    }
    evaluateTurn(isSuccess: boolean, expected: {m: number, length: number}, actual: {m: number, length: number}) {
        const tips: string[] = [];
        if (isSuccess) {
            tips.push("Great job! Click to go to the next level.");
            this.setFeedbackText(tips, true);
            return;
        }
        const epsilonSlope = 0.1;
        const epsilonLength = 0.1;
        const slopeDiff = expected.m - actual.m;
        const lengthDiff = expected.length - actual.length;
        if (Math.abs(slopeDiff) > epsilonSlope) {
            tips.push(slopeDiff > 0 ? "Slope is too shallow! Try a steeper angle." : "Slope is too steep! Try a shallower angle.");
        }

        if (Math.abs(lengthDiff) > epsilonLength) {
            tips.push(lengthDiff > 0 
                ? "Bridge is too short!" 
                : "Bridge is too long!");
        }
        if (tips.length === 0) {
            tips.push("Close! Try adjusting slightly");
        }
        this.setFeedbackText(tips, true);
    }
    clearFeedback() {
        this.feedbackText = [];
        this.visible = false;
        this.notify();
    }

}