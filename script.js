"use strict";

function init()
{
    // Initialize the screen to black
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";
    ctx.beginPath();

    let isButtonPressed = false;
    const history = makeHistory(ctx);

    const pen = () => {
        let startX = null;
        let startY = null;

        const begin = (x, y) => {
            history.save();
            startX = x;
            startY = y;
        };

        const move = (x, y) => {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();
            startX = x;
            startY = y;
        };

        return {begin, move};
    };

    const shape = (draw) => {
        let startX = null;
        let startY = null;

        const begin = (x, y) => {
            history.save();
            startX = x;
            startY = y;
        };

        const move = (x, y) => {
            history.restore();
            history.save();
            ctx.beginPath();
            draw(startX, startY, x, y);
            ctx.stroke();
        };

        return {begin, move};
    };

    const rect = (x1, y1, x2, y2) => {
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    };

    const ellipse = (x1, y1, x2, y2) => {
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        ctx.ellipse(cx, cy, Math.abs(x2 - cx), Math.abs(y2 - cy), 0, 0, 2 * Math.PI);
    };

    const line = (x1, y1, x2, y2) => {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    };

    let tool = pen();

    const mousedown = (e) => {
        if (e.button === 0) {
            isButtonPressed = true;
            if (tool.begin !== undefined) {
                tool.begin(e.offsetX, e.offsetY);
            }
        }
    };

    const mouseup = (e) => {
        if (e.button === 0) {
            if (tool.end !== undefined) {
                tool.end(e.offsetX, e.offsetY);
            }
            isButtonPressed = false;
        }
    };

    const mousemove = (e) => {
        if (isButtonPressed && tool.move !== undefined) {
            tool.move(e.offsetX, e.offsetY);
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

function assert(cond)
{
    if (!cond) {
        throw new Error();
    }
}
