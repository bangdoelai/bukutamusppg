'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, KeyRound, Loader2, Lock, LogIn, ShieldAlert, User } from 'lucide-react'
import { HeaderLogos } from '@/components/header-logos'
import { loginAdmin } from '@/app/actions/auth'

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setErrorMsg(null)
    startTransition(async () => {
      try {
        const res = await loginAdmin(formData)
        if (res && !res.success) {
          setErrorMsg(res.message)
        }
      } catch (err) {
        // Handle client-side error if redirect doesn't trigger
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
          // Next.js redirect thrown, ignore
          return
        }
        setErrorMsg('Terjadi kendala saat login. Silakan coba lagi.')
      }
    })
  }

  return (
    <main className="min-h-screen bg-background flex flex-col justify-between">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-8 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <HeaderLogos />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="size-4" /> Form Buku Tamu
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-16 lg:py-24">
          <div className="w-full max-w-md rounded-[2.5rem] border border-border bg-card p-8 shadow-[0_24px_60px_-32px] shadow-primary/40 sm:p-10">
            <div className="mb-8 flex flex-col items-center text-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-sm">
                <Lock className="size-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Area Khusus Petugas</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Login Admin SPPG</h1>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Masukkan kredensial Anda untuk mengakses Rekapitulasi Data Tamu.
              </p>
            </div>

            <form action={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="username" className="text-sm font-semibold text-foreground">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Masukkan username"
                    required
                    autoComplete="username"
                    className="min-h-13 w-full rounded-2xl border border-input bg-background pl-11 pr-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Masukkan password"
                    required
                    autoComplete="current-password"
                    className="min-h-13 w-full rounded-2xl border border-input bg-background pl-11 pr-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              {errorMsg && (
                <div role="alert" className="flex items-start gap-3 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <ShieldAlert className="mt-0.5 size-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-base font-bold text-primary-foreground shadow-[0_12px_24px_-12px] shadow-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? <Loader2 className="size-5 animate-spin" /> : <LogIn className="size-5" />}
                {isPending ? 'Memverifikasi...' : 'Masuk ke Rekap Tamu'}
              </button>
            </form>
          </div>
        </div>

        <footer className="border-t border-border py-5 text-center text-xs text-muted-foreground">
          Buku Tamu Digital • SPPG Bontang Selatan Berbas Tengah
        </footer>
      </div>
    </main>
  )
}
