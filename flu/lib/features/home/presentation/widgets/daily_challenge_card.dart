import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';

class DailyChallengeCard extends StatelessWidget {
  final int conversations;
  final int conversationTarget;
  final int vocabulary;
  final int vocabularyTarget;
  final int minutes;
  final int minuteTarget;

  const DailyChallengeCard({
    super.key,
    required this.conversations,
    required this.conversationTarget,
    required this.vocabulary,
    required this.vocabularyTarget,
    required this.minutes,
    required this.minuteTarget,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xxl),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Text(
            '\uc624\ub298\uc758 \ub3c4\uc804',
            style: AppTypography.bodyMedium14.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            '\ubaa9\ud45c\ub97c \ub2ec\uc131\ud558\uc138\uc694',
            style: AppTypography.caption.copyWith(
              color: Colors.white.withValues(alpha: 0.9),
            ),
          ),
          const SizedBox(height: 16),

          // Progress bars
          _buildProgressBar(
            '\ub300\ud654 $conversations/$conversationTarget\ud68c',
            conversations,
            conversationTarget,
          ),
          const SizedBox(height: 10),
          _buildProgressBar(
            '\ub2e8\uc5b4 $vocabulary/$vocabularyTarget\uac1c',
            vocabulary,
            vocabularyTarget,
          ),
          const SizedBox(height: 10),
          _buildProgressBar(
            '\ud559\uc2b5 $minutes/$minuteTarget\ubd84',
            minutes,
            minuteTarget,
          ),
          const SizedBox(height: 16),

          // Goal sub-cards
          Row(
            children: [
              Expanded(
                child: _buildGoalCard(
                  Icons.chat_bubble_outline_rounded,
                  '$conversationTarget\ud68c',
                  '\ub300\ud654',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildGoalCard(
                  Icons.book_outlined,
                  '$vocabularyTarget\uac1c',
                  '\ub2e8\uc5b4',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildGoalCard(
                  Icons.timer_outlined,
                  '$minuteTarget\ubd84',
                  '\ud559\uc2b5',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProgressBar(String label, int current, int target) {
    final progress = target > 0 ? (current / target).clamp(0.0, 1.0) : 0.0;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTypography.caption.copyWith(
            color: Colors.white.withValues(alpha: 0.9),
            fontSize: 12,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          height: 6,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: progress,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildGoalCard(IconData icon, String value, String label) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      ),
      child: Column(
        children: [
          Icon(icon, size: 18, color: Colors.white),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTypography.bodyCard.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
          Text(
            label,
            style: AppTypography.badge.copyWith(
              color: Colors.white.withValues(alpha: 0.8),
            ),
          ),
        ],
      ),
    );
  }
}
