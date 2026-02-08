import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';

class WeekStats {
  final int words;
  final int conversations;
  final int minutes;

  const WeekStats({this.words = 0, this.conversations = 0, this.minutes = 0});
}

class WeekComparisonCard extends StatelessWidget {
  final WeekStats thisWeek;
  final WeekStats lastWeek;

  const WeekComparisonCard({
    super.key,
    required this.thisWeek,
    required this.lastWeek,
  });

  @override
  Widget build(BuildContext context) {
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
          Text('\uC8FC\uAC04 \uBE44\uAD50', style: AppTypography.heading3),
          const SizedBox(height: 16),
          _buildRow(
            icon: Icons.menu_book_rounded,
            label: '\uD559\uC2B5 \uB2E8\uC5B4',
            thisValue: thisWeek.words,
            lastValue: lastWeek.words,
          ),
          _buildDivider(),
          _buildRow(
            icon: Icons.chat_bubble_outline_rounded,
            label: '\uD68C\uD654 \uD69F\uC218',
            thisValue: thisWeek.conversations,
            lastValue: lastWeek.conversations,
          ),
          _buildDivider(),
          _buildRow(
            icon: Icons.timer_outlined,
            label: '\uD559\uC2B5 \uC2DC\uAC04',
            thisValue: thisWeek.minutes,
            lastValue: lastWeek.minutes,
            suffix: 'min',
          ),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return const Divider(height: 1, thickness: 1, color: AppColors.borderLight);
  }

  Widget _buildRow({
    required IconData icon,
    required String label,
    required int thisValue,
    required int lastValue,
    String? suffix,
  }) {
    final diff = thisValue - lastValue;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.textSecondary),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              label,
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Text(
            suffix != null ? '$thisValue$suffix' : '$thisValue',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(width: 8),
          _buildChangeIndicator(diff),
        ],
      ),
    );
  }

  Widget _buildChangeIndicator(int diff) {
    if (diff > 0) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.arrow_upward_rounded,
            size: 14,
            color: AppColors.success,
          ),
          Text(
            '+$diff',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.success,
            ),
          ),
        ],
      );
    } else if (diff < 0) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.arrow_downward_rounded,
            size: 14,
            color: AppColors.error,
          ),
          Text(
            '$diff',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.error,
            ),
          ),
        ],
      );
    } else {
      return const Text(
        '=',
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: AppColors.textSecondary,
        ),
      );
    }
  }
}
