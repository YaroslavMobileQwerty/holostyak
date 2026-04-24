import confetti from 'canvas-confetti'

/** Rose-toned burst for `first_rose` wins (no external PNG required). */
export function fireRosePetals() {
  const pink = ['#ff4166', '#d50032', '#f5e6d3', '#ffb6c1']
  void confetti({
    particleCount: 45,
    spread: 100,
    startVelocity: 35,
    origin: { x: 0.5, y: 0.12 },
    colors: pink,
    shapes: ['circle', 'star'],
    scalar: 0.9,
    disableForReducedMotion: true,
  })
}
