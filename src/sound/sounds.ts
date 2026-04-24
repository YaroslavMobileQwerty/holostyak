export const SOUNDS = {
  bet_placed: '/sounds/bet_placed.wav',
  win: '/sounds/win.wav',
  lost: '/sounds/lost.wav',
  lightning: '/sounds/lightning.wav',
  achievement: '/sounds/achievement.wav',
  notification: '/sounds/notification.wav',
  balance_up: '/sounds/balance_up.wav',
} as const

export type SoundId = keyof typeof SOUNDS
export const SOUND_KEYS = Object.keys(SOUNDS) as SoundId[]
