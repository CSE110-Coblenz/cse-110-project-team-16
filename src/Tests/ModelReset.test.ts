/* @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { GraphModel } from "../MainGame/Graph/GraphModel";
import { INPUT_PREFIX } from "../MainGame/Graph/Const";

describe("GraphModel resetLevel", () => {
  it("restores initial state and preserves current level", () => {
    const rng = () => 0.42;
    const model = new GraphModel({ rng });
    const initialLevel = model.getLevel();
    const initialPlatforms = model.getPlatformsData().map(p => ({ ...p }));

    // Change state by entering an equation and plotting
    for (const ch of "y=2x+3") model.appendCharacter(ch);
    model.parseAndPlot();

    // Now reset
    model.resetLevel();

    expect(model.getLevel()).toBe(initialLevel); // progress preserved
    expect(model.getParsedEquation()).toBeNull();
    expect(model.getEquationString()).toBe(INPUT_PREFIX);

    // Platforms restored
    expect(model.getPlatformsData()).toEqual(initialPlatforms);
    expect(model.isLevelCompleted()).toBe(false);
  });
});

