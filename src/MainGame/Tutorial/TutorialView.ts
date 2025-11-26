// MainGame/Tutorial/TutorialView.ts

import Konva from "konva";
import type { TutorialSlide } from "./TutorialModel";

// Renders the tutorial popup and its contents
export class TutorialView {
  private stage: Konva.Stage;
  private layer: Konva.Layer;

  private backdrop: Konva.Rect;
  private panel: Konva.Rect;
  private titleText: Konva.Text;
  private bodyText: Konva.Text;
  private container: HTMLDivElement;
  private imageNode: Konva.Image; 

  // Buttons the controller will listen to
  public readonly nextButton: Konva.Group;
  public readonly prevButton: Konva.Group;
  public readonly closeButton: Konva.Group;

// Sets up the tutorial popup elements and create layer
  constructor(stage: Konva.Stage) {
    this.stage = stage;
    this.layer = new Konva.Layer();
    this.container = this.stage.container() as HTMLDivElement;

    const width = this.stage.width();
    const height = this.stage.height();
// create the backdrop for tutorial popup
    this.backdrop = new Konva.Rect({
      x: 0,
      y: 0,
      width,
      height,
      fill: "rgba(0,0,0,0.6)",
    });

    const boxWidth = Math.min(700, width - 80);
    const boxHeight = Math.min(400, height - 80);
    const boxX = (width - boxWidth) / 2;
    const boxY = (height - boxHeight) / 2;
// create the main panel centered on screen
    this.panel = new Konva.Rect({
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      fill: "#1f2933",
      cornerRadius: 20,
      shadowBlur: 10,
      shadowOpacity: 0.4,
    });

// Body and title text feilds
    this.titleText = new Konva.Text({
      x: boxX + 24,
      y: boxY + 20,
      width: boxWidth - 48,
      align: "left",
      text: "",
      fontSize: 28,
      fontStyle: "bold",
      fill: "#ffffff",
    });

    this.bodyText = new Konva.Text({
      x: boxX + 24,
      y: boxY + 70,
      width: boxWidth - 48,
      text: "",
      fontSize: 18,
      fill: "#e5e7eb",
      lineHeight: 1.3,
    });
// image node gets the impages from TutorialModel 
    this.imageNode = new Konva.Image({
    x: boxX + 40,
    y: boxY + 150,        // below the text
    width: boxWidth - 80, // leave margins on left/right
    height: 140,
    image: undefined as unknown as HTMLImageElement, // 👈 dummy placeholder
    });


    // these create the buttons used in the tutorial popup
    const createButton = (
      label: string,
      x: number,
      y: number
    ): Konva.Group => {
      const group = new Konva.Group({ x, y });

      const rect = new Konva.Rect({
        x: 0,
        y: 0,
        width: 110,
        height: 40,
        cornerRadius: 10,
        fill: "#374151",
        shadowBlur: 6,
      });

      const text = new Konva.Text({
        x: 0,
        y: 11,
        width: 110,
        align: "center",
        text: label,
        fontSize: 18,
        fill: "#ffffff",
      });

      group.add(rect, text);

      group.on("mouseenter", () => {
        rect.fill("#4b5563");
        this.layer.draw();
        this.container.style.cursor = "pointer";
      });

      group.on("mouseleave", () => {
        rect.fill("#374151");
        this.layer.draw();
        this.container.style.cursor = "default";
      });

      return group;
    };
// creating the buttons and positioning them
    const bottomY = boxY + boxHeight - 60;

    this.prevButton = createButton("Back", boxX + 24, bottomY);
    this.nextButton = createButton("Next", boxX + boxWidth - 24 - 110, bottomY);
    this.closeButton = createButton(
      "Close",
      boxX + boxWidth / 2 - 55,
      bottomY
    );
// adding all elements to the layer
    this.layer.add(
      this.backdrop,
      this.panel,
      this.titleText,
      this.bodyText,
      this.imageNode,
      this.prevButton,
      this.nextButton,
      this.closeButton
    );
  }
// show the tutorial popup
  attach(): void {
    this.stage.add(this.layer);
    this.layer.moveToTop();
    this.stage.draw();
  }
// hide the tutorial popup
  detach(): void {
    this.layer.destroy();
    this.container.style.cursor = "default";
    this.stage.draw();
  }
// Update the tutorial popup with the current slide data
    update(slide: TutorialSlide): void {
    this.bodyText.text(slide.text);

    if (slide.imageSrc) {
      const img = new Image();
      img.src = slide.imageSrc;

      img.onload = () => {
        this.imageNode.image(img);
        this.layer.draw();
      };
    } else {
      // No image for this slide → clear it
      this.imageNode.image(undefined as any);
      this.layer.draw();
    }
  }
}