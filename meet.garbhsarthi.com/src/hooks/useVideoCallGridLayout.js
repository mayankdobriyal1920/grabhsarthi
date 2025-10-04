// useSquareCallGridLayout.js
import { useEffect, useLayoutEffect, useRef } from "react";

/** Choose cols 1..n to maximize square tile size within container (W×H), accounting for gaps */
function bestSquarePacking(n, W, H, gapX = 0, gapY = 0) {
    let best = { cols: 1, rows: n, size: 0 };
    for (let cols = 1; cols <= n; cols++) {
        const rows = Math.ceil(n / cols);

        // total gap pixels consumed by the grid
        const gapsW = Math.max(0, cols - 1) * gapX;
        const gapsH = Math.max(0, rows - 1) * gapY;

        const cellW = (W - gapsW) / cols;
        const cellH = (H - gapsH) / rows;

        const tileSize = Math.floor(Math.max(0, Math.min(cellW, cellH))); // square side
        if (tileSize > best.size) best = { cols, rows, size: tileSize };
    }
    return best;
}

/** Attach to `.main-video-container`; makes child `.main-video-grid` tiles square */
export function useVideoCallGridLayout(containerRef) {
    const roRef = useRef(null);
    const moRef = useRef(null);
    const rafRef = useRef(0);

    const layout = () => {
        const container = containerRef.current;
        if (!container) return;

        const tiles = container.querySelectorAll(".main-video-grid"); // only direct children
        const n = tiles.length || 1;

        // Use content box (rect) minus padding; also fetch computed gaps
        const rect = container.getBoundingClientRect();
        const cs = getComputedStyle(container);

        const padX =
            parseFloat(cs.paddingLeft || "0") + parseFloat(cs.paddingRight || "0");
        const padY =
            parseFloat(cs.paddingTop || "0") + parseFloat(cs.paddingBottom || "0");

        // CSS gaps: prefer column/row gap; fall back to gap
        const gapX = parseFloat(cs.columnGap || cs.gap || "0");
        const gapY = parseFloat(cs.rowGap || cs.gap || "0");

        const W = Math.max(0, rect.width - padX);
        const H = Math.max(0, rect.height - padY);

        const { cols, size } = bestSquarePacking(n, W, H, gapX, gapY);

        // Centered grid + fixed square tracks
        container.style.display = "grid";
        container.style.gridTemplateColumns = `repeat(${Math.min(cols, n)}, ${size}px)`;
        container.style.gridAutoRows = `${size}px`;
        container.style.justifyContent = "center";
        container.style.alignContent = "center";

        container.classList.toggle("single", n === 1);
        container.classList.toggle("multi", n >= 2);
    };

    // rAF to coalesce rapid resize/mutation bursts
    const scheduleLayout = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = 0;
            layout();
        });
    };

    useLayoutEffect(() => {
        layout();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Re-layout on container resize (content-box sizing)
        roRef.current = new ResizeObserver(scheduleLayout);
        roRef.current.observe(container);

        // Re-layout when tiles mount/unmount (join/leave)
        moRef.current = new MutationObserver(scheduleLayout);
        moRef.current.observe(container, { childList: true });

        window.addEventListener("resize", scheduleLayout);
        layout();

        return () => {
            roRef.current && roRef.current.disconnect();
            moRef.current && moRef.current.disconnect();
            window.removeEventListener("resize", scheduleLayout);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
