'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from '@/lib/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore'

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: Timestamp
}

interface FeedbackPost {
  id: string
  userId: string
  userName: string
  title: string
  content: string
  category: 'feature' | 'bug' | 'improvement' | 'other'
  likes: string[] // userId array
  commentCount: number
  createdAt: Timestamp
  status?: 'pending' | 'reviewing' | 'planned' | 'completed'
}

const CATEGORIES = [
  { key: 'feature', label: '새 기능', color: 'bg-blue-100 text-blue-700' },
  { key: 'bug', label: '버그 신고', color: 'bg-red-100 text-red-700' },
  { key: 'improvement', label: '개선 요청', color: 'bg-green-100 text-green-700' },
  { key: 'other', label: '기타', color: 'bg-gray-100 text-gray-700' },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: '검토 대기', color: 'bg-gray-100 text-gray-600' },
  reviewing: { label: '검토 중', color: 'bg-yellow-100 text-yellow-700' },
  planned: { label: '예정됨', color: 'bg-blue-100 text-blue-700' },
  completed: { label: '완료', color: 'bg-green-100 text-green-700' },
}

export default function FeedbackPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [posts, setPosts] = useState<FeedbackPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showWriteModal, setShowWriteModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<FeedbackPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [filter, setFilter] = useState<'all' | 'feature' | 'bug' | 'improvement' | 'other'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')

  // 새 글 작성 상태
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState<'feature' | 'bug' | 'improvement' | 'other'>('feature')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 게시글 목록 불러오기 (로그인한 경우에만)
  useEffect(() => {
    if (!user) {
      setPosts([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'feedback'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedbackPosts: FeedbackPost[] = []
      snapshot.forEach((doc) => {
        feedbackPosts.push({ id: doc.id, ...doc.data() } as FeedbackPost)
      })
      setPosts(feedbackPosts)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching feedback:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  // 댓글 불러오기
  useEffect(() => {
    if (!selectedPost) return

    const q = query(
      collection(db, 'feedback', selectedPost.id, 'comments'),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postComments: Comment[] = []
      snapshot.forEach((doc) => {
        postComments.push({ id: doc.id, ...doc.data() } as Comment)
      })
      setComments(postComments)
    })

    return () => unsubscribe()
  }, [selectedPost])

  // 글 작성
  const handleSubmitPost = async () => {
    if (!user || !newTitle.trim() || !newContent.trim()) return

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        likes: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
        status: 'pending'
      })

      setNewTitle('')
      setNewContent('')
      setNewCategory('feature')
      setShowWriteModal(false)
    } catch (error) {
      console.error('Error creating post:', error)
      alert('글 작성에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 좋아요 토글
  const [likingPostId, setLikingPostId] = useState<string | null>(null)

  const handleLike = async (post: FeedbackPost, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      router.push('/login?redirect=/feedback')
      return
    }
    if (likingPostId) return // 중복 클릭 방지

    setLikingPostId(post.id)
    const postRef = doc(db, 'feedback', post.id)
    const isLiked = post.likes.includes(user.uid)

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: post.likes.filter(id => id !== user.uid)
        })
      } else {
        await updateDoc(postRef, {
          likes: [...post.likes, user.uid]
        })
      }
    } catch (error) {
      console.error('Error updating like:', error)
    } finally {
      setLikingPostId(null)
    }
  }

  // 댓글 작성
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const handleSubmitComment = async () => {
    if (!user || !selectedPost || !newComment.trim() || isSubmittingComment) return

    setIsSubmittingComment(true)
    const commentContent = newComment.trim()
    setNewComment('') // 즉시 입력창 비우기

    try {
      await addDoc(collection(db, 'feedback', selectedPost.id, 'comments'), {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        content: commentContent,
        createdAt: serverTimestamp()
      })

      // 댓글 수 업데이트
      const postRef = doc(db, 'feedback', selectedPost.id)
      await updateDoc(postRef, {
        commentCount: (selectedPost.commentCount || 0) + 1
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      setNewComment(commentContent) // 에러 시 복구
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if (!selectedPost) return

    try {
      await deleteDoc(doc(db, 'feedback', selectedPost.id, 'comments', commentId))

      // 댓글 수 업데이트
      const postRef = doc(db, 'feedback', selectedPost.id)
      await updateDoc(postRef, {
        commentCount: Math.max(0, (selectedPost.commentCount || 0) - 1)
      })
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!selectedPost || !user || selectedPost.userId !== user.uid) return

    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await deleteDoc(doc(db, 'feedback', selectedPost.id))
      setShowDetailModal(false)
      setSelectedPost(null)
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const openDetail = (post: FeedbackPost) => {
    setSelectedPost(post)
    setShowDetailModal(true)
  }

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate()
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  // 필터링 및 정렬
  const filteredPosts = posts
    .filter(post => filter === 'all' || post.category === filter)
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.likes?.length || 0) - (a.likes?.length || 0)
      }
      return 0 // already sorted by createdAt desc
    })

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.key === category) || CATEGORIES[3]
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-[#faf9f7] border-b border-[#f0f0f0]">
        <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />
        <div className="px-6 py-4 flex items-center justify-between">
          <Link href="/my" className="p-2 -ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-medium">기능 요청</h1>
          <button
            onClick={() => {
              if (!user) {
                router.push('/login?redirect=/feedback')
              } else {
                setShowWriteModal(true)
              }
            }}
            className="p-2 -mr-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 pb-3 flex gap-2 overflow-x-auto">
          {[{ key: 'all', label: '전체' }, ...CATEGORIES].map(cat => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key as any)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                filter === cat.key
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white border border-[#e5e5e5]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: 'calc(env(safe-area-inset-top, 0px) + 110px)' }} />

      {/* Sort */}
      <div className="px-6 py-2 flex justify-end">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="text-xs text-[#8a8a8a] bg-transparent"
        >
          <option value="recent">최신순</option>
          <option value="popular">인기순</option>
        </select>
      </div>

      {/* Posts List */}
      <div className="px-6 pb-8 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#c5c5c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-[#8a8a8a] mb-4">아직 요청이 없어요</p>
            <button
              onClick={() => user ? setShowWriteModal(true) : router.push('/login?redirect=/feedback')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-full text-sm"
            >
              첫 번째 요청 작성하기
            </button>
          </div>
        ) : (
          filteredPosts.map(post => {
            const categoryInfo = getCategoryInfo(post.category)
            const isLiked = user && post.likes?.includes(user.uid)
            return (
              <div
                key={post.id}
                onClick={() => openDetail(post)}
                className="bg-white rounded-2xl p-4 border border-[#f0f0f0] cursor-pointer active:bg-[#f5f5f5] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                      {post.status && post.status !== 'pending' && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_LABELS[post.status].color}`}>
                          {STATUS_LABELS[post.status].label}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-sm mb-1 truncate">{post.title}</h3>
                    <p className="text-xs text-[#8a8a8a] line-clamp-2">{post.content}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f5f5f5]">
                  <div className="flex items-center gap-3 text-xs text-[#8a8a8a]">
                    <button
                      onClick={(e) => handleLike(post, e)}
                      className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : ''}`}
                    >
                      <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.likes?.length || 0}
                    </button>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.commentCount || 0}
                    </span>
                  </div>
                  <span className="text-xs text-[#c5c5c5]">
                    {post.userName} - {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Write Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom, 0px) + 16px))' }}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
              <button onClick={() => setShowWriteModal(false)} className="text-[#8a8a8a]">
                취소
              </button>
              <h2 className="font-medium">기능 요청</h2>
              <button
                onClick={handleSubmitPost}
                disabled={!newTitle.trim() || !newContent.trim() || isSubmitting}
                className="text-[#1a1a1a] font-medium disabled:text-[#c5c5c5]"
              >
                {isSubmitting ? '...' : '등록'}
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Category */}
              <div>
                <label className="text-xs text-[#8a8a8a] mb-2 block">카테고리</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setNewCategory(cat.key as any)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        newCategory === cat.key
                          ? 'bg-[#1a1a1a] text-white'
                          : 'bg-[#f5f5f5] text-[#666]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs text-[#8a8a8a] mb-2 block">제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="어떤 기능이 필요하신가요?"
                  className="w-full px-4 py-3 bg-[#f5f5f5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10"
                  maxLength={100}
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-xs text-[#8a8a8a] mb-2 block">상세 내용</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="구체적으로 설명해주세요"
                  rows={6}
                  className="w-full px-4 py-3 bg-[#f5f5f5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-[#c5c5c5] text-right mt-1">{newContent.length}/1000</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPost && (
        <div className="fixed inset-0 z-50 bg-[#faf9f7] flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-[#f0f0f0] px-4 py-3 pt-safe flex items-center justify-between">
            <button onClick={() => setShowDetailModal(false)} className="p-2 -ml-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="font-medium">상세 보기</h2>
            {user && selectedPost.userId === user.uid && (
              <button onClick={handleDeletePost} className="p-2 -mr-2 text-red-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            {!(user && selectedPost.userId === user.uid) && <div className="w-9" />}
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="bg-white p-6 border-b border-[#f0f0f0]">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getCategoryInfo(selectedPost.category).color}`}>
                  {getCategoryInfo(selectedPost.category).label}
                </span>
                {selectedPost.status && selectedPost.status !== 'pending' && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_LABELS[selectedPost.status].color}`}>
                    {STATUS_LABELS[selectedPost.status].label}
                  </span>
                )}
              </div>
              <h1 className="text-lg font-medium mb-2">{selectedPost.title}</h1>
              <p className="text-sm text-[#666] whitespace-pre-wrap">{selectedPost.content}</p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f0f0f0]">
                <div className="flex items-center gap-3 text-sm">
                  <button
                    onClick={(e) => handleLike(selectedPost, e)}
                    className={`flex items-center gap-1 ${user && selectedPost.likes?.includes(user.uid) ? 'text-red-500' : 'text-[#8a8a8a]'}`}
                  >
                    <svg className="w-5 h-5" fill={user && selectedPost.likes?.includes(user.uid) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{selectedPost.likes?.length || 0}</span>
                  </button>
                </div>
                <span className="text-xs text-[#c5c5c5]">
                  {selectedPost.userName} - {formatDate(selectedPost.createdAt)}
                </span>
              </div>
            </div>

            {/* Comments */}
            <div className="p-6">
              <h3 className="text-sm font-medium mb-4">댓글 {comments.length}</h3>
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-white rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-[10px]">
                          {comment.userName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-medium">{comment.userName}</span>
                        <span className="text-[10px] text-[#c5c5c5]">{formatDate(comment.createdAt)}</span>
                      </div>
                      {user && comment.userId === user.uid && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-[#c5c5c5] hover:text-red-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-[#666]">{comment.content}</p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="text-center text-sm text-[#c5c5c5] py-4">
                    아직 댓글이 없어요
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Comment Input */}
          <div className="bg-white border-t border-[#f0f0f0] px-4 py-3 pb-safe">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                placeholder={user ? '댓글을 입력하세요' : '로그인 후 댓글을 작성할 수 있어요'}
                className="flex-1 px-4 py-2.5 bg-[#f5f5f5] rounded-full text-sm focus:outline-none"
                disabled={!user}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!user || !newComment.trim() || isSubmittingComment}
                className="p-2.5 bg-[#1a1a1a] text-white rounded-full disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
