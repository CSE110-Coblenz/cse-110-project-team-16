/* @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { GraphModel } from "../MainGame/Graph/GraphModel";

function setEquationSuffix(model: GraphModel, rhs: string) {
  // Clear back to 'y = ' prefix, then append the right-hand side only
  while (model.getEquationString().length > 'y = '.length) model.deleteCharacter();
  for (const ch of rhs) model.appendCharacter(ch);
}

describe("Level progression when reaching goal", () => {
  it("requires bridging all platforms before advancing, then goes to next level", () => {
    const seq = [0.2, 0.6, 0.3, 0.8, 0.4, 0.7];
    let idx = 0;
    const rng = () => { const v = seq[idx % seq.length]; idx++; return v; };
    const model = new GraphModel({ rng });
    // Move to a level with multiple platforms
    model.setLevel(2);
    const currentLevel = model.getLevel();
    const platforms = model.getPlatformsData();
    expect(platforms.length).toBeGreaterThan(1);

    // Bridge each platform one by one
    for (let i = 0; i < platforms.length; i++) {
      const p = platforms[i];
      const midX = (p.startX + p.endX) / 2;
      const m = 1;
      const b = -m * midX;
      const bStr = b >= 0 ? `+${b}` : `${b}`;
      setEquationSuffix(model, `${m}x${bStr}`);
      model.parseAndPlot();
      const completed = model.checkGoalAndUpdate();
      if (i < platforms.length - 1) {
        expect(completed).toBe(false);
        expect(model.isLevelCompleted()).toBe(false);
      }
    }
    // After last one, should be complete
    expect(model.isLevelCompleted()).toBe(true);

    // Proceed to next level
    model.nextLevel();
    expect(model.getLevel()).toBe(currentLevel + 1);
    expect(model.isLevelCompleted()).toBe(false);
    expect(model.getPlatformsData().length).toBeGreaterThan(0);
  });
});
