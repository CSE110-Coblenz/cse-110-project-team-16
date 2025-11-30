import { describe, it, expect } from "vitest";
import { curveParserFactory } from "../MainGame/Graph/CurveFactory";
import { CurveType } from "../MainGame/Graph/CurveType";

describe("parseEquation", () => {
    // valid equations
    it("should parse a simple equation y=2x+3", () => {
        const result = curveParserFactory(CurveType.LineEquation, "y=2x+3");
        expect(result).toEqual({ m: 2, b: 3 });
    });

    it("should parse equation with negative slope and intercept", () => {
        const result = curveParserFactory(CurveType.LineEquation, "y=-2x-4");
        expect(result).toEqual({ m: -2, b: -4 });
    });

    it("should handle implicit slope of 1", () => {
        const result = curveParserFactory(CurveType.LineEquation, "y=x+5");
        expect(result).toEqual({ m: 1, b: 5 });
    });

    it("should handle implicit slope of -1", () => {
        const result = curveParserFactory(CurveType.LineEquation, "y=-x+2");
        expect(result).toEqual({ m: -1, b: 2 });
    });

    it("should handle equation without x (constant line)", () => {
        const result = curveParserFactory(CurveType.LineEquation, "y=7");
        expect(result).toEqual({ m: 0, b: 7 });
    });

    it("should handle equation with decimal values", () => {
        const result = curveParserFactory(CurveType.LineEquation, "y=0.5x-1.25");
        expect(result).toEqual({ m: 0.5, b: -1.25 });
    });

    it("should ignore spaces", () => {
        const result = curveParserFactory(CurveType.LineEquation, "y = 3x + 2");
        expect(result).toEqual({ m: 3, b: 2 });
    });

    // invalid input, should be null
    it("should return null if missing 'y='", () => {
        expect(curveParserFactory(CurveType.LineEquation, "2x+3")).toBeNull();
    });

    it("should return null if missing '+'", () => {
        expect(curveParserFactory(CurveType.LineEquation, "x5")).toBeNull();
    });

    it("should return null if missing '+'", () => {
        expect(curveParserFactory(CurveType.LineEquation, "x5+6")).toBeNull();
    });

    it("should return null if contains invalid character (z)", () => {
        expect(curveParserFactory(CurveType.LineEquation, "y=5z+3")).toBeNull();
    });

    it("should return null if contains letters instead of numbers", () => {
        expect(curveParserFactory(CurveType.LineEquation, "y=abc")).toBeNull();
    });

    it("should return null if equation ends abruptly", () => {
        expect(curveParserFactory(CurveType.LineEquation, "y=3x+")).toBeNull();
    });
});
