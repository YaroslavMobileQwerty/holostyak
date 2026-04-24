/** When WebSocket subscriptions fail, poll at a faster interval during live episodes. */
export function decidePollingIntervalMs(isLiveEpisode: boolean, wsFailed: boolean): number {
  if (!wsFailed) return 0
  return isLiveEpisode ? 10_000 : 30_000
}
