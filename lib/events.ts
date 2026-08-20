import { EventEmitter } from 'events'

// Global singleton EventEmitter to retain event listeners across Next.js re-renders
const globalForEvents = globalThis as unknown as {
  guestbookEmitter: EventEmitter | undefined
}

export const guestbookEmitter =
  globalForEvents.guestbookEmitter ?? new EventEmitter()

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.guestbookEmitter = guestbookEmitter
}

// Increase max listeners if multiple admin tabs open
guestbookEmitter.setMaxListeners(50)
