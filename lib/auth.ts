import { cookies } from 'next/headers'
import { createHmac } from 'crypto'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 hari (dalam detik)

function getSecret() {
  return process.env.SESSION_SECRET || 'sppg_bontang_default_secret_key_2026'
}

export function generateSessionToken(username: string): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000
  const payload = `${username}:${expiresAt}`
  const signature = createHmac('sha256', getSecret()).update(payload).digest('hex')
  return `${payload}:${signature}`
}

export function verifySessionToken(token: string): boolean {
  if (!token) return false
  const parts = token.split(':')
  if (parts.length !== 3) return false

  const [username, expiresAtStr, signature] = parts
  const expiresAt = parseInt(expiresAtStr, 10)

  if (isNaN(expiresAt) || Date.now() > expiresAt) return false

  const expectedUsername = process.env.ADMIN_USERNAME || 'admin'
  if (username !== expectedUsername) return false

  const payload = `${username}:${expiresAtStr}`
  const expectedSignature = createHmac('sha256', getSecret()).update(payload).digest('hex')

  return signature === expectedSignature
}

export async function createAdminSession(username: string) {
  const token = generateSessionToken(username)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

export async function destroyAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return false
  return verifySessionToken(token)
}
