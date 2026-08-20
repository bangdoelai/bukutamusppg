'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Clock3, FileText, MapPin, ShieldCheck } from 'lucide-react'
import { GuestbookForm } from '@/components/guestbook-form'
import { HeaderLogos } from '@/components/header-logos'

function LiveDateTime() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const date = now ? new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar',
  }).format(now) : 'Memuat tanggal...'
  const time = now ? new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Makassar',
  }).format(now) : '--:--:--'

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground" aria-live="polite">
      <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-primary" aria-hidden="true" />{date}</span>
      <span className="inline-flex items-center gap-2"><Clock3 className="size-4 text-primary" aria-hidden="true" />{time} WITA</span>
    </div>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-8 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <HeaderLogos />
          <div className="flex items-center gap-3">
            <Link
              href="/rekap"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              <FileText className="size-4 text-primary" /> Rekap Tamu
            </Link>
            <div className="hidden items-center gap-2 rounded-full bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground sm:flex">
              <ShieldCheck className="size-4" aria-hidden="true" /> Data terlindungi
            </div>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20 lg:py-20">
          <section className="flex flex-col gap-7">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary"><MapPin className="size-4" aria-hidden="true" />Selamat datang</div>
            <div className="flex flex-col gap-4">
              <h1 className="max-w-xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">Buku Tamu <span className="text-primary">SPPG Bontang Selatan</span> Berbas Tengah</h1>
              <p className="max-w-lg text-pretty text-base leading-7 text-muted-foreground sm:text-lg">Silakan isi data kunjungan Anda. Kami senang menyambut dan melayani Anda dengan sepenuh hati.</p>
            </div>
            <LiveDateTime />
            <div className="hidden border-l-2 border-primary/20 pl-4 text-sm leading-6 text-muted-foreground lg:block">Mohon mengisi formulir di samping dengan data yang benar untuk membantu proses pelayanan.</div>
          </section>

          <section className="rounded-[2rem] border border-border bg-card p-6 shadow-[0_24px_60px_-32px] shadow-primary/40 sm:p-8">
            <div className="mb-7 flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Formulir kunjungan</p>
              <h2 className="text-2xl font-bold text-card-foreground">Silakan isi data Anda</h2>
              <p className="text-sm leading-6 text-muted-foreground">Pastikan informasi yang diisi sudah sesuai.</p>
            </div>
            <GuestbookForm />
          </section>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border py-5 text-xs text-muted-foreground">
          <span>Buku Tamu Digital • SPPG Bontang Selatan Berbas Tengah</span>
          <Link href="/rekap" className="font-semibold text-primary hover:underline">Lihat Rekapitulasi Tamu &rarr;</Link>
        </footer>
      </div>
    </main>
  )
}

