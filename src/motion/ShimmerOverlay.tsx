export function ShimmerText({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={`animate-shimmer bg-gradient-to-r from-rose-cream via-primary-live to-rose-cream bg-[length:200%_auto] bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  )
}
