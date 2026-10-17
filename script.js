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
        let srcStartPt = null;
        let srcRect = null;

        const updateSrc = (srcEndPt) => {
            srcRect = makeRect(srcStartPt, srcEndPt);
        };

        const drawRect = (r) => {
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(...r.params);
            ctx.setLineDash([]);
        };

        const drawSrc = () => {
            actions.reset();
            drawRect(srcRect);
        };

        const downSrc = (p) => {
            srcStartPt = p;
        };

        const moveSrc = (p) => {
            updateSrc(p);
            drawSrc();
        };

        const upSrc = (p) => {
            updateSrc(p);
            if (srcRect.width > 0 && srcRect.height > 0) {
                imageData = ctx.getImageData(...srcRect.params);
                dstRect = srcRect;
                curTool.down = downDrag;
                curTool.move = moveDrag;
                curTool.up = upDrag;
            }
            drawSrc();
        };

        let dstRect = null;
        let clickOffset = null;
        let imageData = null;

        const drawDst = () => {
            actions.reset();
            drawRect(dstRect);
        };

        const updateDst = (p) => {
            if (clickOffset !== null) {
                dstRect = makeRectFromParams(p.x - clickOffset.x,
                                             p.y - clickOffset.y,
                                             imageData.width,
                                             imageData.height);
            }
        };

        const downDrag = (p) => {
            if (dstRect.contains(p)) {
                clickOffset = {x: p.x - dstRect.lo.x, y: p.y - dstRect.lo.y};
            }
            else {
                actions.abort();
            }
        };

        const moveDrag = (p) => {
            updateDst(p);
            drawDst();
        };

        const upDrag = (p) => {
            updateDst(p);
            clickOffset = null;
            drawDst();
        };

        const curTool = {down: downSrc, move: moveSrc, up: upSrc};

        return curTool;
    };

    dispatch(ctx,
             pen,
             {KeyP: pen,
              KeyR: shape(rect),
              KeyE: shape(ellipse),
              KeyL: shape(line),
              KeyS: select});
}
