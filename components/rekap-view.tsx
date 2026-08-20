'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { logoutAdmin } from '@/app/actions/auth'
import { getGuestbookEntries } from '@/app/actions/guestbook'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Download,
  FileSpreadsheet,
  LogOut,
  MessageCircle,
  Phone,
  Printer,
  Radio,
  RotateCcw,
  Search,
  Users,
} from 'lucide-react'

function formatPhoneNumberForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  }
  return cleaned
}

function formatPhoneNumberForTel(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    return '0' + cleaned.slice(1)
  }
  if (cleaned.startsWith('62')) {
    return '+' + cleaned
  }
  return cleaned || phone
}

export interface GuestEntry {
  id: number
  name: string
  institution: string
  phone: string
  purpose: string
  createdAt: Date | string
}

interface RekapViewProps {
  initialEntries: GuestEntry[]
}

type SortColumn = 'id' | 'createdAt' | 'name' | 'institution' | 'phone' | 'purpose'
type SortDirection = 'asc' | 'desc'

export function RekapView({ initialEntries }: RekapViewProps) {
  const [entries, setEntries] = useState<GuestEntry[]>(initialEntries)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [newEntryIds, setNewEntryIds] = useState<Set<number>>(new Set())
  const [isLiveConnected, setIsLiveConnected] = useState(false)

  // Keep state in sync if initialEntries changes from server
  useEffect(() => {
    setEntries(initialEntries)
  }, [initialEntries])

  // Real-time SSE listener
  useEffect(() => {
    let eventSource: EventSource | null = null

    try {
      eventSource = new EventSource('/api/guestbook/stream')

      eventSource.addEventListener('connected', () => {
        setIsLiveConnected(true)
      })

      eventSource.addEventListener('new-entry', (event) => {
        try {
          const newEntry = JSON.parse(event.data) as GuestEntry
          setEntries((prev) => {
            if (prev.some((e) => e.id === newEntry.id)) return prev
            return [newEntry, ...prev]
          })

          // Highlight newly added row for 5 seconds
          setNewEntryIds((prev) => new Set(prev).add(newEntry.id))
          setTimeout(() => {
            setNewEntryIds((prev) => {
              const next = new Set(prev)
              next.delete(newEntry.id)
              return next
            })
          }, 5000)
        } catch (err) {
          console.error('Gagal memproses data tamu baru:', err)
        }
      })

      eventSource.onerror = () => {
        setIsLiveConnected(false)
      }
    } catch (err) {
      console.error('Error inisialisasi EventSource:', err)
    }

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [])

  // Real-time polling fallback (works 100% reliably on Vercel Serverless)
  useEffect(() => {
    let isMounted = true

    async function checkForUpdates() {
      try {
        const res = await getGuestbookEntries()
        if (res.success && Array.isArray(res.data) && isMounted) {
          const freshEntries = res.data as GuestEntry[]
          setEntries((prev) => {
            const existingIds = new Set(prev.map((e) => e.id))
            const brandNewEntries = freshEntries.filter((e) => !existingIds.has(e.id))

            if (brandNewEntries.length > 0) {
              setNewEntryIds((prevIds) => {
                const nextIds = new Set(prevIds)
                brandNewEntries.forEach((e) => nextIds.add(e.id))
                return nextIds
              })

              setTimeout(() => {
                setNewEntryIds((prevIds) => {
                  const nextIds = new Set(prevIds)
                  brandNewEntries.forEach((e) => nextIds.delete(e.id))
                  return nextIds
                })
              }, 5000)

              return freshEntries
            }
            return prev
          })
          setIsLiveConnected(true)
        }
      } catch (err) {
        // Silent catch for background polling
      }
    }

    const interval = setInterval(checkForUpdates, 3000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  // Combined Filtering and Sorting logic
  const processedEntries = useMemo(() => {
    let result = [...entries]

    // 1. Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (entry) =>
          entry.name.toLowerCase().includes(term) ||
          entry.institution.toLowerCase().includes(term) ||
          entry.purpose.toLowerCase().includes(term) ||
          entry.phone.includes(term)
      )
    }

    // 2. Filter by date range (startDate to endDate)
    if (startDate) {
      const start = new Date(`${startDate}T00:00:00`)
      result = result.filter((entry) => new Date(entry.createdAt) >= start)
    }
    if (endDate) {
      const end = new Date(`${endDate}T23:59:59.999`)
      result = result.filter((entry) => new Date(entry.createdAt) <= end)
    }

    // 3. Sort by column
    result.sort((a, b) => {
      let valA: unknown = a[sortColumn]
      let valB: unknown = b[sortColumn]

      if (sortColumn === 'createdAt') {
        valA = new Date(a.createdAt).getTime()
        valB = new Date(b.createdAt).getTime()
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA
      }

      const strA = String(valA ?? '').toLowerCase()
      const strB = String(valB ?? '').toLowerCase()
      return sortDirection === 'asc'
        ? strA.localeCompare(strB, 'id')
        : strB.localeCompare(strA, 'id')
    })

    return result
  }, [entries, searchTerm, startDate, endDate, sortColumn, sortDirection])

  const todayCount = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Makassar' })
    return entries.filter((e) => {
      const entryDate = new Date(e.createdAt).toLocaleDateString('id-ID', { timeZone: 'Asia/Makassar' })
      return entryDate === todayStr
    }).length
  }, [entries])

  function handleSort(col: SortColumn) {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(col)
      setSortDirection(col === 'createdAt' ? 'desc' : 'asc')
    }
  }

  function handleResetFilters() {
    setSearchTerm('')
    setStartDate('')
    setEndDate('')
    setSortColumn('createdAt')
    setSortDirection('desc')
  }

  function handleExportCSV() {
    if (processedEntries.length === 0) return

    const headers = ['No', 'ID', 'Waktu Kunjungan (WITA)', 'Nama Lengkap', 'Instansi', 'No. HP / WA', 'Tujuan Kunjungan']
    const rows = processedEntries.map((e, index) => {
      const formattedDate = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: 'Asia/Makassar',
      }).format(new Date(e.createdAt))
      return [
        index + 1,
        e.id,
        `"${formattedDate}"`,
        `"${e.name.replace(/"/g, '""')}"`,
        `"${e.institution.replace(/"/g, '""')}"`,
        `"${e.phone.replace(/"/g, '""')}"`,
        `"${e.purpose.replace(/"/g, '""')}"`,
      ].join(',')
    })

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `rekap-buku-tamu-sppg-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handlePrint() {
    window.print()
  }

  function renderSortIcon(col: SortColumn) {
    if (sortColumn !== col) {
      return <ArrowUpDown className="size-3.5 text-muted-foreground opacity-50 group-hover:opacity-100" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="size-3.5 text-primary" />
    ) : (
      <ArrowDown className="size-3.5 text-primary" />
    )
  }

  const isFilterActive = searchTerm !== '' || startDate !== '' || endDate !== ''

  return (
    <div className="flex flex-col gap-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="size-4" /> Form Buku Tamu
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Radio className={`size-3.5 ${isLiveConnected ? 'animate-pulse text-emerald-600' : 'text-muted-foreground'}`} />
            {isLiveConnected ? 'Live Sync Aktif' : 'Menghubungkan Stream...'}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={processedEntries.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-sm transition hover:bg-secondary/80 disabled:opacity-50"
          >
            <FileSpreadsheet className="size-4 text-primary" /> Export CSV (Excel)
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Printer className="size-4" /> Cetak Rekap
          </button>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive hover:text-white"
            >
              <LogOut className="size-4" /> Keluar (Logout)
            </button>
          </form>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
        <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Kunjungan</p>
            <p className="text-3xl font-bold text-foreground">{entries.length} <span className="text-sm font-normal text-muted-foreground">Tamu</span></p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Calendar className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kunjungan Hari Ini</p>
            <p className="text-3xl font-bold text-foreground">{todayCount} <span className="text-sm font-normal text-muted-foreground">Tamu</span></p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Download className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hasil Filter/Cari</p>
            <p className="text-3xl font-bold text-foreground">{processedEntries.length} <span className="text-sm font-normal text-muted-foreground">Tamu</span></p>
          </div>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="flex flex-col gap-6 rounded-[2rem] border border-border bg-card p-6 shadow-[0_24px_60px_-32px] shadow-primary/30 sm:p-8">
        {/* Header & Filter Controls Bar */}
        <div className="flex flex-col gap-4 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Daftar Tamu Kunjungan</h2>
              <p className="text-sm text-muted-foreground">Rekapitulasi data pengunjung SPPG Bontang Selatan Berbas Tengah</p>
            </div>
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <RotateCcw className="size-3.5" /> Reset Filter
              </button>
            )}
          </div>

          {/* Date Selector & Search Inputs */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari nama, instansi, atau tujuan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background pl-10 pr-4 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            {/* Date Range: From Date */}
            <div className="flex items-center gap-2 rounded-2xl border border-input bg-background px-3.5 py-2">
              <label htmlFor="startDate" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Dari:
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-transparent text-xs text-foreground outline-none"
              />
            </div>

            {/* Date Range: To Date */}
            <div className="flex items-center gap-2 rounded-2xl border border-input bg-background px-3.5 py-2">
              <label htmlFor="endDate" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Sampai:
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-transparent text-xs text-foreground outline-none"
              />
            </div>
          </div>
        </div>

        {/* Printable Header */}
        <div className="hidden print:block mb-4 text-center border-b pb-4">
          <div className="flex items-center justify-center gap-4 mb-3">
            <img src="/logo-bgn.png" alt="Logo Badan Gizi Nasional" className="h-16 w-auto object-contain" />
            <img src="/logo-fbj.png" alt="Logo Yayasan Fahreza Berkah Jaya" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold">REKAPITULASI BUKU TAMU DIGITAL</h1>
          <p className="text-sm font-semibold">SPPG Bontang Selatan Berbas Tengah</p>
          <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
            Dicetak pada: {new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })} WITA
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
                <th className="py-3.5 px-4 rounded-l-xl">
                  <button
                    type="button"
                    onClick={() => handleSort('id')}
                    className="group inline-flex items-center gap-1.5 transition hover:text-foreground"
                  >
                    <span>No</span>
                    {renderSortIcon('id')}
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort('createdAt')}
                    className="group inline-flex items-center gap-1.5 transition hover:text-foreground"
                  >
                    <span>Waktu (WITA)</span>
                    {renderSortIcon('createdAt')}
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort('name')}
                    className="group inline-flex items-center gap-1.5 transition hover:text-foreground"
                  >
                    <span>Nama Lengkap</span>
                    {renderSortIcon('name')}
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort('institution')}
                    className="group inline-flex items-center gap-1.5 transition hover:text-foreground"
                  >
                    <span>Instansi</span>
                    {renderSortIcon('institution')}
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort('phone')}
                    className="group inline-flex items-center gap-1.5 transition hover:text-foreground"
                  >
                    <span>No. HP / WA</span>
                    {renderSortIcon('phone')}
                  </button>
                </th>
                <th className="py-3.5 px-4 rounded-r-xl">
                  <button
                    type="button"
                    onClick={() => handleSort('purpose')}
                    className="group inline-flex items-center gap-1.5 transition hover:text-foreground"
                  >
                    <span>Tujuan Kunjungan</span>
                    {renderSortIcon('purpose')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {processedEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    {isFilterActive
                      ? 'Tidak ada data tamu yang sesuai dengan filter atau kata kunci pencarian.'
                      : 'Belum ada data kunjungan tamu.'}
                  </td>
                </tr>
              ) : (
                processedEntries.map((entry, index) => {
                  const dateObj = new Date(entry.createdAt)
                  const formattedDateTime = isNaN(dateObj.getTime())
                    ? '-'
                    : new Intl.DateTimeFormat('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Makassar',
                      }).format(dateObj)

                  const isNew = newEntryIds.has(entry.id)

                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors duration-1000 ${
                        isNew
                          ? 'bg-emerald-500/20 font-medium text-emerald-950 dark:bg-emerald-500/20 dark:text-emerald-200'
                          : 'hover:bg-muted/30'
                      }`}
                    >
                      <td className="py-4 px-4 text-xs font-normal text-muted-foreground">
                        {index + 1}
                        {isNew && <span className="ml-2 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase animate-pulse">Baru</span>}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-xs font-medium text-muted-foreground">{formattedDateTime}</td>
                      <td className="py-4 px-4 font-semibold text-foreground">{entry.name}</td>
                      <td className="py-4 px-4 text-foreground">{entry.institution}</td>
                      <td className="py-4 px-4 text-xs font-normal text-foreground whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-medium text-foreground">{entry.phone}</span>
                          <div className="inline-flex items-center gap-1 print:hidden">
                            <a
                              href={`tel:${formatPhoneNumberForTel(entry.phone)}`}
                              title={`Telepon ${entry.phone}`}
                              className="inline-flex size-6 items-center justify-center rounded-md border border-border bg-muted/60 text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                            >
                              <Phone className="size-3" />
                            </a>
                            <a
                              href={`https://wa.me/${formatPhoneNumberForWhatsApp(entry.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`WhatsApp ${entry.phone}`}
                              className="inline-flex size-6 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 transition hover:bg-emerald-600 hover:text-white dark:text-emerald-400 dark:hover:text-white"
                            >
                              <MessageCircle className="size-3" />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-foreground max-w-xs break-words">{entry.purpose}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
