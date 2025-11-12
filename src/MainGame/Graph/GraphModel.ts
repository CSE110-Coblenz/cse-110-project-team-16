
import { SCALE, INPUT_PREFIX } from './Const';
import { parseEquation, LineEquation } from './Equation';



type Platform = { startX: number; endX: number; y: number; bridged: boolean };

export class GraphModel {

    // Application State
    private originX: number;
    private originY: number;

    private width: number;
    private height: number;
    private scale: number;
    private equationString: string;
    private errorMessage: string;
    private parsedEquation: LineEquation | null;

    private platformsData: Platform[] = [];

    // Leveling
    private level: number;
    private levelCompleted: boolean;
    private initialPlatformsData: Platform[] = [];
    private rng: () => number;
    private levelConfigs: Array<{ count: number; minLen: number; maxLen: number; maxRise: number }>; // predefined difficulties
    // Sequential bridging anchor (index of the left platform in the next connection)
    private anchorIndex: number;
    private recentConnection: { fromX: number; fromY: number; toX: number; toY: number } | null;
    private segmentInput: { m: number; length: number } | null = null;

    // Observer pattern
    private listeners: Function[] = [];

    constructor(opts?: { rng?: () => number }) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.originX = this.width / 2;
        this.originY = this.height / 2;
        this.scale = SCALE;
        this.equationString = INPUT_PREFIX;
        this.errorMessage = "";
        this.parsedEquation = null;

        this.level = 1;
        this.levelCompleted = false;
        this.rng = opts?.rng ?? Math.random;

        // Define a set of levels with increasing difficulty (shorter platforms)
        this.levelConfigs = [
            { count: 2, minLen: 8, maxLen: 12, maxRise: 1 }, // Level 1
            { count: 2, minLen: 7, maxLen: 10, maxRise: 2 }, // Level 2
            { count: 2, minLen: 6, maxLen: 9,  maxRise: 2 }, // Level 3
            { count: 3, minLen: 5, maxLen: 8,  maxRise: 3 }, // Level 4
            { count: 3, minLen: 4, maxLen: 7,  maxRise: 3 }, // Level 5
            { count: 4, minLen: 3, maxLen: 6,  maxRise: 4 }, // Level 6
            { count: 4, minLen: 2, maxLen: 5,  maxRise: 4 }, // Level 7
        ];

        // initialize first level
        this.generateLevel(this.level);
    }

    // --- Public Getters ---
    getWidth = () => this.width;
    getHeight = () => this.height;
    getScale = () => this.scale;
    getEquationString = () => this.equationString;
    getErrorMessage = () => this.errorMessage;
    getParsedEquation = () => this.parsedEquation;
    getOriginX = () => this.originX;
    getOriginY = () => this.originY;
    getPlatformsData = () => this.platformsData;
    getLevel = () => this.level;
    isLevelCompleted = () => this.levelCompleted;
    /** Returns the current connection pair as math x coordinates: end of anchor -> start of next */
    public getNextConnectionPair(): { fromX: number; fromY: number; toX: number; toY: number } | null {
        if (this.platformsData.length < 2) return null;
        if (this.anchorIndex >= this.platformsData.length - 1) return null;
        const from = this.platformsData[this.anchorIndex];
        const to = this.platformsData[this.anchorIndex + 1];
        return { fromX: Math.max(from.startX, from.endX), fromY: from.y, toX: Math.min(to.startX, to.endX), toY: to.y };
    }

    public getRecentConnectionPair(): { fromX: number; fromY: number; toX: number; toY: number } | null {
        return this.recentConnection;
    }

    public getAnchorEndX(): number | null {
        if (this.platformsData.length === 0) return null;
        const idx = Math.max(0, Math.min(this.anchorIndex, this.platformsData.length - 1));
        const p = this.platformsData[idx];
        return Math.max(p.startX, p.endX);
    }

    public getAnchorY(): number | null {
        if (this.platformsData.length === 0) return null;
        const idx = Math.max(0, Math.min(this.anchorIndex, this.platformsData.length - 1));
        const p = this.platformsData[idx];
        return p.y;
    }

    public setSegmentInput(m: number, length: number) {
        this.segmentInput = { m, length };
        // Also set parsed equation so existing logic (e.g., checkGoal) can reuse
        const x0 = this.getAnchorEndX();
        const y0 = this.getAnchorY();
        if (x0 !== null && y0 !== null) {
            const b = y0 - m * x0; // line passing through (x0, y0)
            this.parsedEquation = { m, b };
        }
        this.notify();
    }

    public getSegmentInput(): { m: number; length: number } | null {
        return this.segmentInput;
    }

    /** Attempt to mark a bridge as completed using the active segment input. */
    public tryBridgeWithSegment(): boolean {
        const seg = this.segmentInput;
        if (!seg) return false;
        if (this.anchorIndex >= this.platformsData.length - 1) return false;
        const x0 = this.getAnchorEndX();
        const y0 = this.getAnchorY();
        if (x0 === null || y0 === null) return false;

        // Completion check: does the segment end at (next.startX, next.y)?
        const EPS = 1e-6;
        const next = this.platformsData[this.anchorIndex + 1];
        const targetX = Math.min(next.startX, next.endX);
        const targetY = next.y;
        const denom = Math.sqrt(1 + seg.m * seg.m) || 1;
        const dx = seg.length / denom;
        const dy = seg.m * dx;
        const x1 = x0 + dx;
        const y1 = y0 + dy;
        const closeEnough = (Math.abs(x1 - targetX) <= 0.25 && Math.abs(y1 - targetY) <= 0.25);
        const passedTargetHorizontally = x1 + EPS >= targetX && Math.abs(y1 - targetY) <= 0.5;
        if (closeEnough || passedTargetHorizontally) {
            this.recentConnection = { fromX: x0, fromY: y0, toX: targetX, toY: targetY };
            this.platformsData[this.anchorIndex].bridged = true;
            this.platformsData[this.anchorIndex + 1].bridged = true;
            this.anchorIndex = this.anchorIndex + 1;
            this.segmentInput = null;
            this.parsedEquation = null; // stop previewing next connection automatically
            this.levelCompleted = this.platformsData.length > 0 && this.platformsData.every(p => p.bridged);
            this.notify();
            return true;
        }
        this.notify();
        return false;
    }

    // --- Public Methods (called by Controller) ---
    public setOrigin(x: number, y: number) {
        this.originX = x;
        this.originY = y;
        this.notify(); // Tell the views to redraw
    }

    public subscribe(listener: Function) {
        this.listeners.push(listener);
    }


    public appendCharacter(char: string) {
        this.clearError();
        this.equationString += char;
        this.notify();
    }

    public deleteCharacter() {
        this.clearError();
        if (this.equationString.length > INPUT_PREFIX.length) {
            this.equationString = this.equationString.slice(0, -1);
        }
        this.notify();
    }

    public parseAndPlot() {
        const parsed = parseEquation(this.equationString);
        if (parsed) {
            this.parsedEquation = parsed;
            this.errorMessage = "";
        } else {
            this.parsedEquation = null;
            this.errorMessage = "Invalid format. Use 'y = mx + b'";
        }
        this.notify();
    }

    /** Determine if the current equation bridges platforms and check if all are complete.
     * Sequential mode: each valid submission bridges at most one platform (the next unbridged).
     */
    public checkGoalAndUpdate() {
        const eq = this.parsedEquation;
        if (!eq) {
            this.levelCompleted = false;
            this.notify();
            return false;
        }
        // All platforms lie on y = 0 from startX..endX
        // Determine which platforms the current line could bridge
        let targetIndex: number | null = null;
        if (eq.m === 0) {
            // Horizontal line: intersects only if b == 0
            if (eq.b === 0) {
                // Bridge the next connection pair: anchor and next
                if (this.anchorIndex < this.platformsData.length - 1) {
                    const left = this.platformsData[this.anchorIndex];
                    const right = this.platformsData[this.anchorIndex + 1];
                    this.recentConnection = {
                        fromX: Math.max(left.startX, left.endX),
                        toX: Math.min(right.startX, right.endX),
                    };
                    targetIndex = this.anchorIndex + 1; // mark the right platform as newly bridged
                } else {
                    this.recentConnection = null;
                }
            }
        } else {
            const xAtY0 = -eq.b / eq.m;
            // Find the first unbridged platform that contains xAtY0
            for (let i = 0; i < this.platformsData.length; i++) {
                const p = this.platformsData[i];
                if (p.bridged) continue;
                if (xAtY0 >= Math.min(p.startX, p.endX) && xAtY0 <= Math.max(p.startX, p.endX)) {
                    targetIndex = i;
                    break;
                }
            }
        }
        if (targetIndex !== null && targetIndex >= 0) {
            // For y=0 sequential connection, also ensure anchor gets marked and then advance anchor
            if (eq.m === 0 && eq.b === 0) {
                const left = Math.max(0, Math.min(this.anchorIndex, this.platformsData.length - 1));
                const right = Math.max(0, Math.min(targetIndex, this.platformsData.length - 1));
                this.platformsData[left].bridged = true;
                this.platformsData[right].bridged = true;
                // Move anchor forward to the right platform
                this.anchorIndex = Math.min(right, this.platformsData.length - 1);
            } else {
                this.platformsData[targetIndex].bridged = true;
                this.recentConnection = null;
            }
        }
        this.levelCompleted = this.platformsData.length > 0 && this.platformsData.every(p => p.bridged);
        this.notify();
        return this.levelCompleted;
    }

    /** Reset the current level to its initial state. */
    public resetLevel() {
        // Preserve level number; restore initial platforms and input state
        this.platformsData = this.initialPlatformsData.map(p => ({ ...p }));
        this.equationString = INPUT_PREFIX;
        this.parsedEquation = null;
        this.errorMessage = "";
        this.levelCompleted = false;
        this.anchorIndex = 0;
        this.recentConnection = null;
        this.segmentInput = null;
        this.notify();
    }

    /** Advance to the next level and generate new platforms. */
    public nextLevel() {
        this.level += 1;
        this.generateLevel(this.level);
        this.notify();
    }

    /** Set level explicitly (used to load player progress). */
    public setLevel(level: number) {
        if (level < 1) level = 1;
        this.level = level;
        this.generateLevel(this.level);
        this.notify();
    }

    /** Start or regenerate a level's initial state and snapshot it for reset. */
    private generateLevel(level: number) {
        // Clear and create platforms with difficulty scaling
        this.platformsData = [];

        // Determine platform count and length range based on predefined configs, fallback to formula
        const width = this.width;
        const scale = this.scale;
        const mathMinX = -this.originX / scale;
        const mathMaxX = (width - this.originX) / scale;

        let minLen: number;
        let maxLen: number;
        let count: number;
        let maxRise: number;
        if (level - 1 < this.levelConfigs.length) {
            ({ minLen, maxLen, count, maxRise } = this.levelConfigs[level - 1]);
        } else {
            // procedural fallback beyond predefined set
            minLen = Math.max(2, 8 - Math.floor(level / 2));
            maxLen = Math.max(minLen + 1, 12 - Math.floor(level / 3));
            count = Math.min(5, Math.floor(level / 2) + 1);
            maxRise = Math.min(5, Math.floor(level / 2) + 2);
        }

        const spanMin = mathMinX + 1;
        const spanMax = mathMaxX - 1;
        const spanWidth = Math.max(1, spanMax - spanMin);

        // Deterministic, non-overlapping placement by bucketing the range
        const bucketWidth = spanWidth / count;
        for (let i = 0; i < count; i++) {
            // Bucket range
            const bucketStart = spanMin + i * bucketWidth;
            const bucketEnd = spanMin + (i + 1) * bucketWidth;
            // Choose a length within bounds and less than bucket width
            const maxLenInBucket = Math.max(1, Math.min(maxLen, bucketEnd - bucketStart - 0.5));
            const length = Math.min(maxLenInBucket, Math.max(minLen, this.randomInRange(minLen, maxLenInBucket)));
            const start = this.randomInRange(bucketStart + 0.25, bucketEnd - 0.25 - length);
            let end = start + length;
            // Snap to integer grid lines to align with the drawn grid
            const startSnap = Math.round(start);
            let endSnap = Math.round(end);
            if (endSnap <= startSnap) endSnap = startSnap + 1; // at least 1 unit
            // Height snapping: integer y within [-maxRise..maxRise]
            const y = Math.round(this.randomInRange(-maxRise, maxRise));
            this.platformsData.push({ startX: startSnap, endX: endSnap, y, bridged: false });
        }

        // Snapshot for reset
        this.initialPlatformsData = this.platformsData.map(p => ({ ...p }));
        this.equationString = INPUT_PREFIX;
        this.parsedEquation = null;
        this.errorMessage = "";
        this.levelCompleted = false;
        this.anchorIndex = 0;
        this.recentConnection = null;
        this.segmentInput = null;
    }

    private randomInRange(min: number, max: number) {
        return this.rng() * (max - min) + min;
    }

    // --- Private Helpers ---

    private notify() {
        for (const listener of this.listeners) {
            listener();
        }
    }

    private clearError() {
        if (this.errorMessage !== "") {
            this.errorMessage = "";
        }
    }

}
