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

    const mousedown = (e) => {
        if (e.button === 0) {
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

    const register = (str, fn) => {
        canvas.addEventListener(str, (e) => { fn(e); e.preventDefault(); });
    };

    register("mousedown", mousedown);
    register("mouseup", mouseup);
    register("mousemove", mousemove);                          

}
