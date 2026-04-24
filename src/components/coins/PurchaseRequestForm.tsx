import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { purchaseRequestSchema, type PurchaseRequestFormValues } from '@/lib/schemas/purchaseRequest'
import { useSubmitPurchaseRequest } from '@/hooks/useSubmitPurchaseRequest'

export function PurchaseRequestForm() {
  const navigate = useNavigate()
  const submitReq = useSubmitPurchaseRequest()
  const [screenshotLabel, setScreenshotLabel] = useState<string | null>(null)
  const form = useForm<PurchaseRequestFormValues>({
    resolver: zodResolver(purchaseRequestSchema) as Resolver<PurchaseRequestFormValues>,
    defaultValues: { amount: 100, userComment: '' },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1,
    onDrop: (files) => {
      if (files[0]) {
        form.setValue('screenshot', files[0], { shouldValidate: true })
        setScreenshotLabel(files[0].name)
      }
    },
  })

  return (
    <form
      className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-bg-card p-6"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await submitReq.mutateAsync({
            amount: values.amount,
            userComment: values.userComment,
            screenshot: values.screenshot,
          })
          toast.success('Заявка прийнята, перевіряємо до 24 год')
          navigate('/wallet')
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Помилка відправки'
          toast.error(msg)
        }
      })}
    >
      <h2 className="font-serif text-2xl text-rose-cream">Заявка на бали</h2>
      <p className="text-sm text-rose-dust">
        Після донату завантажте скріншот і вкажіть суму. Адміністратор перевірить платіж і нарахує бали.
      </p>

      <div>
        <label className="text-xs uppercase tracking-wider text-rose-dust/80">Сума донату (грн)</label>
        <input
          type="number"
          min={1}
          className="mt-2 w-full rounded-lg border border-white/15 bg-bg-base px-4 py-2 font-mono text-rose-cream outline-none focus:border-primary-live"
          {...form.register('amount', { valueAsNumber: true })}
        />
        {form.formState.errors.amount ? (
          <p className="mt-1 text-sm text-primary-hot">{form.formState.errors.amount.message}</p>
        ) : null}
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-rose-dust/80">Коментар (необовʼязково)</label>
        <textarea
          className="mt-2 w-full rounded-lg border border-white/15 bg-bg-base px-4 py-2 text-sm text-rose-cream outline-none focus:border-primary-live"
          rows={3}
          maxLength={500}
          {...form.register('userComment')}
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-rose-dust/80">Скріншот оплати</label>
        <div
          {...getRootProps()}
          className={`mt-2 cursor-pointer rounded-xl border-2 border-dashed px-4 py-10 text-center text-sm transition ${
            isDragActive ? 'border-primary-live bg-primary/10' : 'border-white/20 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          {screenshotLabel ? (
            <span className="text-rose-cream">{screenshotLabel}</span>
          ) : (
            <span className="text-rose-dust">Перетягніть файл сюди або натисніть для вибору (JPG, PNG, WebP, до 5 МБ)</span>
          )}
        </div>
        {form.formState.errors.screenshot ? (
          <p className="mt-1 text-sm text-primary-hot">{form.formState.errors.screenshot.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitReq.isPending}
        className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hot disabled:opacity-50"
      >
        {submitReq.isPending ? 'Відправка…' : 'Надіслати заявку'}
      </button>
    </form>
  )
}
