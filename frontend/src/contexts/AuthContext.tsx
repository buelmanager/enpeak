'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { auth, onAuthStateChanged, User, getCachedUser, cacheUser, CachedUser } from '@/lib/firebase'
import {
  setCurrentUserId,
  migrateLocalDataToFirebase,
  syncDataFromFirebase
} from '@/lib/userDataSync'

// 빌드 타임스탬프 (청크 해시 변경용)
const _buildTimestamp = process.env.BUILD_TIMESTAMP || ''

interface AuthContextType {
  user: User | null
  cachedUser: CachedUser | null  // 캐시된 사용자 정보 (즉시 사용 가능)
  loading: boolean
  syncing: boolean  // 동기화 중 여부 (선택적 UI 표시용)
  isVerified: boolean  // Firebase로 검증 완료 여부
  isReady: boolean  // 인증 상태가 완전히 확정됨 (앱 표시 가능)
  isAuthenticated: boolean  // 로그인 여부 (user 또는 cachedUser 있음)
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  cachedUser: null,
  loading: true,
  syncing: false,
  isVerified: false,
  isReady: false,
  isAuthenticated: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  // Optimistic Auth: 캐시에서 먼저 읽기
  // 주의: SSR에서는 null, 클라이언트에서 hydration 후 값이 있을 수 있음
  const [cachedUser, setCachedUser] = useState<CachedUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const previousUserRef = useRef<User | null>(null)
  const syncInProgressRef = useRef(false)
  const initializedRef = useRef(false)

  // 인증 여부 계산
  const isAuthenticated = !!(user || cachedUser)

  // 클라이언트에서 즉시 캐시 읽기 (hydration 후)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      const cached = getCachedUser()
      if (cached) {
        setCachedUser(cached)
        setLoading(false)  // 캐시가 있으면 즉시 로딩 완료
      }
      // 캐시 체크 완료 후 isReady 설정 (Firebase 검증과 별개로)
      // Firebase 검증은 백그라운드에서 계속 진행
    }
  }, [])

  useEffect(() => {
    // Firebase 초기화 실패 시 타임아웃으로 isReady 설정 (3초)
    const readyTimeout = setTimeout(() => {
      if (!isReady) {
        console.warn('Firebase auth timeout - setting isReady=true')
        setLoading(false)
        setIsReady(true)
      }
    }, 3000)

    let unsubscribe: (() => void) | undefined
    try {
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        clearTimeout(readyTimeout)
        const previousUser = previousUserRef.current
        const isNewLogin = !previousUser && currentUser

        // 사용자 ID 설정 (동기화용)
        setCurrentUserId(currentUser?.uid || null)

        // 로그인 상태 즉시 반영 (블로킹 없이!)
        previousUserRef.current = currentUser
        setUser(currentUser)
        setLoading(false)
        setIsVerified(true)
        setIsReady(true)  // Firebase 검증 완료 = 앱 표시 가능

        // localStorage 캐시 업데이트
        cacheUser(currentUser)
        // cachedUser 상태도 업데이트 (로그아웃 시 null로)
        setCachedUser(currentUser ? {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          cachedAt: Date.now()
        } : null)

        // 동기화는 백그라운드에서 실행 (UI 블로킹 X)
        if (isNewLogin && !syncInProgressRef.current) {
          syncInProgressRef.current = true
          setSyncing(true)

          // 비동기 동기화 - await 없이 실행
          Promise.resolve()
            .then(() => migrateLocalDataToFirebase(currentUser.uid))
            .then(() => syncDataFromFirebase(currentUser.uid))
            .catch((error) => console.error('Background sync failed:', error))
            .finally(() => {
              syncInProgressRef.current = false
              setSyncing(false)
            })
        }
      })
    } catch (error) {
      // Firebase 초기화 실패 시에도 앱이 동작하도록
      console.error('Firebase auth initialization failed:', error)
      clearTimeout(readyTimeout)
      setLoading(false)
      setIsReady(true)
    }

    return () => {
      clearTimeout(readyTimeout)
      unsubscribe?.()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, cachedUser, loading, syncing, isVerified, isReady, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
