"use strict";

function init()
{
    // Initialize the screen to black
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d", {alpha: false, willReadFrequently: true});
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";
    ctx.beginPath();

    let isButtonPressed = false;
    const history = makeHistory(ctx);

    const pen = () => {
        let start = null;

        const begin = (p) => {
            history.save();
            start = p;
        };

        const move = (p) => {
            ctx.beginPath();
            ctx.moveTo(...start.params);
            ctx.lineTo(...p.params);
            ctx.stroke();
            start = p;
        };

        return {begin, move};
    };

    const shape = (draw) => {
        let start = null;

        const begin = (p) => {
            history.save();
            start = p;
        };

        const move = (p) => {
            history.restore();
            history.save();
            ctx.beginPath();
            draw(makeRect(start, p));
            ctx.stroke();
        };

        return {begin, move};
    };

    const rect = (r) => {
        ctx.strokeRect(...r.params);
    };

    const ellipse = (r) => {
        const cx = (r.lo.x + r.hi.x) / 2;
        const cy = (r.lo.y + r.hi.y) / 2;
        ctx.ellipse(cx, cy, r.width / 2, r.height / 2, 0, 0, 2 * Math.PI);
    };

    const line = (r) => {
        ctx.moveTo(...r.p1.params);
        ctx.lineTo(...r.p2.params);
    };

    let tool = pen();

    const mousedown = (e) => {
        if (e.button === 0) {
            isButtonPressed = true;
            if (tool.begin !== undefined) {
                tool.begin(makePoint(e.offsetX, e.offsetY));
            }
        }
    };

    const mouseup = (e) => {
        if (e.button === 0) {
            if (tool.end !== undefined) {
                tool.end(makePoint(e.offsetX, e.offsetY));
            }
            isButtonPressed = false;
        }
    };

    const mousemove = (e) => {
        if (isButtonPressed && tool.move !== undefined) {
            tool.move(makePoint(e.offsetX, e.offsetY));
        }
    };

    const keydown = (e) => {
        if (e.ctrlKey && e.code === "KeyZ") {
            history.restore();
        }
        else if (e.code === "KeyP") {
            tool = pen();
        }
        else if (e.code === "KeyR") {
            tool = shape(rect);
        }
        else if (e.code === "KeyE") {
            tool = shape(ellipse);
        }
        else if (e.code === "KeyL") {
            tool = shape(line);
        }
    };

    const register = (str, fn, element = canvas) => {
        element.addEventListener(str, (e) => { fn(e); e.preventDefault(); });
    };

    register("mousedown", mousedown);
    register("mouseup", mouseup);
    register("mousemove", mousemove);
    register("keydown", keydown, window);
}

function makeHistory(ctx)
{
    const canvas = ctx.canvas;
    let lastImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const stack = [];

    const save = () => {
        const base = ctx.getImageData(0, 0, canvas.width, canvas.height);
        stack.push(makeDiff(base.data, lastImage.data));
        lastImage = base;
    };

    const restore = () => {
        ctx.putImageData(lastImage, 0, 0);
        if (stack.length > 0) {
            applyDiff(lastImage, stack.pop());
        }
    };

    const makeDiff = (base, derived) => {
        assert(base.length === derived.length);

        // beginning of the current segment of differing data
        let diffStart = null;

        // complete list of the segments of differing data
        let diff = [];

        const finishDiff = (i) => {
            if (diffStart !== null) {
                diff.push({data: derived.slice(diffStart, i), idx: diffStart});
                diffStart = null;
            }
        };

        for (let i = 0; i < base.length; i++) {
            if (derived[i] !== base[i]) {
                if (diffStart === null) {
                    diffStart = i;
                }
            }
            else {
                finishDiff(i);
            }
        }

        finishDiff(base.length);
        return diff;
    };

    const applyDiff = (base, diff) => {
        for (const d of diff) {
            base.data.set(d.data, d.idx);
        }
    };

    // return public methods
    return {save, restore};
}

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

function assert(cond)
{
    if (!cond) {
        throw new Error();
    }
}
