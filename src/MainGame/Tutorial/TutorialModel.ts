// MainGame/Tutorial/TutorialModel.ts


//import the slide pictures for tutorial 

import slide1 from "./assets/TutorSlide1.png.png";
import slide2 from "./assets/TutorSlide2.png";
// Define the structure of a tutorial slide being a text and image that I chose 
export interface TutorialSlide {
  text: string;
  imageSrc?: string;
}


// Defines the shape of the slide object with image and text
export class TutorialModel {
  private slides: TutorialSlide[];
  private index: number;

// constructor initializes the slides with text and images
  constructor() {
    this.slides = [
      {
        text: "How To Play??? 🥲 Your GOAL is to get across the other side and save the _____?",
        imageSrc: slide1, 
      },
      {
        text: "To get across, type the right slope and right length (remember slope is a factor of x)",
        imageSrc: slide2, 
      },
    ];

    this.index = 0;
  }

  // return the current slide
  getCurrent(): TutorialSlide {
    return this.slides[this.index];
  }
// check if there is a next slide
  hasNext(): boolean {
    return this.index < this.slides.length - 1;
  }
// check if there is a previous slide
  hasPrev(): boolean {
    return this.index > 0;
  }
// move to the next slide
  next(): void {
    if (this.hasNext()) {
      this.index++;
    }
  }
// move to the previous slide
  prev(): void {
    if (this.hasPrev()) {
      this.index--;
    }
  }
//  reset to the first slide
  reset(): void {
    this.index = 0;
  }
}