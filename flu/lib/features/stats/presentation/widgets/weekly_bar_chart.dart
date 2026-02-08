import 'dart:math' as math;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';

class WeeklyBarChart extends StatelessWidget {
  final List<double> data;
  final List<String> labels;

  const WeeklyBarChart({super.key, required this.data, required this.labels});

  bool get _allZero => data.isEmpty || data.every((v) => v == 0);

  @override
  Widget build(BuildContext context) {
    final maxY = data.isEmpty
        ? 10.0
        : _allZero
        ? 10.0
        : (data.reduce(math.max) * 1.3).ceilToDouble();

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
          Row(
            children: [
              Text('주간 활동', style: AppTypography.heading3),
              const Spacer(),
              Text(
                '분',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          if (_allZero)
            SizedBox(
              height: 200,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.bar_chart_rounded,
                      size: 40,
                      color: AppColors.textSecondary.withValues(alpha: 0.3),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '이번 주 학습 데이터가 없습니다',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            SizedBox(
              height: 200,
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: maxY,
                  minY: 0,
                  barTouchData: BarTouchData(
                    enabled: true,
                    touchTooltipData: BarTouchTooltipData(
                      getTooltipColor: (_) =>
                          AppColors.textPrimary.withValues(alpha: 0.9),
                      tooltipPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      tooltipRoundedRadius: 8,
                      getTooltipItem: (group, groupIndex, rod, rodIndex) {
                        return BarTooltipItem(
                          '${rod.toY.toInt()}분',
                          AppTypography.caption.copyWith(
                            color: AppColors.surface,
                            fontWeight: FontWeight.w600,
                          ),
                        );
                      },
                    ),
                  ),
                  titlesData: FlTitlesData(
                    show: true,
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 28,
                        getTitlesWidget: (value, meta) {
                          final index = value.toInt();
                          if (index < 0 || index >= labels.length) {
                            return const SizedBox.shrink();
                          }
                          final isToday = index == labels.length - 1;
                          return Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Text(
                              labels[index],
                              style: AppTypography.caption.copyWith(
                                fontWeight: isToday
                                    ? FontWeight.w700
                                    : FontWeight.w400,
                                color: isToday
                                    ? AppColors.primary
                                    : AppColors.textSecondary,
                                fontSize: 11,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 32,
                        interval: maxY > 0 ? (maxY / 3).ceilToDouble() : 10,
                        getTitlesWidget: (value, meta) {
                          if (value == 0) return const SizedBox.shrink();
                          return Text(
                            value.toInt().toString(),
                            style: AppTypography.caption.copyWith(fontSize: 10),
                          );
                        },
                      ),
                    ),
                    topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                  ),
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: false,
                    horizontalInterval: maxY > 0
                        ? (maxY / 3).ceilToDouble()
                        : 10,
                    getDrawingHorizontalLine: (value) {
                      return FlLine(
                        color: AppColors.border.withValues(alpha: 0.5),
                        strokeWidth: 1,
                        dashArray: [4, 4],
                      );
                    },
                  ),
                  borderData: FlBorderData(show: false),
                  barGroups: _buildBarGroups(maxY),
                ),
              ),
            ),
        ],
      ),
    );
  }

  List<BarChartGroupData> _buildBarGroups(double maxY) {
    return List.generate(data.length, (index) {
      final isToday = index == data.length - 1;
      final isEmpty = data[index] == 0;

      return BarChartGroupData(
        x: index,
        barRods: [
          BarChartRodData(
            toY: isEmpty ? maxY * 0.02 : data[index],
            width: 28,
            color: isEmpty
                ? AppColors.border
                : isToday
                ? AppColors.primary
                : AppColors.primary.withValues(alpha: 0.6),
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(6),
              topRight: Radius.circular(6),
            ),
          ),
        ],
        showingTooltipIndicators: isToday && !isEmpty ? [0] : [],
      );
    });
  }
}
