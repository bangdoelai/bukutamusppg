'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { submitGuestbookEntry } from '@/app/actions/guestbook'

const fields = [
  { name: 'name', label: 'Nama', placeholder: 'Tuliskan nama lengkap Anda', type: 'text' },
  { name: 'institution', label: 'Instansi', placeholder: 'Contoh: Dinas Pendidikan', type: 'text' },
  { name: 'phone', label: 'No. HP / WhatsApp', placeholder: 'Contoh: 0812 3456 7890', type: 'tel' },
] as const

export function GuestbookForm() {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null)

  function handleSubmit(formData: FormData) {
    setStatus(null)
    startTransition(async () => {
      try {
        const result = await submitGuestbookEntry(formData)
        setStatus(result)
        if (result.success) {
          (document.getElementById('guestbook-form') as HTMLFormElement)?.reset()
        }
      } catch {
        setStatus({ success: false, message: 'Terjadi kendala. Silakan coba kembali.' })
      }
    })
  }

  return (
    <form id="guestbook-form" action={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-2">
            <label htmlFor={field.name} className="text-sm font-semibold text-foreground">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              required
              className="min-h-13 rounded-2xl border border-input bg-background px-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
        ))}
        <div className="flex flex-col gap-2">
          <label htmlFor="purpose" className="text-sm font-semibold text-foreground">Tujuan</label>
          <textarea
            id="purpose"
            name="purpose"
            placeholder="Sampaikan tujuan kunjungan Anda"
            required
            rows={4}
            className="resize-none rounded-2xl border border-input bg-background px-4 py-3 text-base leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </div>

      {status && (
        <div role="status" className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm leading-5 ${status.success ? 'bg-accent text-accent-foreground' : 'bg-destructive/10 text-destructive'}`}>
          {status.success && <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />}
          <span>{status.message}</span>
        </div>
      )}

      <button type="submit" disabled={isPending} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-base font-bold text-primary-foreground shadow-[0_12px_24px_-12px] shadow-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Send className="size-5" aria-hidden="true" />}
        {isPending ? 'Menyimpan data...' : 'Kirim Data Kunjungan'}
      </button>
    </form>
  )
}
