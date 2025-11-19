import { LineSegment } from "./MinigameModel";

/**
 * ShapePrompt 
 * Defines the shape-building assignments including
 * - visualizable identity (id, name)
 * - interconnectivity to main game environment (caption)
 * - mathematical structure (line segments, correct equations)
 * - margin of error: 0.3-0.5 units (moe) 
 */

// 1.0 Define ShapePrompt interface
export interface ShapePrompt{
    id: string;
    name: string;
    caption: string;
    segments: LineSegment[];
}

// 1.1 Design each shape
const SHAPES: { [key: string]: ShapePrompt } = {
    square:{
        id: "sqaure",
        name: "Square",
        caption: "Build a simple square!",
        segments: [
            { startX:-2, startY:-2, endX:2, endY:-2, correctEquation:{m:0, b:-2}, moe:0.3 },
            { startX:2, startY:-2, endX:2, endY:2, correctEquation:{m:1000, b:-1998}, moe:0.3 },
            { startX:2, startY:2, endX:-2, endY:2, correctEquation:{m:0, b:2}, moe:0.3 },
            { startX:-2, startY:2, endX:-2, endY:-2, correctEquation:{m:1000, b:1998}, moe:0.3 },
        ],
    },
};

// Sun shape teaches radial lines via various slopes through origin


// Cloud shape teaches curved approximation via short segments


// House shape teaches combining basic geometric polygons


// Tree shape teaches vertical and diagonal lines


// Star teaches symmetrical lines via varying slopes 


// Get a shape prompt by its ID
// where shapeId is the shape's unique identifier
// and the func returns the complete ShapePrompt object or null if not found
export function getShapePrompt(shapeId: string): ShapePrompt | null{
    return SHAPES[shapeId] || null;
}