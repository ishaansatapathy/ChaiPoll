const root = document.documentElement;

let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
let currentX = targetX;
let currentY = targetY;

function setTarget(event) {
  targetX = event.clientX;
  targetY = event.clientY;
}

function animateSpotlight() {
  currentX += (targetX - currentX) * 0.16;
  currentY += (targetY - currentY) * 0.16;

  root.style.setProperty("--spotlight-x", `${currentX}px`);
  root.style.setProperty("--spotlight-y", `${currentY}px`);

  requestAnimationFrame(animateSpotlight);
}

window.addEventListener("pointermove", setTarget, { passive: true });
window.addEventListener("pointerdown", setTarget, { passive: true });
window.addEventListener("resize", () => {
  targetX = window.innerWidth / 2;
  targetY = window.innerHeight / 2;
});

animateSpotlight();
