import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';

class MonthlyHeatmap extends StatefulWidget {
  final Set<DateTime> studiedDates;
  final Map<DateTime, int> intensityMap;

  const MonthlyHeatmap({
    super.key,
    required this.studiedDates,
    required this.intensityMap,
  });

  @override
  State<MonthlyHeatmap> createState() => _MonthlyHeatmapState();
}

class _MonthlyHeatmapState extends State<MonthlyHeatmap> {
  int _monthOffset = 0;

  DateTime get _displayMonth {
    final now = DateTime.now();
    return DateTime(now.year, now.month + _monthOffset);
  }

  @override
  Widget build(BuildContext context) {
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
          Text('Study Calendar', style: AppTypography.heading3),
          const SizedBox(height: AppSpacing.xl),
          _buildMonthHeader(),
          const SizedBox(height: AppSpacing.xl),
          _buildWeekdayHeader(),
          const SizedBox(height: AppSpacing.md),
          _buildCalendarGrid(),
          const SizedBox(height: AppSpacing.xl),
          _buildLegend(),
        ],
      ),
    );
  }

  Widget _buildMonthHeader() {
    final month = _displayMonth;
    final now = DateTime.now();
    final isCurrent = month.year == now.year && month.month == now.month;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        GestureDetector(
          onTap: () => setState(() => _monthOffset--),
          child: Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: const Icon(
              Icons.chevron_left_rounded,
              size: 20,
              color: AppColors.textSecondary,
            ),
          ),
        ),
        Text(
          '${month.year}. ${month.month.toString().padLeft(2, '0')}',
          style: AppTypography.bodyMedium14.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        GestureDetector(
          onTap: isCurrent ? null : () => setState(() => _monthOffset++),
          child: Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              border: Border.all(
                color: isCurrent
                    ? AppColors.borderLight.withValues(alpha: 0.5)
                    : AppColors.borderLight,
              ),
            ),
            child: Icon(
              Icons.chevron_right_rounded,
              size: 20,
              color: isCurrent
                  ? AppColors.textSecondary.withValues(alpha: 0.3)
                  : AppColors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildWeekdayHeader() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return Row(
      children: days
          .map(
            (d) => Expanded(
              child: Center(
                child: Text(
                  d,
                  style: AppTypography.caption.copyWith(
                    fontSize: 10,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _buildCalendarGrid() {
    final month = _displayMonth;
    final firstDay = DateTime(month.year, month.month, 1);
    final lastDay = DateTime(month.year, month.month + 1, 0);
    final startWeekday = firstDay.weekday; // 1=Mon, 7=Sun

    final totalCells = ((startWeekday - 1) + lastDay.day + 6) ~/ 7 * 7;
    final weekCount = totalCells ~/ 7;

    return Column(
      children: List.generate(weekCount, (weekIndex) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 2),
          child: Row(
            children: List.generate(7, (dayIndex) {
              final cellIndex = weekIndex * 7 + dayIndex;
              final dayNum = cellIndex - (startWeekday - 1) + 1;

              if (dayNum < 1 || dayNum > lastDay.day) {
                return const Expanded(child: SizedBox(height: 32));
              }

              final date = DateTime(month.year, month.month, dayNum);
              return Expanded(child: _buildDayCell(date));
            }),
          ),
        );
      }),
    );
  }

  Widget _buildDayCell(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final normalizedDate = DateTime(date.year, date.month, date.day);
    final isToday = normalizedDate == today;
    final isFuture = normalizedDate.isAfter(today);
    final isStudied = _wasStudied(normalizedDate);
    final intensity = _getIntensity(normalizedDate);

    Color bgColor;
    Color textColor;
    BoxBorder? border;

    if (isFuture) {
      bgColor = const Color(0xFFFAFAFA);
      textColor = AppColors.textSecondary.withValues(alpha: 0.4);
    } else if (isStudied) {
      bgColor = AppColors.primary.withValues(alpha: intensity);
      textColor = intensity >= 0.6 ? Colors.white : AppColors.textPrimary;
    } else {
      bgColor = Colors.transparent;
      textColor = AppColors.textSecondary;
      border = Border.all(color: const Color(0xFFF0F0F0));
    }

    if (isToday) {
      border = Border.all(color: AppColors.primary, width: 2);
    }

    return Center(
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
          border: border,
        ),
        child: Center(
          child: Text(
            date.day.toString(),
            style: TextStyle(
              fontSize: 11,
              fontWeight: isToday ? FontWeight.w700 : FontWeight.w500,
              color: textColor,
            ),
          ),
        ),
      ),
    );
  }

  bool _wasStudied(DateTime date) {
    return widget.studiedDates.any(
      (d) => d.year == date.year && d.month == date.month && d.day == date.day,
    );
  }

  double _getIntensity(DateTime date) {
    final matched = widget.intensityMap.entries
        .where(
          (e) =>
              e.key.year == date.year &&
              e.key.month == date.month &&
              e.key.day == date.day,
        )
        .firstOrNull;

    if (matched == null) return 0.2;

    final value = matched.value;
    if (value <= 1) return 0.2;
    if (value <= 3) return 0.4;
    if (value <= 5) return 0.6;
    if (value <= 8) return 0.8;
    return 1.0;
  }

  Widget _buildLegend() {
    const opacities = [0.2, 0.4, 0.6, 0.8, 1.0];

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Less', style: AppTypography.caption.copyWith(fontSize: 10)),
        const SizedBox(width: 6),
        ...opacities.map(
          (o) => Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2),
            child: Container(
              width: 14,
              height: 14,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: o),
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          ),
        ),
        const SizedBox(width: 6),
        Text('More', style: AppTypography.caption.copyWith(fontSize: 10)),
      ],
    );
  }
}
