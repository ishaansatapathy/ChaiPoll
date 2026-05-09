import { useEffect } from "react";

export function useSpotlight() {
  useEffect(() => {
    const root = document.documentElement;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let frameId;

    const setTarget = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      root.style.setProperty("--spotlight-x", `${currentX}px`);
      root.style.setProperty("--spotlight-y", `${currentY}px`);
      frameId = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", setTarget, { passive: true });
    window.addEventListener("pointerdown", setTarget, { passive: true });
    animate();

    return () => {
      window.removeEventListener("pointermove", setTarget);
      window.removeEventListener("pointerdown", setTarget);
      cancelAnimationFrame(frameId);
    };
  }, []);
}
