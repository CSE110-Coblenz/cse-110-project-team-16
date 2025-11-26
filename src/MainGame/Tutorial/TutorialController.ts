import { TutorialModel } from "./TutorialModel";
import { TutorialView } from "./TutorialView";


//slide data, popup UI, tracks open/close state
export class TutorialController {
  private model: TutorialModel; 
  private view: TutorialView;   
  private isOpen: boolean;

  constructor(model: TutorialModel, view: TutorialView) {
    this.model = model;
    this.view = view;
    this.isOpen = false;

    //button event listeners

    // Next slide in tutorial
    this.view.nextButton.on("click tap", () => {
      if (this.model.hasNext()) {
        this.model.next();
        this.view.update(this.model.getCurrent());
      }
    });

    // Previous slide in tutorial
    this.view.prevButton.on("click tap", () => {
      if (this.model.hasPrev()) {
        this.model.prev();
        this.view.update(this.model.getCurrent());
      }
    });

    // Close tutorial
    this.view.closeButton.on("click tap", () => {
      this.close();
    });
  }


  // Open the tutorial popup, reset to first slide
  open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.model.reset();
    this.view.attach();
    this.view.update(this.model.getCurrent());
  }

  //close the tutorial popup
  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.view.detach();
  }
}