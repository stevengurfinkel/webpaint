"use strict";

function init()
{
    // Initialize the screen to black
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d", {alpha: false, willReadFrequently: true});
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";

    const pen = (actions) => {
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
            actions.complete();
        };

        return {down, move, up};
    };

    const shape = (draw) => {
        return (actions) => {
            let start = null;

            const down = (p) => {
                start = p;
            };

            const move = (p) => {
                actions.reset();
                ctx.beginPath();
                draw(makeRect(start, p));
                ctx.stroke();
            };

            const up = (p) => {
                actions.complete();
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

    const select = (actions) => {
        let downPt = null;
        let srcRect = null;

        const updateSrc = (p2) => {
            srcRect = makeRect(downPt, p2);
        };

        const draw = () => {
            actions.reset();
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(...srcRect.params);
            ctx.setLineDash([]);
        };

        const down = (p) => {
            downPt = p;
            if (srcRect !== null && !srcRect.contains(p)) {
                actions.abort();
            }
        };

        const move = (p) => {
            updateSrc(p);
            draw();
        };

        const up = (p) => {
            updateSrc(p);
            draw();
        };
        return {down, move, up};
    };

    dispatch(ctx,
             pen,
             {KeyP: pen,
              KeyR: shape(rect),
              KeyE: shape(ellipse),
              KeyL: shape(line),
              KeyS: select});
}
