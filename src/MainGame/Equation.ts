export interface LineEquation {
    m: number;
    b: number;
}

export function parseEquation(eq: string): LineEquation | null {
    eq = eq.replace(/\s+/g, "");
    if (!eq.startsWith("y=")) return null;

    const expr = eq.substring(2);
    let m = 0;
    let b = 0;
    const xIndex = expr.indexOf("x");

    if (xIndex === -1) {
        m = 0;
        b = parseFloat(expr);
    } else {
        const mStr = expr.substring(0, xIndex);
        if (mStr === "") m = 1;
        else if (mStr === "-") m = -1;
        else m = parseFloat(mStr);

        const bStr = expr.substring(xIndex + 1);
        if (bStr === "") b = 0;
        else b = parseFloat(bStr);
    }

    if (isNaN(m) || isNaN(b)) return null;
    return { m, b };
}