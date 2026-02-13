import confetti from "canvas-confetti";

export function celebrateXpGain(amount: number) {
  if (amount >= 100) {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#0B3C5D", "#00C896", "#F5B700"],
    });
  } else if (amount >= 50) {
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
      colors: ["#00C896", "#F5B700"],
    });
  }
}

export function celebrateLevelUp() {
  const duration = 2000;
  const end = Date.now() + duration;
  const colors = ["#0B3C5D", "#00C896", "#F5B700"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function celebrateMissionComplete() {
  confetti({
    particleCount: 60,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#F5B700", "#00C896"],
    shapes: ["star"],
    scalar: 1.2,
  });
}

export function celebrateStreakMilestone(days: number) {
  const intensity = Math.min(days / 7, 3);
  confetti({
    particleCount: Math.round(30 * intensity),
    spread: 60 * intensity,
    origin: { y: 0.7 },
    colors: ["#F5B700", "#FF6B35"],
    shapes: ["circle"],
  });
}

export function celebrateBadgeEarned() {
  confetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.5 },
    colors: ["#0B3C5D", "#00C896", "#F5B700", "#FFD700"],
    shapes: ["star", "circle"],
    scalar: 1.5,
  });
}

export function celebrateLeaguePromotion() {
  const duration = 3000;
  const end = Date.now() + duration;
  const colors = ["#FFD700", "#00C896", "#0B3C5D"];

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.5 },
      colors,
      shapes: ["star"],
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.5 },
      colors,
      shapes: ["star"],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
