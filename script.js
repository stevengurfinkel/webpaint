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

    const mousedown = (e) => {
        if (e.button === 0) {
            history.save();
            ctx.moveTo(e.offsetX, e.offsetY);
            isButtonPressed = true;
        }
    };

    const mouseup = (e) => {
        if (e.button === 0) {
            isButtonPressed = false;
        }
    };

    const mousemove = (e) => {
        if (isButtonPressed) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        }
    };

    const keydown = (e) => {
        if (e.ctrlKey && e.code === "KeyZ") {
            history.restore();
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
    return {save: save, restore: restore};
}

function assert(cond)
{
    if (!cond) {
        throw new Error();
    }
}
