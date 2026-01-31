'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { auth, onAuthStateChanged, User } from '@/lib/firebase'
import {
  setCurrentUserId,
  migrateLocalDataToFirebase,
  syncDataFromFirebase
} from '@/lib/userDataSync'

// 빌드 타임스탬프 (청크 해시 변경용)
const _buildTimestamp = process.env.BUILD_TIMESTAMP || ''

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const previousUserRef = useRef<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const previousUser = previousUserRef.current

      // 사용자 ID 설정 (동기화용)
      setCurrentUserId(currentUser?.uid || null)

      // 로그인 감지 (이전에 null이었고 현재 사용자가 있으면)
      if (!previousUser && currentUser) {
        // 로컬 데이터를 Firebase로 마이그레이션
        await migrateLocalDataToFirebase(currentUser.uid)
        // Firebase 데이터를 로컬로 동기화
        await syncDataFromFirebase(currentUser.uid)
      }

      previousUserRef.current = currentUser
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
