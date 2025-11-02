// src/uiView.ts

import Konva from "konva";
import { GraphModel } from "./GraphModel";

export class UIView {
  private model: GraphModel;
  private stage: Konva.Stage;
  private layer: Konva.Layer;

  // UI Elements
  private equationText: Konva.Text;
  private equationBg: Konva.Rect;
  private errorText: Konva.Text;

  constructor(model: GraphModel, stage: Konva.Stage) {
    this.model = model;
    this.stage = stage;

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Initialize UI Elements
    // zIndex is now per-layer, so these can be low
    this.equationBg = new Konva.Rect({
      x: 0, y: 0,
      width: this.model.getWidth(),
      height: 40,
      fill: "#fdfdfd",
      stroke: "#eee",
      strokeWidth: 1,
      zIndex: 0,
    });
    this.equationText = new Konva.Text({
      x: 10, y: 10,
      text: this.model.getEquationString(),
      fontSize: 18,
      fontFamily: "monospace",
      fill: "#333",
      zIndex: 1,
    });
    this.errorText = new Konva.Text({
      x: 10, y: 40,
      text: this.model.getErrorMessage(),
      fontSize: 14,
      fontFamily: "sans-serif",
      fill: "blue",
      zIndex: 1,
    });

    this.layer.add(this.equationBg, this.equationText, this.errorText);
    this.layer.draw();

    // Subscribe to model changes
    this.model.subscribe(this.update);
  }

  /** This is the main update function called by the model's notification. */
  public update = () => {
    // 1. Check if a resize is needed
    this.handleResize();

    // 2. Update text content from model
    this.equationText.text(this.model.getEquationString());
    this.errorText.text(this.model.getErrorMessage());
    this.errorText.fill(this.model.getErrorMessage().startsWith("Invalid") ? "red" : "blue");

    this.layer.batchDraw();
  };

  /** Checks for window resize and updates the UI background width. */
  private handleResize() {
    const newWidth = this.model.getWidth();
    if (this.equationBg.width() !== newWidth) {
      this.equationBg.width(newWidth);
    }
  }
}