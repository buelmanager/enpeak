import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';

class DailyGoals extends StatelessWidget {
  final int wordsToday;
  final int conversationsToday;
  final int minutesToday;

  static const int _wordGoal = 10;
  static const int _conversationGoal = 3;
  static const int _minuteGoal = 15;

  const DailyGoals({
    super.key,
    required this.wordsToday,
    required this.conversationsToday,
    required this.minutesToday,
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
          Text(
            '오늘의 목표',
            style: AppTypography.body.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          _GoalRow(
            icon: Icons.menu_book_outlined,
            label: '단어 학습',
            current: wordsToday,
            goal: _wordGoal,
            unit: '',
          ),
          const SizedBox(height: 14),
          _GoalRow(
            icon: Icons.chat_bubble_outline,
            label: '회화 연습',
            current: conversationsToday,
            goal: _conversationGoal,
            unit: '',
          ),
          const SizedBox(height: 14),
          _GoalRow(
            icon: Icons.timer_outlined,
            label: '학습 시간',
            current: minutesToday,
            goal: _minuteGoal,
            unit: '분',
          ),
        ],
      ),
    );
  }
}

class _GoalRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final int current;
  final int goal;
  final String unit;

  const _GoalRow({
    required this.icon,
    required this.label,
    required this.current,
    required this.goal,
    required this.unit,
  });

  bool get _isComplete => current >= goal;

  @override
  Widget build(BuildContext context) {
    final progress = (current / goal).clamp(0.0, 1.0);

    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.textSecondary),
        const SizedBox(width: 10),
        SizedBox(width: 64, child: Text(label, style: AppTypography.bodySmall)),
        const SizedBox(width: 10),
        // Progress bar
        Expanded(
          child: Container(
            height: 8,
            decoration: BoxDecoration(
              color: const Color(0xFFF0F0F0),
              borderRadius: BorderRadius.circular(4),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: progress,
              child: Container(
                decoration: BoxDecoration(
                  color: _isComplete ? AppColors.success : AppColors.primary,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        // Count or checkmark
        SizedBox(
          width: 48,
          child: _isComplete
              ? Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Icon(
                      Icons.check_circle,
                      size: 18,
                      color: AppColors.success,
                    ),
                  ],
                )
              : Text(
                  '$current/$goal$unit',
                  style: AppTypography.caption.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.right,
                ),
        ),
      ],
    );
  }
}
