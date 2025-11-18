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
    evaluateTurn(expected: LineEquation, actual: LineEquation) {
        const tips: string[] = [];
        const epsilon = 0.1;
        const slopeDiff = expected.m - actual.m;
        const interceptDiff = expected.b - actual.b;
        if (Math.abs(slopeDiff) > epsilon) {
            tips.push(slopeDiff > 0 ? "Slope is too shallow! Try a steeper angle." : "Slope is too steep! Try a shallower angle.");
        }

        if (Math.abs(interceptDiff) > epsilon) {
            tips.push(interceptDiff > 0 ? "Your starting point (intercept) is too low." : "Your starting point (intercept) is too high.");
        }
        if (tips.length === 0) {
            tips.push("Perfect! You've got it right.");
        }
        this.setFeedbackText(tips, true);
    }
    clearFeedback() {
        this.feedbackText = [];
        this.visible = false;
        this.notify();
    }

}