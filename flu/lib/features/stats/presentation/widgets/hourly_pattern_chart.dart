import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';

class HourlyPatternChart extends StatelessWidget {
  final List<int> hourlyData;

  const HourlyPatternChart({super.key, required this.hourlyData})
    : assert(hourlyData.length == 24, 'hourlyData must have 24 entries');

  @override
  Widget build(BuildContext context) {
    final maxValue = hourlyData.isEmpty
        ? 1
        : hourlyData.reduce(math.max).clamp(1, double.maxFinite.toInt());
    final peakHour = _findPeakHour();

    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Study Hours', style: AppTypography.heading3),
          const SizedBox(height: AppSpacing.xxl),
          SizedBox(height: 130, child: _buildBarChart(maxValue, peakHour)),
          const SizedBox(height: AppSpacing.md),
          _buildXAxisLabels(),
          const SizedBox(height: AppSpacing.xl),
          _buildPeakHourLabel(peakHour),
        ],
      ),
    );
  }

  int _findPeakHour() {
    int peakIdx = 0;
    for (int i = 1; i < hourlyData.length; i++) {
      if (hourlyData[i] > hourlyData[peakIdx]) {
        peakIdx = i;
      }
    }
    return peakIdx;
  }

  Widget _buildBarChart(int maxValue, int peakHour) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: List.generate(24, (hour) {
            final value = hourlyData[hour];
            final isPeak = hour == peakHour && value > 0;
            final isEmpty = value == 0;

            final barHeight = isEmpty
                ? 2.0
                : (value / maxValue * 100.0).clamp(4.0, 100.0);

            final barWidth = isPeak ? 12.0 : 8.0;

            return Expanded(
              child: Center(
                child: Container(
                  width: barWidth,
                  height: barHeight,
                  decoration: BoxDecoration(
                    color: isEmpty
                        ? AppColors.border
                        : isPeak
                        ? AppColors.accentCoral
                        : AppColors.primary,
                    borderRadius: BorderRadius.circular(isPeak ? 4 : 3),
                  ),
                ),
              ),
            );
          }),
        );
      },
    );
  }

  Widget _buildXAxisLabels() {
    const labels = {0: '0', 6: '6', 12: '12', 18: '18', 23: '23'};

    return Row(
      children: List.generate(24, (hour) {
        final label = labels[hour];
        return Expanded(
          child: Center(
            child: label != null
                ? Text(
                    '${label}h',
                    style: AppTypography.caption.copyWith(fontSize: 10),
                  )
                : const SizedBox.shrink(),
          ),
        );
      }),
    );
  }

  Widget _buildPeakHourLabel(int peakHour) {
    final peakValue = hourlyData[peakHour];
    if (peakValue == 0) {
      return Text(
        'No study data yet',
        style: AppTypography.bodySmall.copyWith(
          fontSize: 14,
          color: AppColors.textSecondary,
        ),
      );
    }

    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: const BoxDecoration(
            color: AppColors.accentCoral,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          'Most active: ${peakHour}h',
          style: AppTypography.bodySmall.copyWith(
            fontSize: 14,
            color: AppColors.primary,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
