export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-bg-card py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-rose-dust">
        <p>🇺🇦 100% зібраних коштів йде на підтримку ЗСУ</p>
        <p className="mt-2 text-xs text-rose-dust/60">
          Неазартний сайт · Віртуальні бали · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
