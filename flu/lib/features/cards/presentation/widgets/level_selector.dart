import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_constants.dart';
import 'package:flu/core/constants/app_spacing.dart';

class LevelSelector extends StatelessWidget {
  final String selectedLevel;
  final ValueChanged<String> onLevelSelected;

  const LevelSelector({
    super.key,
    required this.selectedLevel,
    required this.onLevelSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: AppConstants.levels.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final level = AppConstants.levels[index];
          final isSelected = level == selectedLevel;
          final levelColor = AppColors.levelColor(level);

          return GestureDetector(
            onTap: () => onLevelSelected(level),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOut,
              width: 60,
              height: 32,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: isSelected ? levelColor : AppColors.surface,
                borderRadius: AppSpacing.borderRadiusFull,
                border: Border.all(
                  color: isSelected
                      ? levelColor
                      : levelColor.withValues(alpha: 0.4),
                  width: 1.5,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: levelColor.withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ]
                    : null,
              ),
              child: Text(
                level,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? AppColors.surface : levelColor,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
