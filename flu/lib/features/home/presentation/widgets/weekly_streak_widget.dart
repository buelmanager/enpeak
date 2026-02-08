import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/core/widgets/minimal_card.dart';
import 'package:flu/core/widgets/section_header.dart';

class WeeklyStreakWidget extends StatelessWidget {
  final int streak;
  final List<bool> weekDays;

  const WeeklyStreakWidget({
    super.key,
    required this.streak,
    required this.weekDays,
  });

  static const _dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  @override
  Widget build(BuildContext context) {
    return MinimalCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(label: '\uc8fc\uac04 \ud65c\ub3d9'),

          // Streak display
          if (streak > 0)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  const Icon(
                    Icons.local_fire_department_rounded,
                    size: 20,
                    color: Color(0xFFF97316),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '$streak\uc77c \uc5f0\uc18d',
                    style: AppTypography.bodyCard.copyWith(
                      color: const Color(0xFFF97316),
                    ),
                  ),
                ],
              ),
            ),

          // 7-column grid (rounded squares)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(7, (index) {
              final isActive = index < weekDays.length && weekDays[index];
              return _buildDaySquare(_dayLabels[index], isActive: isActive);
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildDaySquare(String label, {required bool isActive}) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isActive ? AppColors.primary : AppColors.inputBg,
            borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isActive ? Colors.white : AppColors.textSecondary,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
