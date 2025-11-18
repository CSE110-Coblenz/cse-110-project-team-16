import { describe, it, expect, beforeAll } from "vitest";
import { GraphModel } from "../MainGame/Graph/GraphModel";



// --------------------------------------------------
// 1. MOCK WINDOW (GraphModel relies on window.*)
// --------------------------------------------------
beforeAll(() => {
    globalThis.window = {
        innerWidth: 1200,
        innerHeight: 800,
    } as any;
});


// --------------------------------------------------
// 2. PURE MATH HELPERS (TEST-ONLY, NOT IN SOURCE)
// --------------------------------------------------

// compute end point from slope m and segment length L
function computeEnd(x0: number, y0: number, m: number, L: number) {
    const denom = Math.sqrt(1 + m * m) || 1;
    const dx = L / denom;
    const dy = m * dx;
    return { x1: x0 + dx, y1: y0 + dy, dx, dy };
}

// GraphModel's “closeEnough” rule
function expectedCloseEnough(x1: number, y1: number, tx: number, ty: number) {
    return Math.abs(x1 - tx) <= 0.25 &&
        Math.abs(y1 - ty) <= 0.25;
}

// GraphModel's overshoot rule
function expectedOvershoot(x1: number, y1: number, tx: number, ty: number) {
    return x1 >= tx && Math.abs(y1 - ty) <= 0.5;
}


// --------------------------------------------------
// 3. Helper: create a test model with 2 platforms
// --------------------------------------------------
function makeModel(anchor: any, next: any) {
    const model = new GraphModel({ rng: () => 0.5 });

    model["platformsData"] = [
        { startX: anchor.startX, endX: anchor.endX, y: anchor.y, bridged: false },
        { startX: next.startX, endX: next.endX, y: next.y, bridged: false },
    ];

    model["initialPlatformsData"] = model["platformsData"].map(p => ({ ...p }));
    model["anchorIndex"] = 0;

    return model;
}


// --------------------------------------------------
// 4. ACTUAL TESTS
// --------------------------------------------------
describe("GraphModel bridging tests", () => {

    it("bridges correctly when slope & length land exactly on next platform", () => {
        const anchor = { startX: 0, endX: 0, y: 0 };
        const next = { startX: 5, endX: 7, y: 2 };
        const model = makeModel(anchor, next);

        const x0 = 0, y0 = 0;
        const targetX = 5, targetY = 2;

        const dx = 5, dy = 2;
        const m = dy / dx;
        const L = Math.sqrt(dx * dx + dy * dy);

        const { x1, y1 } = computeEnd(x0, y0, m, L);

        // math expectation
        expect(expectedCloseEnough(x1, y1, targetX, targetY)).toBe(true);

        // GraphModel expectation
        model.setSegmentInput(m, L);
        expect(model.canBridgeWithCurrentSegment()).toBe(true);

        const bridged = model.tryBridgeWithSegment();
        expect(bridged).toBe(true);

        expect(model["anchorIndex"]).toBe(1);
        expect(model["platformsData"][1].bridged).toBe(true);
    });


    it("fails if slope is wrong", () => {
        const anchor = { startX: 0, endX: 0, y: 0 };
        const next = { startX: 4, endX: 5, y: 1 };
        const model = makeModel(anchor, next);

        const dx = 4, dy = 1;
        const correctLength = Math.sqrt(dx * dx + dy * dy);

        const wrongM = 2.0; // wrong slope

        model.setSegmentInput(wrongM, correctLength);
        expect(model.canBridgeWithCurrentSegment()).toBe(false);
    });


    it("fails if length is too short", () => {
        const model = makeModel(
            { startX: 0, endX: 0, y: 0 },
            { startX: 5, endX: 5, y: 0 }
        );

        model.setSegmentInput(0, 3); // length < 5
        expect(model.canBridgeWithCurrentSegment()).toBe(false);
    });


    it("passes if horizontally overshoots but stays within vertical tolerance", () => {
        const anchor = { startX: 0, endX: 0, y: 0 };
        const next = { startX: 5, endX: 7, y: 1 };
        const model = makeModel(anchor, next);

        const x0 = 0, y0 = 0;
        const targetX = 5, targetY = 1;

        const dx = 6, dy = 1;       // overshoot, but OK vertically
        const m = dy / dx;
        const L = Math.sqrt(dx * dx + dy * dy);

        const { x1, y1 } = computeEnd(x0, y0, m, L);
        expect(expectedOvershoot(x1, y1, targetX, targetY)).toBe(true);

        model.setSegmentInput(m, L);
        expect(model.canBridgeWithCurrentSegment()).toBe(true);
    });


    it("fails if horizontal overshoot but too far vertically", () => {
        const anchor = { startX: 0, endX: 0, y: 0 };
        const next = { startX: 5, endX: 7, y: 1 };
        const model = makeModel(anchor, next);

        const dx = 6, dy = 5; // huge vertical diff → shouldn't pass
        const m = dy / dx;
        const L = Math.sqrt(dx * dx + dy * dy);

        model.setSegmentInput(m, L);
        expect(model.canBridgeWithCurrentSegment()).toBe(false);
    });


    it("rejects bridging when anchorIndex points at last platform", () => {
        const model = makeModel(
            { startX: 0, endX: 0, y: 0 },
            { startX: 3, endX: 3, y: 0 }
        );

        model["anchorIndex"] = 1; // no next platform
        model.setSegmentInput(1, 10);

        expect(model.canBridgeWithCurrentSegment()).toBe(false);
    });


    it("updates recentConnection correctly after successful bridge", () => {
        const anchor = { startX: 2, endX: 2, y: 1 };
        const next = { startX: 6, endX: 6, y: 2 };
        const model = makeModel(anchor, next);

        const dx = 4, dy = 1;
        const m = dy / dx;
        const L = Math.sqrt(dx * dx + dy * dy);

        model.setSegmentInput(m, L);
        const ok = model.tryBridgeWithSegment();
        expect(ok).toBe(true);

        expect(model.getRecentConnectionPair()).toEqual({
            fromX: 2, fromY: 1,
            toX: 6, toY: 2
        });
    });


    it("clears segment input after bridging", () => {
        const model = makeModel(
            { startX: 0, endX: 0, y: 0 },
            { startX: 3, endX: 3, y: 0 }
        );

        const dx = 3, dy = 0;
        const m = 0;
        const L = 3;

        model.setSegmentInput(m, L);
        expect(model.getSegmentInput()).not.toBeNull();

        model.tryBridgeWithSegment();
        expect(model.getSegmentInput()).toBeNull();
    });


    it("does not bridge if segmentInput is null", () => {
        const model = makeModel(
            { startX: 0, endX: 0, y: 0 },
            { startX: 3, endX: 3, y: 0 }
        );

        expect(model.tryBridgeWithSegment()).toBe(false);
    });

});

