import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_shadows.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/core/widgets/section_header.dart';

class ScenarioItem {
  final String id;
  final String title;
  final String difficulty;
  final IconData icon;

  const ScenarioItem({
    required this.id,
    required this.title,
    required this.difficulty,
    required this.icon,
  });
}

class ScenarioScroll extends StatelessWidget {
  final List<ScenarioItem>? scenarios;

  const ScenarioScroll({super.key, this.scenarios});

  static const _defaultScenarios = [
    ScenarioItem(
      id: 'cafe_order',
      title: 'Cafe Order',
      difficulty: 'beginner',
      icon: Icons.coffee_outlined,
    ),
    ScenarioItem(
      id: 'hotel_checkin',
      title: 'Hotel Check-in',
      difficulty: 'beginner',
      icon: Icons.hotel_outlined,
    ),
    ScenarioItem(
      id: 'restaurant',
      title: 'Restaurant',
      difficulty: 'intermediate',
      icon: Icons.restaurant_outlined,
    ),
    ScenarioItem(
      id: 'job_interview',
      title: 'Job Interview',
      difficulty: 'advanced',
      icon: Icons.work_outline_rounded,
    ),
    ScenarioItem(
      id: 'airport',
      title: 'Airport',
      difficulty: 'intermediate',
      icon: Icons.flight_outlined,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final items = scenarios ?? _defaultScenarios;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: SectionHeader(label: '\ucd94\ucc9c \uc2dc\ub098\ub9ac\uc624'),
        ),
        SizedBox(
          height: 130,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return Padding(
                padding: EdgeInsets.only(
                  right: index < items.length - 1 ? 10 : 0,
                ),
                child: _buildCard(item),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildCard(ScenarioItem item) {
    return Container(
      width: 150,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
        border: Border.all(color: AppColors.borderCard),
        boxShadow: AppShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            ),
            child: Icon(item.icon, size: 18, color: Colors.white),
          ),
          const SizedBox(height: 10),
          Text(
            item.title,
            style: AppTypography.bodyCard.copyWith(
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 6),
          _buildDifficultyBadge(item.difficulty),
        ],
      ),
    );
  }

  Widget _buildDifficultyBadge(String difficulty) {
    Color bgColor;
    Color textColor;
    String label;

    switch (difficulty) {
      case 'beginner':
        bgColor = AppColors.difficultyBeginnerBg;
        textColor = AppColors.difficultyBeginnerText;
        label = 'Beginner';
      case 'intermediate':
        bgColor = AppColors.difficultyIntermediateBg;
        textColor = AppColors.difficultyIntermediateText;
        label = 'Intermediate';
      case 'advanced':
        bgColor = AppColors.difficultyAdvancedBg;
        textColor = AppColors.difficultyAdvancedText;
        label = 'Advanced';
      default:
        bgColor = AppColors.inputBg;
        textColor = AppColors.textSecondary;
        label = difficulty;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Text(label, style: AppTypography.badge.copyWith(color: textColor)),
    );
  }
}
