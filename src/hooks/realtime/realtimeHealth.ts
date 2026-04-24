let active = 0
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

export function bumpChannels(delta: number) {
  active += delta
  if (active < 0) active = 0
  emit()
}

export function getActiveChannelCount(): number {
  return active
}

export function subscribeActiveChannels(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}
