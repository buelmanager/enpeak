'use client'

// Native Bridge - Communication layer between Next.js web app and Flutter shell
// Uses flutter_inappwebview's callHandler pattern for Promise-based communication

declare global {
  interface Window {
    flutter_inappwebview?: {
      callHandler(handlerName: string, ...args: unknown[]): Promise<unknown>
    }
    __FLUTTER_BRIDGE_READY?: boolean
  }
}

interface BridgeResponse {
  id: string
  status: 'SUCCESS' | 'ERROR' | 'TOO_LONG'
  data?: Record<string, unknown>
  error?: string
}

interface RecordingData {
  base64: string
  mimeType: string
  durationMs: number
}

interface NativeAuthResult {
  uid?: string
  email?: string
  displayName?: string
  photoURL?: string
  idToken?: string
}

// Check if running inside Flutter native app
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  return !!window.flutter_inappwebview
}

// Wait for Flutter bridge to be ready
export function waitForBridge(timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Not in browser'))
      return
    }

    if (window.__FLUTTER_BRIDGE_READY) {
      resolve()
      return
    }

    const timeout = setTimeout(() => {
      window.removeEventListener('flutterBridgeReady', handler)
      reject(new Error('Bridge timeout'))
    }, timeoutMs)

    const handler = () => {
      clearTimeout(timeout)
      resolve()
    }

    window.addEventListener('flutterBridgeReady', handler, { once: true })
  })
}

// Send a message to Flutter native layer
async function sendToNative(action: string, payload?: Record<string, unknown>): Promise<BridgeResponse> {
  if (!isNativeApp()) {
    throw new Error('Not running in native app')
  }

  const request = {
    id: crypto.randomUUID(),
    action,
    payload: payload || null,
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Bridge timeout for ${action}`)), 10000)
  })

  const callPromise = window.flutter_inappwebview!.callHandler('FlutterBridge', request)

  const result = await Promise.race([callPromise, timeoutPromise])
  return result as BridgeResponse
}

// Start native recording
export async function nativeRecordStart(): Promise<void> {
  const response = await sendToNative('RECORD_START')
  if (response.status !== 'SUCCESS') {
    throw new Error(response.error || 'Failed to start recording')
  }
}

// Stop native recording and get base64 audio
export async function nativeRecordStop(): Promise<RecordingData | null> {
  const response = await sendToNative('RECORD_STOP_AND_GET_BASE64')

  if (response.status === 'TOO_LONG') {
    throw new Error('TOO_LONG')
  }

  if (response.status !== 'SUCCESS') {
    throw new Error(response.error || 'Failed to stop recording')
  }

  const data = response.data as unknown as RecordingData
  if (!data?.base64) return null

  return data
}

// Convert base64 audio to Blob
export function base64ToBlob(base64: string, mimeType = 'audio/aac'): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

// Get Firebase auth token from native
export async function getNativeToken(forceRefresh = false): Promise<string | null> {
  try {
    const response = await sendToNative('GET_TOKEN', { forceRefresh })
    if (response.status !== 'SUCCESS') return null
    return (response.data as { token?: string })?.token || null
  } catch {
    return null
  }
}

// Get platform info from native
export async function getPlatformInfo(): Promise<{ platform: string; version: string } | null> {
  try {
    const response = await sendToNative('GET_PLATFORM_INFO')
    if (response.status !== 'SUCCESS') return null
    return response.data as { platform: string; version: string }
  } catch {
    return null
  }
}

// Native Google Sign-In
export async function nativeSignInGoogle(): Promise<NativeAuthResult> {
  const response = await sendToNative('SIGN_IN_GOOGLE')
  if (response.status !== 'SUCCESS') {
    throw new Error(response.error || 'Google sign-in failed')
  }
  return response.data as unknown as NativeAuthResult
}

// Native Email Sign-In
export async function nativeSignInEmail(email: string, password: string): Promise<NativeAuthResult> {
  const response = await sendToNative('SIGN_IN_EMAIL', { email, password })
  if (response.status !== 'SUCCESS') {
    throw new Error(response.error || 'Email sign-in failed')
  }
  return response.data as unknown as NativeAuthResult
}

// Native Email Sign-Up
export async function nativeSignUpEmail(email: string, password: string): Promise<NativeAuthResult> {
  const response = await sendToNative('SIGN_UP_EMAIL', { email, password })
  if (response.status !== 'SUCCESS') {
    throw new Error(response.error || 'Email sign-up failed')
  }
  return response.data as unknown as NativeAuthResult
}

// Native Sign-Out
export async function nativeSignOut(): Promise<void> {
  const response = await sendToNative('SIGN_OUT')
  if (response.status !== 'SUCCESS') {
    throw new Error(response.error || 'Sign-out failed')
  }
}
