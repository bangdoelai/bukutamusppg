'use server'

import { redirect } from 'next/navigation'
import { createAdminSession, destroyAdminSession } from '@/lib/auth'

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()

  const expectedUsername = process.env.ADMIN_USERNAME || 'admin'
  const expectedPassword = process.env.ADMIN_PASSWORD || 'sppgbontang123'

  if (!username || !password) {
    return { success: false, message: 'Username dan Password wajib diisi.' }
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return { success: false, message: 'Username atau Password salah. Silakan coba lagi.' }
  }

  await createAdminSession(username)
  redirect('/rekap')
}

export async function logoutAdmin() {
  await destroyAdminSession()
  redirect('/login')
}
