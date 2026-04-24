export function UserAvatar({
  url,
  nickname,
  size = 40,
}: {
  url: string | null
  nickname: string | null
  size?: number
}) {
  const label = nickname?.slice(0, 1).toUpperCase() ?? '?'
  if (url) {
    return (
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full border border-white/15 object-cover"
      />
    )
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 font-serif text-rose-cream"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {label}
    </div>
  )
}
