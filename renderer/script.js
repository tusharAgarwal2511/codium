document.querySelectorAll(".resizer").forEach(resizer => {
    resizer.addEventListener("mousedown", e => {
        e.preventDefault();

        const prev = resizer.previousElementSibling;
        const next = resizer.nextElementSibling;
        const isVertical = resizer.classList.contains("vertical");

        const startPos = isVertical ? e.clientX : e.clientY;
        const prevRect = prev.getBoundingClientRect();
        const nextRect = next.getBoundingClientRect();

        const prevSize = isVertical ? prevRect.width : prevRect.height;
        const nextSize = isVertical ? nextRect.width : nextRect.height;

        const container = resizer.parentElement.getBoundingClientRect();

        const minPrev = isVertical ? 180 : 150;
        const minNext = isVertical ? 180 : 120;

        prev.style.flex = "none";
        next.style.flex = "none";

        function onMouseMove(e) {
            const currentPos = isVertical ? e.clientX : e.clientY;
            let delta = currentPos - startPos;

            let newPrev = prevSize + delta;
            let newNext = nextSize - delta;

            // Clamp to minimum sizes
            if (newPrev < minPrev) {
                newPrev = minPrev;
                newNext = prevSize + nextSize - minPrev;
            }

            if (newNext < minNext) {
                newNext = minNext;
                newPrev = prevSize + nextSize - minNext;
            }

            // Clamp to container bounds
            if (isVertical) {
                const maxPrev = container.width - minNext;
                if (newPrev > maxPrev) {
                    newPrev = maxPrev;
                    newNext = minNext;
                }

                prev.style.width = newPrev + "px";
                next.style.width = newNext + "px";
            } else {
                const maxPrev = container.height - minNext;
                if (newPrev > maxPrev) {
                    newPrev = maxPrev;
                    newNext = minNext;
                }

                prev.style.height = newPrev + "px";
                next.style.height = newNext + "px";
            }
        }

        function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
});
