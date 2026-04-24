export function AboutShowPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="font-serif text-4xl">Про шоу та як працює сайт</h1>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Що таке "Холостяк"?</h2>
        <p className="mt-3 text-rose-dust">
          "Холостяк" — культове романтичне реаліті-шоу українського телеканалу СТБ. У 15-му сезоні
          вперше в історії шоу будуть <em>два головні герої</em> — це відкриває унікальні сюжетні
          повороти, любовні трикутники та непередбачувані елімінації.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Як працює тоталізатор</h2>
        <p className="mt-3 text-rose-dust">
          На кожен випуск створюється набір подій, на які можна ставити бали: хто не отримає
          троянди, хто отримає першу, кого запросять на тет-а-тет. Плюс кастомні події, створені
          адміном під конкретний випуск — та lightning-ставки під час прямого ефіру.
        </p>
        <p className="mt-3 text-rose-dust">
          Коефіцієнти фіксовані, ставка × коеф = виграш. Ніяких реальних виплат — бали суто
          віртуальні, для розваги.
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-primary/30 bg-bg-card p-6">
        <h2 className="font-serif text-2xl">🇺🇦 Підтримка ЗСУ</h2>
        <p className="mt-3 text-rose-cream">
          <strong>100% усіх зібраних коштів</strong> — без жодних винятків — йде на благодійну банку
          monobank на підтримку Збройних Сил України. Сайт не заробляє на донатах. Це розвага з
          сенсом.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">FAQ</h2>
        <details className="mt-4 rounded-lg border border-white/10 bg-bg-card p-4">
          <summary className="cursor-pointer font-medium">Скільки коштує вхід?</summary>
          <p className="mt-2 text-sm text-rose-dust">
            Реєстрація безкоштовна. Старт — 0 балів. Щоб робити ставки — купи бали через донат (1
            грн = 1 бал).
          </p>
        </details>
        <details className="mt-2 rounded-lg border border-white/10 bg-bg-card p-4">
          <summary className="cursor-pointer font-medium">
            Можу я вивести виграші у гроші?
          </summary>
          <p className="mt-2 text-sm text-rose-dust">Ні. Це виключно віртуальні бали для розваги.</p>
        </details>
        <details className="mt-2 rounded-lg border border-white/10 bg-bg-card p-4">
          <summary className="cursor-pointer font-medium">Що отримую за перше місце?</summary>
          <p className="mt-2 text-sm text-rose-dust">
            Трофей у профілі, сповіщення після фіналу та запит на адресу доставки для секретного
            призу від команди сайту.
          </p>
        </details>
      </section>
    </div>
  )
}
