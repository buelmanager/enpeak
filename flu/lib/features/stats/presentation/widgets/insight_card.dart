import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';

class InsightCard extends StatelessWidget {
  final int totalWords;
  final int currentStreak;
  final int totalMinutes;
  final int totalConversations;

  const InsightCard({
    super.key,
    required this.totalWords,
    required this.currentStreak,
    required this.totalMinutes,
    required this.totalConversations,
  });

  _InsightData get _insight {
    if (currentStreak >= 7) {
      return _InsightData(
        icon: Icons.local_fire_department_outlined,
        title: 'Perfect Week!',
        subtitle: '$currentStreak일 연속 학습 중입니다',
      );
    }
    if (totalWords >= 20) {
      return _InsightData(
        icon: Icons.auto_awesome_outlined,
        title: 'Great Progress!',
        subtitle: '이번 주 $totalWords개의 단어를 학습했습니다',
      );
    }
    if (totalConversations >= 5) {
      return _InsightData(
        icon: Icons.chat_outlined,
        title: 'Active Learner!',
        subtitle: '이번 주 $totalConversations회 회화를 연습했습니다',
      );
    }
    if (totalMinutes >= 30) {
      return _InsightData(
        icon: Icons.timer_outlined,
        title: 'Dedicated!',
        subtitle: '이번 주 $totalMinutes분 동안 학습했습니다',
      );
    }
    if (currentStreak >= 1) {
      return _InsightData(
        icon: Icons.trending_up_outlined,
        title: 'Keep Going!',
        subtitle: '$currentStreak일째 학습을 이어가고 있습니다',
      );
    }
    return _InsightData(
      icon: Icons.lightbulb_outlined,
      title: 'Start Today!',
      subtitle: '오늘 첫 학습을 시작해보세요',
    );
  }

  @override
  Widget build(BuildContext context) {
    final data = _insight;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          // Gradient accent bar
          Container(
            width: 4,
            height: 56,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(2),
              gradient: const LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [AppColors.primary, AppColors.primaryDark],
              ),
            ),
          ),
          const SizedBox(width: 12),
          // Icon circle
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primaryTint,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(data.icon, color: AppColors.primary, size: 20),
          ),
          const SizedBox(width: 12),
          // Text content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  data.title,
                  style: AppTypography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  data.subtitle,
                  style: AppTypography.bodySmall,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InsightData {
  final IconData icon;
  final String title;
  final String subtitle;

  const _InsightData({
    required this.icon,
    required this.title,
    required this.subtitle,
  });
}
