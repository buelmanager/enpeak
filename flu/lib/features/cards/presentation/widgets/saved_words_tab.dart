import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/core/widgets/minimal_card.dart';

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

class SavedWordData {
  final String word;
  final String meaning;
  final String? pronunciation;
  final String? example;
  final String? level;
  final DateTime savedAt;
  final int mastery; // 0-5
  final int reviewCount;
  final int correctCount;
  final DateTime? lastReviewedAt;
  final DateTime? nextReviewAt;

  const SavedWordData({
    required this.word,
    required this.meaning,
    this.pronunciation,
    this.example,
    this.level,
    required this.savedAt,
    this.mastery = 0,
    this.reviewCount = 0,
    this.correctCount = 0,
    this.lastReviewedAt,
    this.nextReviewAt,
  });

  bool get needsReview =>
      nextReviewAt != null && nextReviewAt!.isBefore(DateTime.now());

  bool get isMastered => mastery >= 4;
}

// ---------------------------------------------------------------------------
// Main widget
// ---------------------------------------------------------------------------

class SavedWordsTab extends StatefulWidget {
  final List<SavedWordData> savedWords;
  final List<SavedWordData> savedSentences;
  final VoidCallback? onStartQuiz;
  final ValueChanged<SavedWordData> onDeleteWord;
  final ValueChanged<SavedWordData> onSpeak;
  final String activeFilter;
  final String activeSort;
  final ValueChanged<String> onFilterChanged;
  final ValueChanged<String> onSortChanged;

  const SavedWordsTab({
    super.key,
    required this.savedWords,
    required this.savedSentences,
    this.onStartQuiz,
    required this.onDeleteWord,
    required this.onSpeak,
    this.activeFilter = 'all',
    this.activeSort = 'latest',
    required this.onFilterChanged,
    required this.onSortChanged,
  });

  @override
  State<SavedWordsTab> createState() => _SavedWordsTabState();
}

class _SavedWordsTabState extends State<SavedWordsTab> {
  int _tabIndex = 0; // 0 = words, 1 = sentences

  // ---- helpers ----

  List<SavedWordData> get _currentItems =>
      _tabIndex == 0 ? widget.savedWords : widget.savedSentences;

  List<SavedWordData> get _filteredItems {
    var items = List<SavedWordData>.from(_currentItems);

    // filter
    switch (widget.activeFilter) {
      case 'review':
        items = items.where((w) => w.needsReview).toList();
      case 'mastered':
        items = items.where((w) => w.isMastered).toList();
    }

    // sort
    switch (widget.activeSort) {
      case 'latest':
        items.sort((a, b) => b.savedAt.compareTo(a.savedAt));
      case 'mastery':
        items.sort((a, b) => b.mastery.compareTo(a.mastery));
      case 'alphabetical':
        items.sort((a, b) => a.word.compareTo(b.word));
    }

    return items;
  }

  _Stats get _stats {
    final items = _currentItems;
    final total = items.length;
    final review = items.where((w) => w.needsReview).length;
    final mastered = items.where((w) => w.isMastered).length;
    return _Stats(total: total, needsReview: review, mastered: mastered);
  }

  String _daysAgo(DateTime date) {
    final diff = DateTime.now().difference(date).inDays;
    if (diff == 0) return '오늘 복습';
    return '$diff일 전 복습';
  }

  // ---- build ----

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        CustomScrollView(
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.pagePadding,
                AppSpacing.xl,
                AppSpacing.pagePadding,
                120,
              ),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  _buildTabToggle(),
                  const SizedBox(height: AppSpacing.xl),
                  if (_currentItems.isEmpty)
                    _buildEmptyState()
                  else ...[
                    _buildStatsGrid(),
                    const SizedBox(height: AppSpacing.xl),
                    _buildFilterChips(),
                    const SizedBox(height: AppSpacing.md),
                    _buildSortChips(),
                    const SizedBox(height: AppSpacing.xl),
                    ..._buildItemList(),
                  ],
                ]),
              ),
            ),
          ],
        ),
        if (_currentItems.length >= 3) _buildStudyFab(),
      ],
    );
  }

  // ---- A. Tab toggle ----

  Widget _buildTabToggle() {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppColors.borderLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final tabWidth = constraints.maxWidth / 2;
          return SizedBox(
            height: 36,
            child: Stack(
              children: [
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeInOut,
                  left: tabWidth * _tabIndex,
                  top: 0,
                  bottom: 0,
                  width: tabWidth,
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x0D000000),
                          blurRadius: 4,
                          offset: Offset(0, 1),
                        ),
                      ],
                    ),
                  ),
                ),
                Row(children: [_tabButton(0, '내 단어장'), _tabButton(1, '내 문장')]),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _tabButton(int index, String label) {
    final isActive = _tabIndex == index;
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => setState(() => _tabIndex = index),
        child: Center(
          child: AnimatedDefaultTextStyle(
            duration: const Duration(milliseconds: 200),
            style: TextStyle(
              fontSize: 13,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
              color: isActive ? AppColors.textPrimary : AppColors.textSecondary,
            ),
            child: Text(label),
          ),
        ),
      ),
    );
  }

  // ---- B. Stats grid ----

  Widget _buildStatsGrid() {
    final stats = _stats;
    return Row(
      children: [
        Expanded(
          child: _StatCard(
            value: stats.total,
            label: '전체',
            dotColor: AppColors.primary,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _StatCard(
            value: stats.needsReview,
            label: '복습필요',
            dotColor: AppColors.warning,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _StatCard(
            value: stats.mastered,
            label: '마스터',
            dotColor: AppColors.success,
          ),
        ),
      ],
    );
  }

  // ---- C. Filter chips ----

  Widget _buildFilterChips() {
    const filters = [('all', '전체'), ('review', '복습필요'), ('mastered', '마스터')];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: filters.map((f) {
          final isActive = widget.activeFilter == f.$1;
          return Padding(
            padding: const EdgeInsets.only(right: 6),
            child: GestureDetector(
              onTap: () => widget.onFilterChanged(f.$1),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: isActive ? AppColors.primary : AppColors.inputBg,
                  borderRadius: AppSpacing.borderRadiusFull,
                ),
                child: Text(
                  f.$2,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: isActive ? Colors.white : AppColors.textSecondary,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ---- D. Sort chips ----

  Widget _buildSortChips() {
    const sorts = [
      ('latest', '최신순'),
      ('mastery', '숙련도'),
      ('alphabetical', 'ABC'),
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: sorts.map((s) {
          final isActive = widget.activeSort == s.$1;
          return Padding(
            padding: const EdgeInsets.only(right: 6),
            child: GestureDetector(
              onTap: () => widget.onSortChanged(s.$1),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: isActive ? Colors.transparent : Colors.transparent,
                  borderRadius: AppSpacing.borderRadiusFull,
                  border: isActive
                      ? Border.all(color: AppColors.primary)
                      : null,
                ),
                child: Text(
                  s.$2,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: isActive
                        ? AppColors.primary
                        : AppColors.textSecondary,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ---- E/F. Item list ----

  List<Widget> _buildItemList() {
    final items = _filteredItems;
    if (items.isEmpty) {
      return [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 40),
          child: Center(
            child: Text('해당하는 항목이 없습니다', style: AppTypography.bodySmall),
          ),
        ),
      ];
    }

    return items.map((item) {
      return _tabIndex == 0 ? _buildWordItem(item) : _buildSentenceItem(item);
    }).toList();
  }

  // Word card
  Widget _buildWordItem(SavedWordData item) {
    return Dismissible(
      key: ValueKey('word-${item.word}-${item.savedAt.millisecondsSinceEpoch}'),
      direction: DismissDirection.endToStart,
      background: _buildDismissBackground(),
      onDismissed: (_) => widget.onDeleteWord(item),
      child: MinimalCard(
        onTap: () => widget.onSpeak(item),
        padding: const EdgeInsets.all(16),
        margin: const EdgeInsets.only(bottom: 8),
        borderRadius: 12,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top row: word + level badge + speaker + delete
            Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Flexible(
                        child: Text(
                          item.word,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: AppColors.textPrimary,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (item.level != null) ...[
                        const SizedBox(width: 8),
                        _LevelBadge(level: item.level!),
                      ],
                      if (item.needsReview) ...[
                        const SizedBox(width: 6),
                        Container(
                          width: 7,
                          height: 7,
                          decoration: const BoxDecoration(
                            color: AppColors.warning,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () => widget.onSpeak(item),
                  child: const Padding(
                    padding: EdgeInsets.all(4),
                    child: Icon(
                      Icons.volume_up_outlined,
                      size: 18,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(width: 4),
                GestureDetector(
                  onTap: () => widget.onDeleteWord(item),
                  child: const Padding(
                    padding: EdgeInsets.all(4),
                    child: Icon(
                      Icons.delete_outline,
                      size: 18,
                      color: AppColors.textTertiary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            // Meaning
            Text(
              item.meaning,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            // Example
            if (item.example != null) ...[
              const SizedBox(height: 4),
              Text(
                item.example!,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textTertiary,
                  fontStyle: FontStyle.italic,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            const SizedBox(height: 8),
            // Mastery bar + last reviewed
            Row(
              children: [
                _MasteryBar(level: item.mastery),
                if (item.lastReviewedAt != null) ...[
                  const SizedBox(width: 12),
                  Text(
                    _daysAgo(item.lastReviewedAt!),
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  // Sentence card
  Widget _buildSentenceItem(SavedWordData item) {
    return Dismissible(
      key: ValueKey(
        'sentence-${item.word}-${item.savedAt.millisecondsSinceEpoch}',
      ),
      direction: DismissDirection.endToStart,
      background: _buildDismissBackground(),
      onDismissed: (_) => widget.onDeleteWord(item),
      child: MinimalCard(
        onTap: () => widget.onSpeak(item),
        padding: const EdgeInsets.all(16),
        margin: const EdgeInsets.only(bottom: 8),
        borderRadius: 12,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top row: speaker + delete
            Row(
              children: [
                if (item.needsReview) ...[
                  Container(
                    width: 7,
                    height: 7,
                    decoration: const BoxDecoration(
                      color: AppColors.warning,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                ],
                GestureDetector(
                  onTap: () => widget.onSpeak(item),
                  child: const Padding(
                    padding: EdgeInsets.all(4),
                    child: Icon(
                      Icons.volume_up_outlined,
                      size: 18,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () => widget.onDeleteWord(item),
                  child: const Padding(
                    padding: EdgeInsets.all(4),
                    child: Icon(
                      Icons.delete_outline,
                      size: 18,
                      color: AppColors.textTertiary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            // English sentence
            Text(
              item.word,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            // Korean translation
            Text(
              item.meaning,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 8),
            // Mastery bar + last reviewed
            Row(
              children: [
                _MasteryBar(level: item.mastery),
                if (item.lastReviewedAt != null) ...[
                  const SizedBox(width: 12),
                  Text(
                    _daysAgo(item.lastReviewedAt!),
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ---- G. Empty state ----

  Widget _buildEmptyState() {
    final isWords = _tabIndex == 0;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 64),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isWords ? Icons.menu_book_outlined : Icons.chat_bubble_outline,
            size: 48,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: 16),
          Text(
            isWords ? '저장된 단어가 없습니다' : '저장된 문장이 없습니다',
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            isWords ? '학습 중 단어를 저장해보세요' : '대화 중 유용한 문장을 저장해보세요',
            style: const TextStyle(fontSize: 12, color: AppColors.textTertiary),
          ),
        ],
      ),
    );
  }

  // ---- H. Floating study button ----

  Widget _buildStudyFab() {
    return Positioned(
      bottom: 24,
      left: 0,
      right: 0,
      child: Center(
        child: GestureDetector(
          onTap: widget.onStartQuiz,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(9999),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
                const BoxShadow(
                  color: Color(0x1A000000),
                  blurRadius: 8,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.play_arrow_rounded, size: 20, color: Colors.white),
                SizedBox(width: 6),
                Text(
                  '학습 시작',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ---- Dismiss background ----

  Widget _buildDismissBackground() {
    return Container(
      alignment: Alignment.centerRight,
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.only(right: 20),
      decoration: BoxDecoration(
        color: AppColors.error,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Icon(Icons.delete_outline, color: Colors.white, size: 22),
    );
  }
}

// ---------------------------------------------------------------------------
// Private sub-widgets
// ---------------------------------------------------------------------------

class _Stats {
  final int total;
  final int needsReview;
  final int mastered;
  const _Stats({
    required this.total,
    required this.needsReview,
    required this.mastered,
  });
}

class _StatCard extends StatelessWidget {
  final int value;
  final String label;
  final Color dotColor;

  const _StatCard({
    required this.value,
    required this.label,
    required this.dotColor,
  });

  @override
  Widget build(BuildContext context) {
    return MinimalCard(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      margin: EdgeInsets.zero,
      borderRadius: 12,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(
                  color: dotColor,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                '$value',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _MasteryBar extends StatelessWidget {
  final int level; // 0-5

  const _MasteryBar({required this.level});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        final isFilled = i < level;
        final opacity = isFilled ? (1.0 - i * 0.2).clamp(0.2, 1.0) : 1.0;
        return Padding(
          padding: EdgeInsets.only(right: i < 4 ? 2 : 0),
          child: Container(
            width: 12,
            height: 4,
            decoration: BoxDecoration(
              color: isFilled
                  ? AppColors.primary.withValues(alpha: opacity)
                  : const Color(0xFFF0F0F0),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        );
      }),
    );
  }
}

class _LevelBadge extends StatelessWidget {
  final String level;

  const _LevelBadge({required this.level});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.levelColor(level),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        level,
        style: const TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),
    );
  }
}
