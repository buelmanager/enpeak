import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';

class StreakHero extends StatelessWidget {
  final int currentStreak;
  final int longestStreak;

  const StreakHero({
    super.key,
    required this.currentStreak,
    required this.longestStreak,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Flame icon in coral circle
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.accentCoral.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: const Icon(
                  Icons.local_fire_department,
                  color: AppColors.accentCoral,
                  size: 26,
                ),
              ),
              const SizedBox(width: 12),
              // Current streak
              Text(
                '$currentStreak',
                style: AppTypography.heading1.copyWith(
                  fontSize: 36,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -1,
                ),
              ),
              const SizedBox(width: 6),
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(
                  '일 연속',
                  style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const Spacer(),
              // Best streak
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('최고 기록', style: AppTypography.caption),
                  const SizedBox(height: 2),
                  Text(
                    '$longestStreak',
                    style: AppTypography.heading2.copyWith(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Motivational text
          Text(
            currentStreak > 0 ? '화이팅! 연속 학습을 이어가세요' : '오늘 학습을 시작해보세요',
            style: AppTypography.bodySmall,
          ),
        ],
      ),
    );
  }
}
