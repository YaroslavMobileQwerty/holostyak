/**
 * Documented payout: floor of stake × odds, using odds with 2 decimal places
 * so floating-point (e.g. 100×2.55) matches Postgres numeric.
 */
export function floorPayout(amount: number, odds: number): number {
  const oddsHundredths = Math.round(odds * 100)
  return Math.floor((amount * oddsHundredths) / 100)
}
