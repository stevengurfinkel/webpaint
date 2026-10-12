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
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    let stack = [];

    const save = () => {
        stack.push(ctx.getImageData(0, 0, width, height));
    };

    const restore = () => {
        const item = stack.pop();
        if (item === undefined) {
            return;
        }
        ctx.putImageData(item, 0, 0);
    };

    // return public methods
    return {save: save, restore: restore};
}
