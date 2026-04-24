import { describe, expect, it } from 'vitest'
import { SOUND_KEYS } from '@/sound/sounds'

describe('SOUND_KEYS', () => {
  it('includes core gameplay sounds', () => {
    expect(SOUND_KEYS).toEqual(
      expect.arrayContaining([
        'bet_placed',
        'win',
        'lost',
        'lightning',
        'achievement',
        'notification',
        'balance_up',
      ]),
    )
  })
})
