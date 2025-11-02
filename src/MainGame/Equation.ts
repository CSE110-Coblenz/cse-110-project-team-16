export interface LineEquation {
    m: number;
    b: number;
}

export function parseEquation(eq: string): LineEquation | null {
    eq = eq.replace(/\s+/g, "");
    if (!eq.startsWith("y=")) return null;

    // if other than mx + b form, reject
    if (!/^y=[0-9x+\-\.]*$/i.test(eq)) return null;
    const expr = eq.substring(2);
    let m = 0;
    let b = 0;
    const xIndex = expr.indexOf("x");


    // y = A
    if (xIndex === -1) {
        m = 0;
        b = parseFloat(expr);
        if (isNaN(m) || isNaN(b)) return null;
        return { m, b };
    }


    const mStr = expr.substring(0, xIndex);
    if (mStr === "") m = 1;
    else if (mStr === "-") m = -1;
    else m = parseFloat(mStr);

    const bStr = expr.substring(xIndex + 1);

    if (bStr === "") {
        // No 'b' term (e.g., "y = 5x")
        b = 0;
        if (isNaN(m) || isNaN(b)) return null;
        return { m, b };
    }

    // If bStr(sub string after x) exists, it MUST start with '+' or '-'
    if (!(bStr.startsWith("+") || bStr.startsWith("-"))) return null;

    b = parseFloat(bStr); // "y = x+5" or "y = 5x-3"
    if (isNaN(m) || isNaN(b)) return null;
    return { m, b };
}