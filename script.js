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
