document.querySelectorAll(".resizer").forEach(resizer => {
    let isResizing = false;

    resizer.addEventListener("mousedown", e => {
        e.preventDefault();
        isResizing = true;

        const prev = resizer.previousElementSibling;
        const next = resizer.nextElementSibling;
        const isVertical = resizer.classList.contains("vertical");

        // Add active class and body class for cursor
        resizer.classList.add("active");
        document.body.classList.add(isVertical ? "resizing" : "resizing-horizontal");

        const startPos = isVertical ? e.clientX : e.clientY;

        // Get initial sizes
        const prevRect = prev.getBoundingClientRect();
        const nextRect = next.getBoundingClientRect();
        const prevSize = isVertical ? prevRect.width : prevRect.height;
        const nextSize = isVertical ? nextRect.width : nextRect.height;

        // Set minimum sizes
        const minPrev = isVertical ? 180 : 150;
        const minNext = isVertical ? 180 : 120;

        // Lock flex basis to enable pixel-based resizing
        if (isVertical) {
            prev.style.width = prevSize + "px";
            prev.style.flexBasis = prevSize + "px";
            prev.style.flexGrow = "0";
            prev.style.flexShrink = "0";

            next.style.width = nextSize + "px";
            next.style.flexBasis = nextSize + "px";
            next.style.flexGrow = "0";
            next.style.flexShrink = "0";
        } else {
            prev.style.height = prevSize + "px";
            prev.style.flexBasis = prevSize + "px";
            prev.style.flexGrow = "0";
            prev.style.flexShrink = "0";

            next.style.height = nextSize + "px";
            next.style.flexBasis = nextSize + "px";
            next.style.flexGrow = "0";
            next.style.flexShrink = "0";
        }

        function onMouseMove(e) {
            if (!isResizing) return;

            const currentPos = isVertical ? e.clientX : e.clientY;
            const delta = currentPos - startPos;

            let newPrev = prevSize + delta;
            let newNext = nextSize - delta;

            // Apply minimum constraints
            if (newPrev < minPrev) {
                newPrev = minPrev;
                newNext = prevSize + nextSize - minPrev;
            }

            if (newNext < minNext) {
                newNext = minNext;
                newPrev = prevSize + nextSize - minNext;
            }

            // Apply the new sizes
            if (isVertical) {
                prev.style.width = newPrev + "px";
                prev.style.flexBasis = newPrev + "px";
                next.style.width = newNext + "px";
                next.style.flexBasis = newNext + "px";
            } else {
                prev.style.height = newPrev + "px";
                prev.style.flexBasis = newPrev + "px";
                next.style.height = newNext + "px";
                next.style.flexBasis = newNext + "px";
            }
        }

        function onMouseUp() {
            isResizing = false;
            resizer.classList.remove("active");
            document.body.classList.remove("resizing", "resizing-horizontal");

            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
});

// Handle window resize to maintain proportions
let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Reset flex properties to allow responsive behavior
        document.querySelectorAll(".sidebar, .editor, .terminal").forEach(el => {
            if (!el.style.width && !el.style.height) {
                el.style.flexGrow = "";
                el.style.flexShrink = "";
                el.style.flexBasis = "";
            }
        });
    }, 150);
});