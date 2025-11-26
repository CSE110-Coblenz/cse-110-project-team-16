import { MinigameModel } from "./MinigameModel";

/**
 * MinigameController
 * Handles user input and keyboard events for Shape Builder minigame including
 * - listening for keyboard input
 * - delegating input processing to model 
 */

// 5.0 Define MinigameController class
// export class MinigameController{
//     private model: MinigameModel;
//     private isActive: boolean;

//     // 5.2
//     constructor(model: MinigameModel){
//         this.model = model;
//         this.isActive = false;
//     }
// ^ working on dragging/dropping

    // public activate(){
    //     if(this.isActive) return;
    //     this.isActive = true;
    //     window.addEventListener("keydown", this.handleKeydown);
    // }

    // public deactivate(){
    //     if(!this.isActive) return;
    //     this.isActive = true;
    //     window.addEventListener("keydown", this.handleKeydown);
    // }

    // 5.1
    // private handleKeydown = (e: KeyboardEvent) => {
    //     if (e.key == "Backspace"){
    //         e.preventDefault();
    //         // Use deleteChracter() method
    //         this.model.deleteCharacter();
    //     } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey){
    //         // Use appendCharacter() method
    //         this.model.appendCharacter(e.key);
    //     }
    // };
//}