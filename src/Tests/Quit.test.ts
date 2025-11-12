import { describe, it, expect } from "vitest";
import { requestQuit } from "../MainGame/UI/Quit";

describe("Quit confirmation", () => {
  it("returns false when user cancels", () => {
    const confirmFn = () => false;
    expect(requestQuit(confirmFn)).toBe(false);
  });

  it("returns true when user confirms", () => {
    const confirmFn = () => true;
    expect(requestQuit(confirmFn)).toBe(true);
  });
});

