import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';

class ActivityItem {
  final String type; // 'chat', 'vocabulary', 'roleplay', 'expression'
  final String description;
  final DateTime timestamp;
  final int? durationMinutes;

  const ActivityItem({
    required this.type,
    required this.description,
    required this.timestamp,
    this.durationMinutes,
  });
}

class RecentTimeline extends StatelessWidget {
  final List<ActivityItem> activities;

  const RecentTimeline({super.key, required this.activities});

  static Color _dotColor(String type) {
    switch (type) {
      case 'chat':
        return AppColors.primary;
      case 'vocabulary':
        return AppColors.success;
      case 'roleplay':
        return AppColors.warning;
      case 'expression':
        return AppColors.accentPurple;
      default:
        return AppColors.textTertiary;
    }
  }

  static String _formatTimeAgo(DateTime timestamp) {
    final now = DateTime.now();
    final diff = now.difference(timestamp);

    if (diff.inSeconds < 60) return '방금 전';
    if (diff.inMinutes < 60) return '${diff.inMinutes}분 전';
    if (diff.inHours < 24) return '${diff.inHours}시간 전';
    if (diff.inDays == 1) return '어제';
    if (diff.inDays < 7) return '${diff.inDays}일 전';
    if (diff.inDays < 30) return '${diff.inDays ~/ 7}주 전';
    if (diff.inDays < 365) return '${diff.inDays ~/ 30}개월 전';
    return '${diff.inDays ~/ 365}년 전';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('최근 활동', style: AppTypography.heading3),
          const SizedBox(height: 16),
          if (activities.isEmpty) _buildEmptyState() else _buildTimeline(),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 32),
      child: Center(
        child: Text(
          '아직 학습 기록이 없습니다',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            color: AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildTimeline() {
    final items = activities.take(10).toList();
    return Column(
      children: List.generate(items.length, (index) {
        final item = items[index];
        final isLast = index == items.length - 1;
        return _TimelineRow(
          item: item,
          isLast: isLast,
          dotColor: _dotColor(item.type),
          timeAgo: _formatTimeAgo(item.timestamp),
        );
      }),
    );
  }
}

class _TimelineRow extends StatelessWidget {
  final ActivityItem item;
  final bool isLast;
  final Color dotColor;
  final String timeAgo;

  const _TimelineRow({
    required this.item,
    required this.isLast,
    required this.dotColor,
    required this.timeAgo,
  });

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left: dot + line
          SizedBox(
            width: 20,
            child: Column(
              children: [
                const SizedBox(height: 5),
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: dotColor,
                    shape: BoxShape.circle,
                  ),
                ),
                if (!isLast)
                  Expanded(child: Container(width: 2, color: AppColors.border)),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Right: description + timestamp
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      item.description,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        color: AppColors.textPrimary,
                        height: 1.4,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    timeAgo,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
