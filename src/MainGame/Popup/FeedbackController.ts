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

    handleTurnComplete(isSuccess: boolean, expectedLine: {m: number, length: number}, userLine: {m: number, length: number}) {
        this.model.evaluateTurn(isSuccess, expectedLine, userLine);
    }

    handleClose() {
        this.model.clearFeedback();
    }
}