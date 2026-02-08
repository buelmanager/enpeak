import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/stats/presentation/providers/stats_state.dart';

class CategoryPieChart extends StatelessWidget {
  final List<CategoryData> categories;

  const CategoryPieChart({super.key, required this.categories});

  static const _colors = [
    AppColors.primary,
    AppColors.success,
    AppColors.warning,
    AppColors.error,
  ];

  static const _koreanLabels = {
    'Conversation': '자유 대화',
    'Vocabulary': '단어 학습',
    'Roleplay': '롤플레이',
    'Expression': '표현 연습',
  };

  bool get _isEmpty =>
      categories.isEmpty || categories.every((c) => c.value == 0);

  int get _totalCount => categories.fold(0, (sum, c) => sum + c.value.toInt());

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
          Text('학습 유형', style: AppTypography.heading3),
          const SizedBox(height: 20),
          SizedBox(
            height: 180,
            child: Row(
              children: [
                Expanded(
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      PieChart(
                        PieChartData(
                          sectionsSpace: _isEmpty ? 0 : 3,
                          centerSpaceRadius: 50,
                          sections: _isEmpty
                              ? _buildEmptySections()
                              : _buildSections(),
                          pieTouchData: PieTouchData(enabled: false),
                        ),
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _isEmpty ? '-' : '$_totalCount',
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                              letterSpacing: -0.5,
                            ),
                          ),
                          Text(
                            _isEmpty ? '데이터 없음' : '분',
                            style: AppTypography.caption.copyWith(fontSize: 11),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 24),
                _buildLegend(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<PieChartSectionData> _buildEmptySections() {
    return [
      PieChartSectionData(
        color: AppColors.border.withValues(alpha: 0.4),
        value: 1,
        title: '',
        radius: 24,
        showTitle: false,
      ),
    ];
  }

  List<PieChartSectionData> _buildSections() {
    return List.generate(categories.length, (index) {
      final cat = categories[index];
      final color = _colors[index % _colors.length];

      return PieChartSectionData(
        color: color,
        value: cat.value,
        title: '',
        radius: 24,
        showTitle: false,
      );
    });
  }

  Widget _buildLegend() {
    if (_isEmpty) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: _koreanLabels.entries.map((entry) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: AppColors.border.withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  entry.value,
                  style: AppTypography.caption.copyWith(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      );
    }

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(categories.length, (index) {
        final cat = categories[index];
        final color = _colors[index % _colors.length];
        final displayLabel = _koreanLabels[cat.label] ?? cat.label;
        final pct = (cat.percentage * 100).toInt();

        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                displayLabel,
                style: AppTypography.caption.copyWith(fontSize: 12),
              ),
              const SizedBox(width: 6),
              Text(
                '$pct%',
                style: AppTypography.caption.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}
