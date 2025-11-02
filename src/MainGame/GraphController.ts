// src/controller.ts

import { GraphModel } from "./GraphModel";

export class GraphController {
    private model: GraphModel;

    constructor(model: GraphModel) {
        this.model = model;

        // Attach event listeners
        window.addEventListener("keydown", this.handleKeydown);
        window.addEventListener("resize", this.handleResize);
    }

    private handleKeydown = (e: KeyboardEvent) => {
        // We don't need to prevent default for printable chars
        if (e.key === "Enter" || e.key === "Backspace") {
            e.preventDefault();
        }

        if (e.key === "Enter") {
            this.model.parseAndPlot();
        } else if (e.key === "Backspace") {
            this.model.deleteCharacter();
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            // Only talk to the model
            this.model.appendCharacter(e.key);
        }
    };

    private handleResize = () => {
        // ONLY tell the model about the new size.
        // The model.notify() will trigger both views
        // to call their update() and handleResize() methods.
        this.model.updateDimensions(window.innerWidth, window.innerHeight);
    };
}