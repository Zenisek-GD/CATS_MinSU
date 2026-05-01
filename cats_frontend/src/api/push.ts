import { api as client } from './client'

export async function getVapidPublicKey(): Promise<{ publicKey: string }> {
  const { data } = await client.get('/vapid-public-key')
  return data
}

export async function subscribeToPush(endpoint: string, keys: { p256dh: string; auth: string }): Promise<any> {
  const { data } = await client.post('/push/subscribe', { endpoint, keys })
  return data
}

export async function unsubscribeFromPush(endpoint: string): Promise<any> {
  const { data } = await client.post('/push/unsubscribe', { endpoint })
  return data
}

/**
 * Base64 to Uint8Array helper
 */
export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
