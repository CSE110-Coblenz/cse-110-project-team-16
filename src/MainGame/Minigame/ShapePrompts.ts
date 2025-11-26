/**
 * ShapePrompts 
 * Define shape puzzle piece requirements including
 * - current/initial positions, bottom of screen
 * - target positions and rotations, where they are snapped in place
 * - geometric structure and dimensions
 * - silhouette outline for visual guidance
 * - interconnectivity to main game environment via captions
 */

// 1.0 Define PuzzlePiece interface
export interface PuzzlePiece{
    id: string;
    type: "triangle" | "rectangle" | "trapezoid" | "square";
    initialX: number;
    initialY: number;
    x: number;
    y: number;
    rotation: number;
    targetX: number;
    targetY: number;
    targetRotation: number;
    width: number;
    height: number;
    // go back to
    points?: number[];
    locked: boolean;
}

// 2.0 Define ShapePrompt interface
export interface ShapePrompt{
    id: string;
    name: string;
    caption: string;
    gameEffect: string;
    pieces: PuzzlePiece[];
    silhouettePoints: number[];
}

// 3.0 Create house puzzle 
function housePrompt(width: number, height: number): ShapePrompt{
    const centerX = width / 2;
    const centerY = height / 2 - 50;
    const spawnY = height - 100;

    return{
        id: "house",
        name: "House",
        caption: "Build a house to start a city!",
        gameEffect: "House appears on landscape",
        pieces: [
            // Square, base of house
            {
                id: "houseBase",
                type: "square",
                initialX: centerX - 200,
                initialY: spawnY,
                x: centerX - 200,
                y: spawnY,
                rotation: 0,
                targetX: centerX,
                targetY: centerY + 25,
                targetRotation: 0,
                width: 120,
                height: 120,
                locked: false,
            },
            // Triangle, roof
            {
                id: "houseRoof",
                type: "triangle",
                initialX: centerX,
                initialY: spawnY,
                x: centerX,
                y: spawnY,
                rotation: 0,
                targetX: centerX,
                targetY: centerY -55,
                targetRotation: 0,
                width: 140,
                height: 80,
                points: [70, 0, 140, 80, 0, 80],
                locked: false,                
            },
        ],
        // Complete house outline
        silhouettePoints:[
            centerX - 60, centerY + 85, // bottom left
            centerX - 60, centerY - 35, // roof left
            centerX, centerY - 95,      // roof peak
            centerX + 60, centerY - 35, // roof right
            centerX + 60, centerY + 85, // bottom right
            centerX - 60, centerY + 85, // closing path
        ],
    };
}

// 4.0 Construct shape registry to map IDs to prompt functions
const SHAPE_PROMPTS: {[key: string]: (w: number, h: number) => ShapePrompt} = {
    // Object property assignments
    house: housePrompt,
};

// 5.0 Get shape prompt via its ID 
export function getShapePrompt(shapeId: string, width: number, height: number): ShapePrompt | null{
    const prompts = SHAPE_PROMPTS[shapeId];
    return prompts ? prompts(width, height): null;
}

// 6.0 Get IDs (unique identifer) for all available shapes
export function getShapeIds(): string[]{
    return Object.keys(SHAPE_PROMPTS);
}

// 7.0 Get respective shape for that level number
export function getShapeLevel(levelNum: number): string | null{
    if (levelNum % 3 !== 0) return null;
    const shapes = getShapeIds();
    const idx = Math.floor(levelNum / 3) - 1;
    return (idx >= 0 && idx < shapes.length) ? shapes[idx] : null;
}
