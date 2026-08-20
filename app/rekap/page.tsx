import { redirect } from 'next/navigation'
import { getGuestbookEntries } from '@/app/actions/guestbook'
import { RekapView } from '@/components/rekap-view'
import { HeaderLogos } from '@/components/header-logos'
import { verifyAdminSession } from '@/lib/auth'
import { ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RekapPage() {
  const isAuthenticated = await verifyAdminSession()
  if (!isAuthenticated) {
    redirect('/login')
  }

  const result = await getGuestbookEntries()
  const entries = result.success && Array.isArray(result.data) ? result.data : []

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-8 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8 print:hidden">
          <HeaderLogos />
          <div className="hidden items-center gap-2 rounded-full bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground sm:flex">
            <ShieldCheck className="size-4" aria-hidden="true" /> Rekapitulasi Digital
          </div>
        </header>

        <RekapView initialEntries={entries} />

        <footer className="mt-12 border-t border-border py-5 text-center text-xs text-muted-foreground print:hidden">
          Buku Tamu Digital • SPPG Bontang Selatan Berbas Tengah
        </footer>
      </div>
    </main>
  )
}
