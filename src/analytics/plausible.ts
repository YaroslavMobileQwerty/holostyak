type PlausibleFn = (event: string, opts?: { props?: Record<string, unknown> }) => void

export function trackPlausible(event: string, opts?: { props?: Record<string, string | number | boolean> }) {
  const w = window as unknown as { plausible?: PlausibleFn }
  if (!w.plausible) return
  if (opts?.props) w.plausible(event, { props: opts.props as Record<string, unknown> })
  else w.plausible(event)
}
