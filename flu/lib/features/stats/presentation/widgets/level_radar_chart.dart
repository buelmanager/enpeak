import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';

class LevelRadarChart extends StatelessWidget {
  final Map<String, int> levelData;

  const LevelRadarChart({super.key, required this.levelData});

  static const _levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

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
          Text(
            '\uB808\uBCA8\uBCC4 \uD559\uC2B5 \uD604\uD669',
            style: AppTypography.heading3,
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 220,
            child: RadarChart(
              RadarChartData(
                dataSets: [
                  RadarDataSet(
                    dataEntries: _levels
                        .map(
                          (l) =>
                              RadarEntry(value: (levelData[l] ?? 0).toDouble()),
                        )
                        .toList(),
                    fillColor: AppColors.primary.withValues(alpha: 0.2),
                    borderColor: AppColors.primary,
                    borderWidth: 2,
                    entryRadius: 4,
                  ),
                ],
                radarBackgroundColor: Colors.transparent,
                radarBorderData: const BorderSide(
                  color: AppColors.border,
                  width: 1,
                ),
                radarShape: RadarShape.polygon,
                tickCount: 3,
                tickBorderData: const BorderSide(
                  color: AppColors.borderLight,
                  width: 0.5,
                ),
                gridBorderData: const BorderSide(
                  color: AppColors.borderLight,
                  width: 1,
                ),
                ticksTextStyle: const TextStyle(
                  fontSize: 0,
                  color: Colors.transparent,
                ),
                titlePositionPercentageOffset: 0.25,
                getTitle: (index, angle) {
                  final level = _levels[index];
                  return RadarChartTitle(text: level, angle: 0);
                },
                titleTextStyle: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
                radarTouchData: RadarTouchData(enabled: false),
                borderData: FlBorderData(show: false),
              ),
              duration: const Duration(milliseconds: 300),
            ),
          ),
          const SizedBox(height: 16),
          _buildLevelChips(),
        ],
      ),
    );
  }

  Widget _buildLevelChips() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: _levels.map((level) {
        final color = AppColors.levelColor(level);
        final count = levelData[level] ?? 0;
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 3),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(9999),
            ),
            child: Text(
              '$level $count',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
