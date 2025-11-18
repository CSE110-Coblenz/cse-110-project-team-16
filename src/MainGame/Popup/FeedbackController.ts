import { FeedbackModel } from "./FeedbackModel";
import { FeedbackView } from "./FeedbackView";
import { LineEquation } from "../Graph/Equation";
export class FeedbackController {
    private model: FeedbackModel;
    private view: FeedbackView;
    
    constructor(model: FeedbackModel, view: FeedbackView) {
        this.model = model;
        this.view = view;

        this.model.addListener(() => this.view.render(this.model));
        this.view.bindClose(() => this.handleClose());
    }

    handleTurnComplete(expectedLine: LineEquation, userLine: LineEquation) {
        this.model.evaluateTurn(expectedLine, userLine);
    }

    handleClose() {
        this.model.clearFeedback();
    }
}