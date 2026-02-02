import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User
} from 'firebase/auth'

// Optimistic Auth State: localStorage 캐시 키
const AUTH_CACHE_KEY = 'enpeak_auth_user'

// 캐시할 사용자 정보 (민감 정보 제외)
interface CachedUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  cachedAt: number
}

// 캐시 유효 시간: 7일 (Firebase Auth 세션 기본 유효 기간)
const CACHE_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000

/**
 * localStorage에서 캐시된 사용자 정보 읽기
 * Firebase 초기화 전에 호출 가능 - 즉각적인 UI 렌더링용
 */
export function getCachedUser(): CachedUser | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(AUTH_CACHE_KEY)
    if (!cached) return null

    const user: CachedUser = JSON.parse(cached)

    // 캐시 만료 체크
    if (Date.now() - user.cachedAt > CACHE_VALIDITY_MS) {
      localStorage.removeItem(AUTH_CACHE_KEY)
      return null
    }

    return user
  } catch {
    return null
  }
}

/**
 * 사용자 정보를 localStorage에 캐시
 */
export function cacheUser(user: User | null): void {
  if (typeof window === 'undefined') return

  if (user) {
    const cached: CachedUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      cachedAt: Date.now()
    }
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cached))
  } else {
    localStorage.removeItem(AUTH_CACHE_KEY)
  }
}

/**
 * 캐시 무효화 (로그아웃 시)
 */
export function clearUserCache(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_CACHE_KEY)
}
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
// enpeak-users 데이터베이스 사용 (Firestore Native 모드)
const db = getFirestore(app, 'enpeak-users')

// Auth persistence 설정 (localStorage 사용 - 더 안정적)
// IndexedDB는 서비스 워커 업데이트 시 영향받을 수 있음
// localStorage는 캐시 삭제와 독립적으로 유지됨
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .then(() => console.log('Auth persistence set to localStorage'))
    .catch(console.error)
}

// Providers
const googleProvider = new GoogleAuthProvider()

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const logOut = async () => {
  try {
    // 캐시 먼저 삭제 (즉각적인 UI 반응)
    clearUserCache()
    await signOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export { auth, db, onAuthStateChanged, doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, orderBy, onSnapshot, addDoc, deleteDoc }
export type { User, CachedUser }
