import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  deliveryFormSchemaWithRefine,
  type DeliveryFormValues,
} from '@/lib/schemas/deliveryForm'
import { useSubmitDeliveryForm } from '@/hooks/useSubmitDeliveryForm'

const defaults: DeliveryFormValues = {
  firstName: '',
  lastName: '',
  phone: '+380',
  carrier: 'nova_poshta',
  city: null,
  address: null,
  branchNumber: null,
}

export function DeliveryFormModal({
  prizeId,
  open,
  onClose,
  trophyTitle,
}: {
  prizeId: string
  open: boolean
  onClose: () => void
  trophyTitle: string
}) {
  const submit = useSubmitDeliveryForm()
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliveryFormSchemaWithRefine) as Resolver<DeliveryFormValues>,
    defaultValues: defaults,
  })
  const carrierRaw = useWatch({ control: form.control, name: 'carrier' })
  const carrier = carrierRaw ?? 'nova_poshta'

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/15 bg-bg-card p-6 shadow-xl"
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-xl text-rose-cream">Доставка: {trophyTitle}</h2>
        <p className="mt-1 text-sm text-rose-dust">Заповни форму — адміни звʼяжуться для відправки.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await submit.mutateAsync({ prizeId, values })
              toast.success('Адреса збережена')
              onClose()
              form.reset(defaults)
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Помилка')
            }
          })}
        >
          <div>
            <label className="text-xs text-rose-dust">Ім&apos;я</label>
            <input
              className="mt-1 w-full rounded border border-white/15 bg-bg-base px-3 py-2 text-rose-cream"
              autoComplete="given-name"
              {...form.register('firstName')}
            />
            {form.formState.errors.firstName ? (
              <p className="mt-1 text-xs text-primary-hot">{form.formState.errors.firstName.message}</p>
            ) : null}
          </div>
          <div>
            <label className="text-xs text-rose-dust">Прізвище</label>
            <input
              className="mt-1 w-full rounded border border-white/15 bg-bg-base px-3 py-2 text-rose-cream"
              autoComplete="family-name"
              {...form.register('lastName')}
            />
            {form.formState.errors.lastName ? (
              <p className="mt-1 text-xs text-primary-hot">{form.formState.errors.lastName.message}</p>
            ) : null}
          </div>
          <div>
            <label className="text-xs text-rose-dust">Телефон</label>
            <input
              className="mt-1 w-full rounded border border-white/15 bg-bg-base px-3 py-2 font-mono text-rose-cream"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+380991234567"
              {...form.register('phone')}
            />
            {form.formState.errors.phone ? (
              <p className="mt-1 text-xs text-primary-hot">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>

          <div>
            <p className="text-xs text-rose-dust">Спосіб</p>
            <div className="mt-2 space-y-2">
              {(
                [
                  ['nova_poshta', 'Нова Пошта (відділення)'],
                  ['ukr_poshta', 'Укрпошта'],
                  ['manual', 'Інше / курʼєр (вільний текст)'],
                ] as const
              ).map(([v, label]) => (
                <label key={v} className="flex cursor-pointer items-center gap-2 text-sm text-rose-cream">
                  <input type="radio" value={v} {...form.register('carrier')} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {carrier === 'nova_poshta' ? (
            <>
              <div>
                <label className="text-xs text-rose-dust">Місто</label>
                <input
                  className="mt-1 w-full rounded border border-white/15 bg-bg-base px-3 py-2 text-rose-cream"
                  {...form.register('city')}
                />
                {form.formState.errors.city ? (
                  <p className="mt-1 text-xs text-primary-hot">{form.formState.errors.city.message}</p>
                ) : null}
              </div>
              <div>
                <label className="text-xs text-rose-dust">№ відділення</label>
                <input
                  className="mt-1 w-full rounded border border-white/15 bg-bg-base px-3 py-2 font-mono text-rose-cream"
                  {...form.register('branchNumber')}
                />
                {form.formState.errors.branchNumber ? (
                  <p className="mt-1 text-xs text-primary-hot">{form.formState.errors.branchNumber.message}</p>
                ) : null}
              </div>
            </>
          ) : null}

          {(carrier === 'ukr_poshta' || carrier === 'manual') && (
            <div>
              <label className="text-xs text-rose-dust">Адреса</label>
              <textarea
                className="mt-1 w-full rounded border border-white/15 bg-bg-base px-3 py-2 text-sm text-rose-cream"
                rows={3}
                {...form.register('address')}
              />
              {form.formState.errors.address ? (
                <p className="mt-1 text-xs text-primary-hot">{form.formState.errors.address.message}</p>
              ) : null}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              className="rounded border border-white/20 px-4 py-2 text-sm"
              onClick={onClose}
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={submit.isPending}
              className="rounded bg-primary px-4 py-2 text-sm text-white"
            >
              {submit.isPending ? 'Збереження…' : 'Надіслати'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
