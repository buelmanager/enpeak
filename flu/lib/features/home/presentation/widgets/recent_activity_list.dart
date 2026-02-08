import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/core/widgets/minimal_card.dart';
import 'package:flu/core/widgets/section_header.dart';
import '../providers/home_provider.dart';

class RecentActivityList extends StatelessWidget {
  final List<LearningRecord> records;

  const RecentActivityList({super.key, required this.records});

  @override
  Widget build(BuildContext context) {
    return MinimalCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            label: '\ucd5c\uadfc \ud65c\ub3d9',
            trailing: records.isNotEmpty
                ? Text('${records.length}\uac74', style: AppTypography.caption)
                : null,
          ),
          if (records.isEmpty)
            _buildEmptyState()
          else
            ...records.asMap().entries.map((entry) {
              final index = entry.key;
              final record = entry.value;
              return Column(
                children: [
                  if (index > 0)
                    const Divider(height: 1, color: AppColors.borderLight),
                  _buildRecordItem(record),
                ],
              );
            }),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 28),
        child: Column(
          children: [
            Icon(
              Icons.history_rounded,
              size: 36,
              color: AppColors.textSecondary.withValues(alpha: 0.4),
            ),
            const SizedBox(height: 10),
            Text(
              '\ub300\ud654\ub97c \uc2dc\uc791\ud558\uba74 \ud65c\ub3d9\uc774 \ud45c\uc2dc\ub429\ub2c8\ub2e4',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textSecondary.withValues(alpha: 0.8),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecordItem(LearningRecord record) {
    final iconData = _getIconForType(record.type);
    final iconColor = _getColorForType(record.type);
    final timeAgo = _formatTimeAgo(record.timestamp);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
            ),
            child: Icon(iconData, size: 16, color: iconColor),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  record.title,
                  style: AppTypography.bodyMedium14.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 1),
                Text(
                  timeAgo,
                  style: AppTypography.caption.copyWith(fontSize: 12),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.borderLight,
              borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
            ),
            child: Text(
              '\uc774\uc5b4\ud558\uae30',
              style: AppTypography.caption.copyWith(
                fontSize: 12,
                color: AppColors.primary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIconForType(String type) {
    return switch (type) {
      'chat' => Icons.chat_bubble_outline_rounded,
      'roleplay' => Icons.theater_comedy_outlined,
      'vocabulary' => Icons.style_outlined,
      _ => Icons.school_outlined,
    };
  }

  Color _getColorForType(String type) {
    return switch (type) {
      'chat' => AppColors.primary,
      'roleplay' => const Color(0xFF6366F1),
      'vocabulary' => const Color(0xFFF59E0B),
      _ => AppColors.textSecondary,
    };
  }

  String _formatTimeAgo(DateTime timestamp) {
    final now = DateTime.now();
    final diff = now.difference(timestamp);

    if (diff.inMinutes < 1) return '\ubc29\uae08 \uc804';
    if (diff.inMinutes < 60) return '${diff.inMinutes}\ubd84 \uc804';
    if (diff.inHours < 24) return '${diff.inHours}\uc2dc\uac04 \uc804';
    if (diff.inDays < 7) return '${diff.inDays}\uc77c \uc804';
    return '${timestamp.month}/${timestamp.day}';
  }
}
