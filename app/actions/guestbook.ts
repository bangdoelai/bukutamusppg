'use server'

import { db } from '@/lib/db'
import { guestbookEntries } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'

import { desc } from 'drizzle-orm'

import { guestbookEmitter } from '@/lib/events'

export async function submitGuestbookEntry(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const institution = String(formData.get('institution') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const purpose = String(formData.get('purpose') ?? '').trim()

  if (!name || !institution || !phone || !purpose) {
    return { success: false, message: 'Mohon lengkapi semua data terlebih dahulu.' }
  }

  if (name.length > 120 || institution.length > 160 || phone.length > 32 || purpose.length > 500) {
    return { success: false, message: 'Data yang dimasukkan terlalu panjang.' }
  }

  const inserted = await db.insert(guestbookEntries).values({ name, institution, phone, purpose }).returning()

  if (inserted && inserted[0]) {
    guestbookEmitter.emit('guestbook-entry-added', inserted[0])
  }

  revalidatePath('/')
  revalidatePath('/rekap')
  return { success: true, message: 'Terima kasih, data kunjungan Anda telah tercatat.' }
}

export async function getGuestbookEntries() {
  try {
    const entries = await db.select().from(guestbookEntries).orderBy(desc(guestbookEntries.createdAt))
    return { success: true, data: entries }
  } catch (error) {
    console.error('Error fetching guestbook entries:', error)
    return { success: false, data: [], message: 'Gagal mengambil data dari database.' }
  }
}

