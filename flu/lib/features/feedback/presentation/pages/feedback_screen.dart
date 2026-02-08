import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/features/feedback/presentation/providers/feedback_provider.dart';

const List<Map<String, dynamic>> _categories = [
  {'key': 'all', 'label': '전체'},
  {
    'key': 'feature',
    'label': '새 기능',
    'bgColor': AppColors.badgeBlueBg,
    'textColor': AppColors.badgeBlueText,
  },
  {
    'key': 'bug',
    'label': '버그 신고',
    'bgColor': AppColors.badgeRedBg,
    'textColor': AppColors.badgeRedText,
  },
  {
    'key': 'improvement',
    'label': '개선 요청',
    'bgColor': AppColors.badgeGreenBg,
    'textColor': AppColors.badgeGreenText,
  },
  {
    'key': 'other',
    'label': '기타',
    'bgColor': AppColors.inputBg,
    'textColor': AppColors.textSecondary,
  },
];

const List<Map<String, dynamic>> _writeCategories = [
  {'key': 'UI', 'label': 'UI'},
  {'key': 'feature', 'label': '기능'},
  {'key': 'content', 'label': '콘텐츠'},
  {'key': 'bug', 'label': '버그'},
  {'key': 'other', 'label': '기타'},
];

// Mock data model for posts
class _FeedbackPost {
  final String id;
  final String title;
  final String content;
  final String category;
  final int likes;
  final int commentCount;
  final String userName;
  final String timeAgo;
  final bool isLiked;
  final List<_Comment> comments;

  const _FeedbackPost({
    required this.id,
    required this.title,
    required this.content,
    required this.category,
    required this.likes,
    required this.commentCount,
    required this.userName,
    required this.timeAgo,
    this.isLiked = false,
    this.comments = const [],
  });

  _FeedbackPost copyWith({bool? isLiked, int? likes}) {
    return _FeedbackPost(
      id: id,
      title: title,
      content: content,
      category: category,
      likes: likes ?? this.likes,
      commentCount: commentCount,
      userName: userName,
      timeAgo: timeAgo,
      isLiked: isLiked ?? this.isLiked,
      comments: comments,
    );
  }
}

class _Comment {
  final String id;
  final String userName;
  final String content;
  final String timeAgo;

  const _Comment({
    required this.id,
    required this.userName,
    required this.content,
    required this.timeAgo,
  });
}

class FeedbackScreen extends ConsumerStatefulWidget {
  const FeedbackScreen({super.key});

  @override
  ConsumerState<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends ConsumerState<FeedbackScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _commentController = TextEditingController();

  String _selectedFilter = 'all';
  String _writeCategory = 'feature';
  bool _isLoading = true;

  // Mock data
  List<_FeedbackPost> _posts = [];

  @override
  void initState() {
    super.initState();
    _loadMockData();
  }

  void _loadMockData() {
    Future.delayed(const Duration(milliseconds: 800), () {
      if (!mounted) return;
      setState(() {
        _posts = const [
          _FeedbackPost(
            id: '1',
            title: '발음 평가 기능 추가',
            content: 'AI가 사용자의 발음을 평가하고 개선점을 제안해주는 기능이 있으면 좋겠습니다.',
            category: 'feature',
            likes: 12,
            commentCount: 3,
            userName: 'user123',
            timeAgo: '2시간 전',
            comments: [
              _Comment(
                id: 'c1',
                userName: 'hello',
                content: '저도 이 기능 필요해요!',
                timeAgo: '1시간 전',
              ),
              _Comment(
                id: 'c2',
                userName: 'eng_lover',
                content: '좋은 아이디어네요',
                timeAgo: '30분 전',
              ),
            ],
          ),
          _FeedbackPost(
            id: '2',
            title: '다크모드 지원',
            content: '밤에 사용할 때 눈이 아파요. 다크모드 테마를 추가해주세요.',
            category: 'improvement',
            likes: 8,
            commentCount: 1,
            userName: 'night_owl',
            timeAgo: '5시간 전',
          ),
          _FeedbackPost(
            id: '3',
            title: '롤플레이 시나리오 더 추가해주세요',
            content: '현재 시나리오가 너무 적어요. 병원, 은행, 면접 등 다양한 상황을 추가해주세요.',
            category: 'content',
            likes: 15,
            commentCount: 5,
            userName: 'learner',
            timeAgo: '1일 전',
          ),
        ];
        _isLoading = false;
      });
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(feedbackProvider);

    ref.listen<FeedbackState>(feedbackProvider, (prev, next) {
      if (next.submitSuccess && !(prev?.submitSuccess ?? false)) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('요청이 등록되었습니다!'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
        _titleController.clear();
        _descriptionController.clear();
        ref.read(feedbackProvider.notifier).resetSubmitSuccess();
      }
    });

    final filteredPosts = _selectedFilter == 'all'
        ? _posts
        : _posts.where((p) => p.category == _selectedFilter).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(
            Icons.arrow_back_rounded,
            color: AppColors.textPrimary,
            size: 22,
          ),
        ),
        title: Text(
          '기능 요청',
          style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w500),
        ),
        centerTitle: true,
        actions: const [SizedBox(width: 48)],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: SizedBox(
            height: 40,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 24),
              itemCount: _categories.length,
              separatorBuilder: (context, i) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final key = cat['key'] as String;
                final label = cat['label'] as String;
                final isSelected = _selectedFilter == key;
                return GestureDetector(
                  onTap: () => setState(() => _selectedFilter = key),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : AppColors.surface,
                      borderRadius: BorderRadius.circular(
                        AppSpacing.radiusFull,
                      ),
                      border: isSelected
                          ? null
                          : Border.all(color: AppColors.border),
                    ),
                    child: Text(
                      label,
                      style: AppTypography.caption.copyWith(
                        color: isSelected
                            ? AppColors.surface
                            : AppColors.textSecondary,
                        fontWeight: isSelected
                            ? FontWeight.w600
                            : FontWeight.w400,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ),
      floatingActionButton: SizedBox(
        width: 56,
        height: 56,
        child: FloatingActionButton(
          onPressed: () => _showWriteModal(context, state),
          backgroundColor: AppColors.primary,
          elevation: 2,
          shape: const CircleBorder(),
          child: const Icon(
            Icons.add_rounded,
            color: AppColors.surface,
            size: 28,
          ),
        ),
      ),
      body: _isLoading
          ? _buildShimmerList()
          : filteredPosts.isEmpty
          ? _buildEmptyState()
          : ListView.separated(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 96),
              itemCount: filteredPosts.length,
              separatorBuilder: (context, i) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                return _buildPostCard(filteredPosts[index]);
              },
            ),
    );
  }

  // ── Shimmer loading ──

  Widget _buildShimmerList() {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
      itemCount: 4,
      separatorBuilder: (context, i) => const SizedBox(height: 12),
      itemBuilder: (context, i) => _buildShimmerCard(),
    );
  }

  Widget _buildShimmerCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Category badge shimmer
          Container(
            width: 60,
            height: 18,
            decoration: BoxDecoration(
              color: AppColors.shimmerBase,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(height: 10),
          // Title shimmer
          Container(
            width: double.infinity,
            height: 16,
            decoration: BoxDecoration(
              color: AppColors.shimmerBase,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(height: 8),
          // Description shimmer
          Container(
            width: MediaQuery.of(context).size.width * 0.6,
            height: 14,
            decoration: BoxDecoration(
              color: AppColors.shimmerHighlight,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(height: 14),
          // Bottom row shimmer
          Row(
            children: [
              Container(
                width: 40,
                height: 14,
                decoration: BoxDecoration(
                  color: AppColors.shimmerHighlight,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(width: 16),
              Container(
                width: 40,
                height: 14,
                decoration: BoxDecoration(
                  color: AppColors.shimmerHighlight,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Empty state ──

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.inputBg,
              borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
            ),
            alignment: Alignment.center,
            child: const Icon(
              Icons.chat_bubble_outline_rounded,
              size: 32,
              color: AppColors.textTertiary,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            '아직 요청이 없습니다.\n첫 번째 기능을 요청해보세요!',
            textAlign: TextAlign.center,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  // ── Post card ──

  Widget _buildPostCard(_FeedbackPost post) {
    final catInfo = _getCategoryInfo(post.category);

    return GestureDetector(
      onTap: () => _showDetailModal(context, post),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Category badge
            if (catInfo != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: catInfo['bgColor'] as Color,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  catInfo['label'] as String,
                  style: AppTypography.badge.copyWith(
                    color: catInfo['textColor'] as Color,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            const SizedBox(height: 10),

            // Title
            Text(
              post.title,
              style: AppTypography.bodyMedium.copyWith(fontSize: 15),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),

            // Description
            Text(
              post.content,
              style: AppTypography.bodySmall,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 14),

            // Bottom row: votes, comments, timestamp
            Container(
              padding: const EdgeInsets.only(top: 12),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppColors.borderLight)),
              ),
              child: Row(
                children: [
                  // Vote button
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        final idx = _posts.indexWhere((p) => p.id == post.id);
                        if (idx != -1) {
                          _posts[idx] = _posts[idx].copyWith(
                            isLiked: !_posts[idx].isLiked,
                            likes: _posts[idx].isLiked
                                ? _posts[idx].likes - 1
                                : _posts[idx].likes + 1,
                          );
                        }
                      });
                    },
                    child: Row(
                      children: [
                        Icon(
                          post.isLiked
                              ? Icons.favorite_rounded
                              : Icons.favorite_border_rounded,
                          size: 16,
                          color: post.isLiked
                              ? AppColors.error
                              : AppColors.textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${post.likes}',
                          style: AppTypography.caption.copyWith(
                            color: post.isLiked
                                ? AppColors.error
                                : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),

                  // Comment count
                  Row(
                    children: [
                      const Icon(
                        Icons.chat_bubble_outline_rounded,
                        size: 16,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${post.commentCount}',
                        style: AppTypography.caption,
                      ),
                    ],
                  ),

                  const Spacer(),

                  // Timestamp
                  Text(
                    '${post.userName} - ${post.timeAgo}',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textTertiary,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Write modal (bottom sheet) ──

  void _showWriteModal(BuildContext context, FeedbackState state) {
    _titleController.clear();
    _descriptionController.clear();
    setState(() => _writeCategory = 'feature');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Container(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(ctx).size.height * 0.9,
              ),
              decoration: const BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Padding(
                padding: EdgeInsets.only(
                  bottom: MediaQuery.of(ctx).viewInsets.bottom,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Drag handle
                    Container(
                      width: 36,
                      height: 4,
                      margin: const EdgeInsets.only(top: 12),
                      decoration: BoxDecoration(
                        color: AppColors.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),

                    // Header
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          GestureDetector(
                            onTap: () => Navigator.pop(ctx),
                            child: Text(
                              '취소',
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ),
                          Text(
                            '기능 요청',
                            style: AppTypography.bodyMedium.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(width: 28),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Form content
                    Flexible(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Category
                            Text(
                              '카테고리',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: _writeCategories.map((cat) {
                                final key = cat['key'] as String;
                                final label = cat['label'] as String;
                                final isSelected = _writeCategory == key;
                                return GestureDetector(
                                  onTap: () {
                                    setModalState(() => _writeCategory = key);
                                  },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 14,
                                      vertical: 8,
                                    ),
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? AppColors.primary
                                          : AppColors.inputBg,
                                      borderRadius: BorderRadius.circular(
                                        AppSpacing.radiusFull,
                                      ),
                                    ),
                                    child: Text(
                                      label,
                                      style: AppTypography.caption.copyWith(
                                        color: isSelected
                                            ? AppColors.surface
                                            : AppColors.textSecondary,
                                        fontWeight: isSelected
                                            ? FontWeight.w600
                                            : FontWeight.w400,
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 20),

                            // Title
                            Text(
                              '제목',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _titleController,
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.textPrimary,
                              ),
                              maxLength: 100,
                              decoration: InputDecoration(
                                hintText: '어떤 기능이 필요하신가요?',
                                hintStyle: AppTypography.bodySmall.copyWith(
                                  color: AppColors.textSecondary.withValues(
                                    alpha: 0.5,
                                  ),
                                ),
                                filled: true,
                                fillColor: AppColors.inputBg,
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(
                                    AppSpacing.radiusXl,
                                  ),
                                  borderSide: BorderSide.none,
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(
                                    AppSpacing.radiusXl,
                                  ),
                                  borderSide: BorderSide.none,
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(
                                    AppSpacing.radiusXl,
                                  ),
                                  borderSide: const BorderSide(
                                    color: AppColors.primary,
                                    width: 1.5,
                                  ),
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 14,
                                ),
                                counterText: '',
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Description
                            Text(
                              '상세 내용',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _descriptionController,
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.textPrimary,
                              ),
                              maxLines: 4,
                              maxLength: 1000,
                              decoration: InputDecoration(
                                hintText: '구체적으로 설명해주세요',
                                hintStyle: AppTypography.bodySmall.copyWith(
                                  color: AppColors.textSecondary.withValues(
                                    alpha: 0.5,
                                  ),
                                ),
                                filled: true,
                                fillColor: AppColors.inputBg,
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(
                                    AppSpacing.radiusXl,
                                  ),
                                  borderSide: BorderSide.none,
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(
                                    AppSpacing.radiusXl,
                                  ),
                                  borderSide: BorderSide.none,
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(
                                    AppSpacing.radiusXl,
                                  ),
                                  borderSide: const BorderSide(
                                    color: AppColors.primary,
                                    width: 1.5,
                                  ),
                                ),
                                contentPadding: const EdgeInsets.all(16),
                                counterStyle: AppTypography.caption.copyWith(
                                  color: AppColors.textTertiary,
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),

                            // Submit button
                            SizedBox(
                              width: double.infinity,
                              height: 52,
                              child: ElevatedButton(
                                onPressed: () {
                                  if (_titleController.text.trim().isEmpty ||
                                      _descriptionController.text
                                          .trim()
                                          .isEmpty) {
                                    return;
                                  }
                                  ref
                                      .read(feedbackProvider.notifier)
                                      .submitFeatureRequest(
                                        _titleController.text,
                                        _descriptionController.text,
                                      );
                                  Navigator.pop(ctx);
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary,
                                  foregroundColor: AppColors.surface,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(
                                      AppSpacing.radiusXl,
                                    ),
                                  ),
                                  elevation: 0,
                                ),
                                child: Text(
                                  '등록',
                                  style: AppTypography.button.copyWith(
                                    color: AppColors.surface,
                                  ),
                                ),
                              ),
                            ),
                            SizedBox(
                              height: MediaQuery.of(ctx).padding.bottom + 16,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  // ── Detail modal (full screen) ──

  void _showDetailModal(BuildContext context, _FeedbackPost post) {
    _commentController.clear();
    final catInfo = _getCategoryInfo(post.category);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          height: MediaQuery.of(ctx).size.height * 0.92,
          decoration: const BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                decoration: const BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  border: Border(
                    bottom: BorderSide(color: AppColors.borderLight),
                  ),
                ),
                child: Column(
                  children: [
                    // Drag handle
                    Container(
                      width: 36,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: AppColors.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () => Navigator.pop(ctx),
                          child: const Icon(
                            Icons.arrow_back_rounded,
                            size: 22,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const Expanded(
                          child: Center(
                            child: Text(
                              '상세 보기',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 22),
                      ],
                    ),
                  ],
                ),
              ),

              // Content
              Expanded(
                child: ListView(
                  padding: EdgeInsets.zero,
                  children: [
                    // Post content
                    Container(
                      padding: const EdgeInsets.all(24),
                      color: AppColors.surface,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (catInfo != null)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 3,
                              ),
                              margin: const EdgeInsets.only(bottom: 12),
                              decoration: BoxDecoration(
                                color: catInfo['bgColor'] as Color,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                catInfo['label'] as String,
                                style: AppTypography.badge.copyWith(
                                  color: catInfo['textColor'] as Color,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          Text(
                            post.title,
                            style: AppTypography.heading3.copyWith(
                              fontSize: 18,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            post.content,
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textLink,
                              height: 1.6,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.only(top: 16),
                            decoration: const BoxDecoration(
                              border: Border(
                                top: BorderSide(color: AppColors.borderLight),
                              ),
                            ),
                            child: Row(
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      post.isLiked
                                          ? Icons.favorite_rounded
                                          : Icons.favorite_border_rounded,
                                      size: 20,
                                      color: post.isLiked
                                          ? AppColors.error
                                          : AppColors.textSecondary,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${post.likes}',
                                      style: AppTypography.bodySmall,
                                    ),
                                  ],
                                ),
                                const Spacer(),
                                Text(
                                  '${post.userName} - ${post.timeAgo}',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.textTertiary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Comments section
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '댓글 ${post.comments.length}',
                            style: AppTypography.label,
                          ),
                          const SizedBox(height: 16),
                          if (post.comments.isEmpty)
                            Center(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 24,
                                ),
                                child: Text(
                                  '아직 댓글이 없어요',
                                  style: AppTypography.bodySmall.copyWith(
                                    color: AppColors.textTertiary,
                                  ),
                                ),
                              ),
                            )
                          else
                            ...post.comments.map((comment) {
                              return Container(
                                padding: const EdgeInsets.all(16),
                                margin: const EdgeInsets.only(bottom: 12),
                                decoration: BoxDecoration(
                                  color: AppColors.surface,
                                  borderRadius: BorderRadius.circular(
                                    AppSpacing.radiusXl,
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          width: 24,
                                          height: 24,
                                          decoration: const BoxDecoration(
                                            color: AppColors.primary,
                                            shape: BoxShape.circle,
                                          ),
                                          alignment: Alignment.center,
                                          child: Text(
                                            comment.userName
                                                .substring(0, 1)
                                                .toUpperCase(),
                                            style: AppTypography.badge.copyWith(
                                              color: AppColors.surface,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          comment.userName,
                                          style: AppTypography.caption.copyWith(
                                            fontWeight: FontWeight.w500,
                                            color: AppColors.textPrimary,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          comment.timeAgo,
                                          style: AppTypography.badge.copyWith(
                                            color: AppColors.textTertiary,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      comment.content,
                                      style: AppTypography.bodySmall.copyWith(
                                        color: AppColors.textLink,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Comment input bar
              Container(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                decoration: const BoxDecoration(
                  color: AppColors.surface,
                  border: Border(top: BorderSide(color: AppColors.borderLight)),
                ),
                child: SafeArea(
                  top: false,
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _commentController,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textPrimary,
                          ),
                          textInputAction: TextInputAction.send,
                          decoration: InputDecoration(
                            hintText: '댓글을 입력하세요',
                            hintStyle: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary.withValues(
                                alpha: 0.5,
                              ),
                            ),
                            filled: true,
                            fillColor: AppColors.inputBg,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(
                                AppSpacing.radiusFull,
                              ),
                              borderSide: BorderSide.none,
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(
                                AppSpacing.radiusFull,
                              ),
                              borderSide: BorderSide.none,
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(
                                AppSpacing.radiusFull,
                              ),
                              borderSide: BorderSide.none,
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 10,
                            ),
                            isDense: true,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      SizedBox(
                        width: 40,
                        height: 40,
                        child: IconButton(
                          onPressed: () {
                            // Submit comment
                            _commentController.clear();
                          },
                          style: IconButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            shape: const CircleBorder(),
                          ),
                          icon: const Icon(
                            Icons.arrow_forward_rounded,
                            color: AppColors.surface,
                            size: 20,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Map<String, dynamic>? _getCategoryInfo(String category) {
    return _categories.where((c) => c['key'] == category).firstOrNull;
  }
}
