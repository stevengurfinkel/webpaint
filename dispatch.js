"use strict";

function dispatch(ctx, toolFn, toolFns)
{
    const history = makeHistory(ctx);

    let tool = null;
    let isButtonPressed = false;

    const reset = () => {
        history.reset();
    };

    const abort = () => {
        history.restore();
        tool = null;
    };

    const complete = () => {
        tool = null;
    };

    const actions = {reset, abort, complete};

    const mousedown = (e) => {
        if (e.button === 0) {
            isButtonPressed = true;
            if (tool === null) {
                tool = toolFn(actions);
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
        const newToolFn = toolFns[e.code];
        let shouldPreventDefault = false;

        if (e.ctrlKey && e.code === "KeyZ") {
            if (tool === null) {
                history.restore();
            }
            shouldPreventDefault = true;
        }
        else if (newToolFn !== undefined) {
            toolFn = newToolFn;
            shouldPreventDefault = true;
        }

        if ((e.code === "Escape" || newToolFn !== undefined) && tool !== null) {
            abort();
        }

        if (shouldPreventDefault) {
            e.preventDefault();
        }
    };

    const register = (str, fn) => {
        canvas.addEventListener(str, (e) => {fn(e); e.preventDefault();});
    };

    register("mousedown", mousedown);
    register("mouseup", mouseup);
    register("mousemove", mousemove);
    window.addEventListener("keydown", keydown);
}
