import { GraphModel } from "./GraphModel";
import { parseEquation, LineEquation } from './Equation';
import { FeedbackController } from "../Popup/FeedbackController";

export class GraphController {
    private model: GraphModel;

    // NEW: UI input references
    private equationInput: HTMLInputElement | null;
    private lengthInput: HTMLInputElement | null;
    private drawBtn: HTMLButtonElement | null;
    private feedbackController: FeedbackController;

    constructor(model: GraphModel, feedbackController: FeedbackController) {
        this.model = model;
        this.feedbackController = feedbackController;
        // Attach keyboard event listener (existing behaviour)
        window.addEventListener("keydown", this.handleKeydown);

        // NEW — Hook slope/length/draw UI elements
        this.equationInput = document.getElementById("equationInput") as HTMLInputElement | null;
        this.lengthInput = document.getElementById("lengthInput") as HTMLInputElement | null;
        this.drawBtn = document.getElementById("drawBtn") as HTMLButtonElement | null;

        // NEW — Attach draw button logic
        if (this.drawBtn) {
            this.drawBtn.onclick = () => this.triggerDraw();
        }

    }

    private handleKeydown = (e: KeyboardEvent) => {
        // Ignore typing when focused on inputs/textareas/contenteditable
        const target = e.target as HTMLElement | null;
        if (target) {
            const tag = target.tagName;
            const isEditable = (target as any).isContentEditable;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || isEditable) {
                return;
            }
        }


        // input for equation and length
        if (this.equationInput && this.lengthInput) {
            const onKey = (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.triggerDraw();
                }
            };
            this.equationInput.addEventListener("keydown", onKey);
            this.lengthInput.addEventListener("keydown", onKey);
        }
    };

    // parse slope & length then call model
    private triggerDraw() {
        if (!this.equationInput || !this.lengthInput) return;
        const prefix = "y=";
        const eqStr = prefix + this.equationInput.value;
        const eq = parseEquation(eqStr);
        const m = eq?.m;
        const L = parseFloat(this.lengthInput.value);
        if (m == null) return;
        if (eq?.b != null && eq.b != 0) return;
        if (isNaN(L) || L <= 0) return;
        this.model.setSegmentInput(m, L);
        this.model.tryBridgeWithSegment();

        // After drawing, evaluate and provide feedback
        console.log('Evaluating user line for feedback...');
        const userLine: LineEquation = { m: m, b: 0 };
        const expectedLine: LineEquation = this.model.getExpectedEquation();
        // Trigger feedback popup
        this.feedbackController.handleTurnComplete(expectedLine, userLine);
    }

    // NEW — fraction parsing
    private parseMaybeFraction(text: string): number | null {
        if (!text) return null;
        const s = text.trim();
        if (s.includes('/')) {
            const [numStr, denStr] = s.split('/').map(t => t.trim());
            if (!numStr || !denStr) return null;
            const num = parseFloat(numStr);
            const den = parseFloat(denStr);
            if (!isFinite(num) || !isFinite(den) || den === 0) return null;
            return num / den;
        }
        const v = parseFloat(s);
        return isFinite(v) ? v : null;
    }
}
