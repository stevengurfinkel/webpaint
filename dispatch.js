"use strict";

function dispatch(ctx, toolFn, toolFns)
{
    const history = makeHistory(ctx);

    let tool = null;
    let isButtonPressed = false;

    const reset = () => {
        history.restore();
        history.save();
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

        if (e.ctrlKey && e.code === "KeyZ") {
            if (tool === null) {
                history.restore();
            }
        }
        else if (newToolFn !== undefined) {
            toolFn = newToolFn;
        }

        if ((e.code === "Escape" || newToolFn !== undefined) && tool !== null) {
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
