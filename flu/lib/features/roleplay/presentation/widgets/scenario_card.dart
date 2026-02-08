import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/roleplay/domain/entities/scenario.dart';

class ScenarioCard extends StatelessWidget {
  final Scenario scenario;
  final VoidCallback onTap;

  const ScenarioCard({super.key, required this.scenario, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _buildCategoryIcon(),
                  const SizedBox(width: 8),
                  Expanded(child: _buildDifficultyBadge()),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                scenario.title,
                style: AppTypography.label.copyWith(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                scenario.titleKo,
                style: AppTypography.caption.copyWith(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const Spacer(),
              if (scenario.estimatedTime != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.schedule_rounded,
                      size: 14,
                      color: AppColors.textSecondary.withValues(alpha: 0.7),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      scenario.estimatedTime!,
                      style: AppTypography.caption.copyWith(fontSize: 11),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryIcon() {
    final (IconData icon, Color color) = _categoryData(scenario.category);

    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(icon, size: 18, color: color),
    );
  }

  Widget _buildDifficultyBadge() {
    final color = _difficultyColor(scenario.difficulty);
    final label = _difficultyLabel(scenario.difficulty);

    return Align(
      alignment: Alignment.centerRight,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: color,
            height: 1.2,
          ),
        ),
      ),
    );
  }

  static (IconData, Color) _categoryData(String category) {
    return switch (category.toLowerCase()) {
      'daily' => (Icons.calendar_today_rounded, AppColors.primary),
      'travel' => (Icons.flight_rounded, const Color(0xFF6366F1)),
      'business' => (Icons.work_rounded, const Color(0xFFF59E0B)),
      'food' => (Icons.restaurant_rounded, const Color(0xFFEF4444)),
      _ => (Icons.chat_rounded, AppColors.primary),
    };
  }

  static Color _difficultyColor(String difficulty) {
    return switch (difficulty.toLowerCase()) {
      'beginner' => AppColors.success,
      'intermediate' => AppColors.warning,
      'advanced' => AppColors.error,
      _ => AppColors.textSecondary,
    };
  }

  static String _difficultyLabel(String difficulty) {
    return switch (difficulty.toLowerCase()) {
      'beginner' => 'Beginner',
      'intermediate' => 'Intermediate',
      'advanced' => 'Advanced',
      _ => difficulty,
    };
  }
}
