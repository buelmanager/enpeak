import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';

class _BadgeDefinition {
  final String id;
  final String name;
  final String description;
  final IconData icon;
  final Color color;

  const _BadgeDefinition({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.color,
  });
}

const List<_BadgeDefinition> _allBadges = [
  _BadgeDefinition(
    id: 'first_chat',
    name: '첫 대화',
    description: '첫 영어 대화를 완료했습니다',
    icon: Icons.chat_bubble_outline,
    color: AppColors.primary,
  ),
  _BadgeDefinition(
    id: 'word_100',
    name: '단어왕',
    description: '100개 단어를 학습했습니다',
    icon: Icons.school_outlined,
    color: AppColors.success,
  ),
  _BadgeDefinition(
    id: 'streak_3',
    name: '3일 연속',
    description: '3일 연속 학습했습니다',
    icon: Icons.local_fire_department_outlined,
    color: AppColors.warning,
  ),
  _BadgeDefinition(
    id: 'streak_7',
    name: '7일 연속',
    description: '7일 연속 학습했습니다',
    icon: Icons.whatshot_outlined,
    color: AppColors.accentCoral,
  ),
  _BadgeDefinition(
    id: 'first_roleplay',
    name: '첫 롤플레이',
    description: '첫 롤플레이를 완료했습니다',
    icon: Icons.theater_comedy_outlined,
    color: AppColors.accentPurple,
  ),
  _BadgeDefinition(
    id: 'streak_30',
    name: '30일 연속',
    description: '30일 연속 학습했습니다',
    icon: Icons.emoji_events_outlined,
    color: AppColors.accentOrange,
  ),
  _BadgeDefinition(
    id: 'expression_50',
    name: '표현 마스터',
    description: '50개 표현을 연습했습니다',
    icon: Icons.lightbulb_outline,
    color: AppColors.success,
  ),
  _BadgeDefinition(
    id: 'chat_50',
    name: '대화 달인',
    description: '50회 대화를 완료했습니다',
    icon: Icons.record_voice_over_outlined,
    color: AppColors.primary,
  ),
  _BadgeDefinition(
    id: 'perfect_week',
    name: '완벽한 한 주',
    description: '7일 모두 학습했습니다',
    icon: Icons.star_outline,
    color: AppColors.warning,
  ),
];

class AchievementBadges extends StatelessWidget {
  final Set<String> unlockedBadgeIds;

  const AchievementBadges({super.key, required this.unlockedBadgeIds});

  @override
  Widget build(BuildContext context) {
    final unlockedCount = _allBadges
        .where((b) => unlockedBadgeIds.contains(b.id))
        .length;

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
          // Title row
          Row(
            children: [
              Text('업적', style: AppTypography.heading3),
              const SizedBox(width: 8),
              Text(
                '$unlockedCount/${_allBadges.length} 달성',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Badge grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
              childAspectRatio: 1,
            ),
            itemCount: _allBadges.length,
            itemBuilder: (context, index) {
              final badge = _allBadges[index];
              final isUnlocked = unlockedBadgeIds.contains(badge.id);
              return _BadgeCard(badge: badge, isUnlocked: isUnlocked);
            },
          ),
        ],
      ),
    );
  }
}

class _BadgeCard extends StatelessWidget {
  final _BadgeDefinition badge;
  final bool isUnlocked;

  const _BadgeCard({required this.badge, required this.isUnlocked});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isUnlocked
          ? () {
              ScaffoldMessenger.of(context).hideCurrentSnackBar();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(badge.description),
                  duration: const Duration(seconds: 2),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            }
          : null,
      child: Container(
        decoration: BoxDecoration(
          color: isUnlocked ? AppColors.surface : const Color(0xFFF5F5F5),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isUnlocked) ...[
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: badge.color.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(badge.icon, size: 32, color: badge.color),
              ),
              const SizedBox(height: 6),
              Text(
                badge.name,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ] else ...[
              Icon(Icons.lock_outline, size: 24, color: AppColors.textTertiary),
              const SizedBox(height: 6),
              Text(
                badge.name,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textTertiary,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
