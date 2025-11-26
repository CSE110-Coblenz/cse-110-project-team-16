export interface LineEquation {
    m: number;
    b: number;
}

// Helper function to parse fractions like "1/2" or regular decimals
function parseMaybeFraction(text: string): number | null {
    if (!text) return null;
    const s = text.trim();
    if (s.includes('/')) {
        const [numStr, denStr] = s.split('/').map(t => t.trim());
        if (!numStr || !denStr) return null;
        const num = parseFloat(numStr);
        const den = parseFloat(denStr);
        if (!isFinite(num) || !isFinite(den) || den === 0) return null;
        return num / den;
    }
    const v = parseFloat(s);
    return isFinite(v) ? v : null;
}

export function parseEquation(eq: string): LineEquation | null {
    eq = eq.replace(/\s+/g, "");
    if (!eq.startsWith("y=")) return null;

    // if other than mx + b form, reject (now also allows '/' for fractions)
    if (!/^y=[0-9x+\-\.\/]*$/i.test(eq)) return null;
    const expr = eq.substring(2);
    let m = 0;
    let b = 0;
    const xIndex = expr.indexOf("x");


    // y = A
    if (xIndex === -1) {
        m = 0;
        const bParsed = parseMaybeFraction(expr);
        if (bParsed == null) return null;
        b = bParsed;
        return { m, b };
    }


    const mStr = expr.substring(0, xIndex);
    if (mStr === "") m = 1;
    else if (mStr === "-") m = -1;
    else {
        const mParsed = parseMaybeFraction(mStr);
        if (mParsed == null) return null;
        m = mParsed;
    }

    const bStr = expr.substring(xIndex + 1);

    if (bStr === "") {
        // No 'b' term (e.g., "y = 5x")
        b = 0;
        return { m, b };
    }

    // If bStr(sub string after x) exists, it MUST start with '+' or '-'
    if (!(bStr.startsWith("+") || bStr.startsWith("-"))) return null;

    const bParsed = parseMaybeFraction(bStr); // "y = x+5" or "y = 5x-3"
    if (bParsed == null) return null;
    b = bParsed;
    return { m, b };
}