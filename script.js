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

    const scribble = {
        begin: (x, y) => {
            history.save();
            ctx.beginPath();
            ctx.moveTo(x, y);
        },

        move: (x, y) => {
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        },

        end: (x, y) => {
            ctx.stroke();
        }
    };

    const rect = {
        begin: (x, y) => {
            history.save();
        },

        move: (x, y) => {
            history.restore();
            history.save();
            ctx.strokeRect(toolBegin.x, toolBegin.y, x - toolBegin.x, y - toolBegin.y);
        },

        end: (x, y) => {}
    };

    const toolBegin = {x: null, y: null};
    let tool = scribble;

    const mousedown = (e) => {
        if (e.button === 0) {
            toolBegin.x = e.offsetX;
            toolBegin.y = e.offsetY;
            tool.begin(e.offsetX, e.offsetY);
            isButtonPressed = true;
        }
    };

    const mouseup = (e) => {
        if (e.button === 0) {
            tool.end(e.offsetX, e.offsetY);
            isButtonPressed = false;
        }
    };

    const mousemove = (e) => {
        if (isButtonPressed) {
            tool.move(e.offsetX, e.offsetY);
        }
    };

    const keydown = (e) => {
        if (e.ctrlKey && e.code === "KeyZ") {
            history.restore();
        }
        else if (e.code === "KeyS") {
            tool = scribble;
        }
        else if (e.code === "KeyR") {
            tool = rect;
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
