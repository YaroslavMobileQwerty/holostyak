import type { Options } from 'canvas-confetti'

const COLORS = ['#d50032', '#f5e6d3', '#ffd700']

export function celebrationConfetti(): Options {
  return {
    particleCount: 80,
    spread: 70,
    origin: { y: 0.65 },
    colors: COLORS,
    disableForReducedMotion: true,
  }
}
