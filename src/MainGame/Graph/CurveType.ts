export enum CurveType {
    LineEquation = "LineEquation",
}


// for future modification, just extends this curve interface, like parabola
export interface Curve {
}

// the one we're using 
export interface LineEquation extends Curve {
    m: number;
    b: number;
}
