"use strict";

function makeHistory(ctx)
{
    const canvas = ctx.canvas;
    let lastImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const stack = [];

    const reset = () => {
        ctx.putImageData(lastImage, 0, 0);
    };

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
    return {save, restore, reset};
}
