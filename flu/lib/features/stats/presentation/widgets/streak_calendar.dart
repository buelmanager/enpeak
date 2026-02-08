import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';

class StreakCalendar extends StatelessWidget {
  final int currentStreak;
  final Set<DateTime> studiedDates;

  const StreakCalendar({
    super.key,
    required this.currentStreak,
    required this.studiedDates,
  });

  static const _koreanMonths = [
    '',
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('학습 스트릭', style: AppTypography.heading3),
                  const SizedBox(height: 2),
                  Text(
                    _koreanMonths[today.month],
                    style: AppTypography.caption.copyWith(fontSize: 12),
                  ),
                ],
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.local_fire_department_rounded,
                      color: AppColors.primary,
                      size: 16,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '$currentStreak일',
                      style: AppTypography.label.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _buildWeekdayHeader(),
          const SizedBox(height: 8),
          _buildCalendarGrid(today),
          const SizedBox(height: 12),
          _buildFooter(),
        ],
      ),
    );
  }

  Widget _buildWeekdayHeader() {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    return Row(
      children: days
          .map(
            (d) => Expanded(
              child: Center(
                child: Text(
                  d,
                  style: AppTypography.caption.copyWith(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _buildCalendarGrid(DateTime today) {
    final fourWeeksAgo = today.subtract(const Duration(days: 27));
    final startDate = fourWeeksAgo.subtract(
      Duration(days: fourWeeksAgo.weekday - 1),
    );

    return Column(
      children: List.generate(4, (weekIndex) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 3),
          child: Row(
            children: List.generate(7, (dayIndex) {
              final date = startDate.add(
                Duration(days: weekIndex * 7 + dayIndex),
              );
              final normalizedDate = DateTime(date.year, date.month, date.day);
              final isToday = normalizedDate == today;
              final isStudied = _wasStudied(normalizedDate);
              final isFuture = normalizedDate.isAfter(today);

              return Expanded(
                child: Center(
                  child: _buildDayCircle(
                    date: normalizedDate,
                    isToday: isToday,
                    isStudied: isStudied,
                    isFuture: isFuture,
                  ),
                ),
              );
            }),
          ),
        );
      }),
    );
  }

  bool _wasStudied(DateTime date) {
    return studiedDates.any(
      (d) => d.year == date.year && d.month == date.month && d.day == date.day,
    );
  }

  Widget _buildDayCircle({
    required DateTime date,
    required bool isToday,
    required bool isStudied,
    required bool isFuture,
  }) {
    const size = 32.0;

    if (isFuture) {
      return const SizedBox(width: size, height: size);
    }

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isStudied
            ? AppColors.primary.withValues(alpha: 0.85)
            : AppColors.borderLight.withValues(alpha: 0.5),
        border: isToday
            ? Border.all(color: AppColors.primary, width: 2.5)
            : null,
        boxShadow: isToday && isStudied
            ? [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.25),
                  blurRadius: 6,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
      child: Center(
        child: Text(
          date.day.toString(),
          style: TextStyle(
            fontSize: 11,
            fontWeight: isToday ? FontWeight.w700 : FontWeight.w500,
            color: isStudied
                ? Colors.white
                : isToday
                ? AppColors.primary
                : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildFooter() {
    return Row(
      children: [
        _buildLegendItem(AppColors.primary.withValues(alpha: 0.85), '학습 완료'),
        const SizedBox(width: 16),
        _buildLegendItem(AppColors.borderLight.withValues(alpha: 0.5), '미학습'),
      ],
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(shape: BoxShape.circle, color: color),
        ),
        const SizedBox(width: 6),
        Text(label, style: AppTypography.caption.copyWith(fontSize: 11)),
      ],
    );
  }
}
