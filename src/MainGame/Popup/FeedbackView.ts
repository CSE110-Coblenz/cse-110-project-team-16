import Konva from "konva";
import { FeedbackModel } from "./FeedbackModel";
export class FeedbackView {
    private stage: Konva.Stage;
    private feedbackLayer: Konva.Layer;
    private feedbackGroup: Konva.Group;
    private textNode: Konva.Text;
    private closeButtonRect: Konva.Rect;


    constructor(stage: Konva.Stage) {
        this.stage = stage;
        this.feedbackLayer = new Konva.Layer();
        this.feedbackGroup = new Konva.Group();
        this.textNode = new Konva.Text({
            x: 50,
            y: 50,
            text: "Feedback",
            fontSize: 20,
            fontFamily: "Arial",
            fill: "black"
        });
        this.closeButtonRect = new Konva.Rect({
            x: 200,
            y: 50,
            width: 50,
            height: 30,
            fill: "red"
        });
        this.feedbackGroup.add(this.textNode);
        this.feedbackGroup.add(this.closeButtonRect);
        this.feedbackLayer.add(this.feedbackGroup);
        this.stage.add(this.feedbackLayer);
        this.feedbackLayer.draw();
    }

    bindClose(handler: () => void) {
        this.closeButtonRect.on('click tap', handler);
        this.closeButtonRect.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
        });
        this.closeButtonRect.on('mouseout', function () {
            document.body.style.cursor = 'default';
        });
    }

    render(model: FeedbackModel) {
        if (model.visible) {
            const combinedText = model.feedbackText.join('\n');
            this.textNode.text(combinedText);

            const textHeight = this.textNode.height();
            const padding = 20; 

            const requiredHeight = textHeight + padding + 40; 
            const rect = this.feedbackGroup.findOne('Rect');
            if (rect) {
                rect.height(requiredHeight);
            }
            this.closeButtonRect.y(textHeight + padding);
            const closeText = this.feedbackGroup.find('Text')[1]; 
            if (closeText) {
                closeText.y(this.closeButtonRect.y() + 5);
            }
            this.feedbackGroup.show();
        }
        else {
            this.feedbackGroup.hide();
        }
        this.feedbackLayer.batchDraw();
    }
}