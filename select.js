"use strict";

function select(ctx) {
    return (actions) => {
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
                actions.reset();
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

        const drawDst = (isComplete) => {
            actions.reset();
            ctx.fillRect(...srcRect.params);
            ctx.putImageData(imageData, ...dstRect.lo.params);
            if (!isComplete) {
                drawRect(dstRect);
            }
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
                drawDst(true);
                actions.complete();
            }
        };

        const moveDrag = (p) => {
            updateDst(p);
            drawDst(false);
        };

        const upDrag = (p) => {
            updateDst(p);
            clickOffset = null;
            drawDst(false);
        };

        const curTool = {down: downSrc, move: moveSrc, up: upSrc};

        return curTool;
    };
}
