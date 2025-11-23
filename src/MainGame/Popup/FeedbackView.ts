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
        this.feedbackGroup = new Konva.Group({
            x: stage.width() / 2 - 150, // Assuming width approx 300
            y: stage.height() / 2 - 100,
            draggable: true
        });
        const bgRect = new Konva.Rect({
            width: 300,
            height: 200,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 2,
            cornerRadius: 10,
            shadowBlur: 10,
            name: 'bg' // Name it to find it easily later
        });
        // 2. Feedback Text
        this.textNode = new Konva.Text({
            x: 20,
            y: 20,
            width: 260, // Limit width to force wrapping
            text: "Feedback",
            fontSize: 18,
            fontFamily: "Arial",
            fill: "black"
        });
        // 3. Close Button Rect
        this.closeButtonRect = new Konva.Rect({
            x: 100, // Centered relative to the group width (300)
            y: 150,
            width: 100,
            height: 30,
            fill: "#ff5555",
            cornerRadius: 5,
            name: 'closeRect'
        });
        // 4. Close Button Text
        const closeText = new Konva.Text({
            x: 100,
            y: 155,
            width: 100,
            text: "Close",
            fontSize: 14,
            fill: "white",
            align: "center",
            listening: false // Let clicks pass through to the rect
        });

        this.feedbackGroup.add(bgRect);          // Index 0 (Rect)
        this.feedbackGroup.add(this.textNode);   // Index 0 (Text)
        this.feedbackGroup.add(this.closeButtonRect); // Index 1 (Rect)
        this.feedbackGroup.add(closeText);       // Index 1 (Text)
        this.feedbackLayer.add(this.feedbackGroup);
        this.stage.add(this.feedbackLayer);
        // initially hidden
        this.feedbackGroup.hide();
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
            const bottomPadding = 60; // Space for button

            const requiredHeight = textHeight + padding + bottomPadding; 
            const rect = this.feedbackGroup.findOne('.bg') as Konva.Rect;
            if (rect) {
                rect.height(requiredHeight);
            }
            const buttonY = textHeight + padding + 10;
            this.closeButtonRect.y(buttonY);


            const closeText = this.feedbackGroup.find('Text')[1] as Konva.Text; 
            if (closeText) {
                closeText.y(buttonY + 8);
            }
            this.feedbackGroup.show();
            this.feedbackGroup.moveToTop(); // Need to show above other elements
        }
        else {
            this.feedbackGroup.hide();
        }
        this.feedbackLayer.batchDraw();
    }
}