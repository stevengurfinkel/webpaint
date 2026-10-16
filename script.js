"use strict";

function init()
{
    // Initialize the screen to black
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d", {alpha: false, willReadFrequently: true});
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";

    let isButtonPressed = false;
    const history = makeHistory(ctx);

    const pen = () => {
        let start = null;

        const down = (p) => {
            start = p;
        };

        const move = (p) => {
            ctx.beginPath();
            ctx.moveTo(...start.params);
            ctx.lineTo(...p.params);
            ctx.stroke();
            start = p;
        };

        const up = (p) => {
            complete();
        };

        return {down, move, up};
    };

    const shape = (draw) => {
        return () => {
            let start = null;

            const down = (p) => {
                start = p;
            };

            const move = (p) => {
                reset();
                ctx.beginPath();
                draw(makeRect(start, p));
                ctx.stroke();
            };

            const up = (p) => {
                complete();
            };

            return {down, move, up};
        };
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

    let tool = null;
    let toolFn = pen;

    const reset = () => {
        assert(tool !== null);
        history.restore();
        history.save();
    };

    const complete = () => {
        assert(tool !== null);
        tool = null;
    };

    const abort = () => {
        assert(tool !== null);
        history.restore();
        tool = null;
    };

    const mousedown = (e) => {
        if (e.button === 0) {
            isButtonPressed = true;
            if (tool === null) {
                tool = toolFn();
                history.save();
            }
            if (tool.down !== undefined) {
                tool.down(makePoint(e.offsetX, e.offsetY));
            }
        }
    };

    const mouseup = (e) => {
        if (e.button === 0) {
            if (tool !== null && tool.up !== undefined) {
                tool.up(makePoint(e.offsetX, e.offsetY));
            }
            isButtonPressed = false;
        }
    };

    const mousemove = (e) => {
        if (isButtonPressed && tool !== null && tool.move !== undefined) {
            tool.move(makePoint(e.offsetX, e.offsetY));
        }
    };

    const keydown = (e) => {
        if (e.ctrlKey && e.code === "KeyZ") {
            history.restore();
        }
        else if (e.code === "KeyP") {
            toolFn = pen;
        }
        else if (e.code === "KeyR") {
            toolFn = shape(rect);
        }
        else if (e.code === "KeyE") {
            toolFn = shape(ellipse);
        }
        else if (e.code === "KeyL") {
            toolFn = shape(line);
        }

        if (tool !== null) {
            abort();
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
