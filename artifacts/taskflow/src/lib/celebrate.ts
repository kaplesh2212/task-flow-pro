import confetti from "canvas-confetti";

export function celebrate(opts: { intense?: boolean } = {}) {
  const colors = ["#14b8a6", "#0d9488", "#f59e0b", "#a855f7", "#ec4899"];
  if (opts.intense) {
    const duration = 1200;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    return;
  }
  confetti({
    particleCount: 70,
    spread: 65,
    startVelocity: 35,
    origin: { y: 0.7 },
    colors,
    scalar: 0.9,
  });
}

export function streakCelebrate() {
  confetti({
    particleCount: 120,
    spread: 100,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors: ["#f97316", "#ef4444", "#facc15", "#fb923c"],
    shapes: ["circle"],
    scalar: 1.1,
  });
}
