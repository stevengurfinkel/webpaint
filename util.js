"use strict";

function makePoint(x, y)
{
    return {x, y, params: [x, y]};
}

function makeRect(p1, p2)
{
    const corner = (fn) => makePoint(fn(p1.x, p2.x), fn(p1.y, p2.y));
    const lo = corner(Math.min);
    const hi = corner(Math.max);
    const width = hi.x - lo.x;
    const height = hi.y - lo.y;
    const params = [lo.x, lo.y, width, height];
    const contains = (p) => p.x >= lo.x && p.y >= lo.y && p.x < hi.x && p.y < hi.y;

    return {p1, p2, lo, hi, width, height, params, contains};
}

function makeRectFromParams(x, y, width, height)
{
    return makeRect(makePoint(x, y), makePoint(x + width, y + height));
}

function assert(cond)
{
    if (!cond) {
        throw new Error();
    }
}
