import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/stats/presentation/providers/stats_provider.dart';
import '../widgets/insight_card.dart';
import '../widgets/streak_hero.dart';
import '../widgets/daily_goals.dart';
import '../widgets/stat_summary_card.dart';
import '../widgets/weekly_bar_chart.dart';
import '../widgets/monthly_heatmap.dart';
import '../widgets/category_pie_chart.dart';
import '../widgets/hourly_pattern_chart.dart';
import '../widgets/level_radar_chart.dart';
import '../widgets/week_comparison_card.dart';
import '../widgets/recent_timeline.dart';
import '../widgets/achievement_badges.dart';

class StatsScreen extends ConsumerWidget {
  const StatsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(statsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: stats.isLoading
            ? const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              )
            : RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () => ref.read(statsProvider.notifier).loadStats(),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 1. Title
                      Text(
                        '\uD559\uC2B5 \uD1B5\uACC4',
                        style: AppTypography.heading2,
                      ),
                      const SizedBox(height: 16),

                      // 2. InsightCard
                      InsightCard(
                        totalWords: stats.totalWords,
                        currentStreak: stats.currentStreak,
                        totalMinutes: stats.totalMinutes,
                        totalConversations: stats.totalConversations,
                      ),
                      const SizedBox(height: 16),

                      // 3. StreakHero
                      StreakHero(
                        currentStreak: stats.currentStreak,
                        longestStreak: stats.longestStreak,
                      ),
                      const SizedBox(height: 16),

                      // 4. DailyGoals
                      DailyGoals(
                        wordsToday: stats.wordsToday,
                        conversationsToday: stats.conversationsToday,
                        minutesToday: stats.minutesToday,
                      ),
                      const SizedBox(height: 16),

                      // 5. StatSummaryCard x4 (2x2 grid)
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        childAspectRatio: 1.3,
                        children: [
                          StatSummaryCard(
                            icon: Icons.menu_book_rounded,
                            iconColor: AppColors.primary,
                            value: stats.totalWords.toString(),
                            label: '\uD559\uC2B5 \uB2E8\uC5B4',
                          ),
                          StatSummaryCard(
                            icon: Icons.chat_bubble_outline_rounded,
                            iconColor: AppColors.success,
                            value: stats.totalConversations.toString(),
                            label: '\uD68C\uD654 \uC218',
                          ),
                          StatSummaryCard(
                            icon: Icons.timer_outlined,
                            iconColor: AppColors.warning,
                            value: '${stats.totalMinutes}\uBD84',
                            label: '\uD559\uC2B5 \uC2DC\uAC04',
                          ),
                          StatSummaryCard(
                            icon: Icons.local_fire_department_rounded,
                            iconColor: AppColors.error,
                            value: '${stats.currentStreak}\uC77C',
                            label: '\uC5F0\uC18D \uD559\uC2B5',
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // 6. WeeklyBarChart
                      WeeklyBarChart(
                        data: stats.weeklyData,
                        labels: stats.weeklyLabels,
                      ),
                      const SizedBox(height: 16),

                      // 7. MonthlyHeatmap
                      MonthlyHeatmap(
                        studiedDates: stats.studiedDates,
                        intensityMap: stats.intensityMap,
                      ),
                      const SizedBox(height: 16),

                      // 8. CategoryPieChart
                      CategoryPieChart(categories: stats.categoryBreakdown),
                      const SizedBox(height: 16),

                      // 9. HourlyPatternChart
                      HourlyPatternChart(hourlyData: stats.hourlyData),
                      const SizedBox(height: 16),

                      // 10. LevelRadarChart
                      LevelRadarChart(levelData: stats.levelData),
                      const SizedBox(height: 16),

                      // 11. WeekComparisonCard
                      WeekComparisonCard(
                        thisWeek: stats.thisWeek,
                        lastWeek: stats.lastWeek,
                      ),
                      const SizedBox(height: 16),

                      // 12. RecentTimeline
                      RecentTimeline(activities: stats.recentActivities),
                      const SizedBox(height: 16),

                      // 13. AchievementBadges
                      AchievementBadges(unlockedBadgeIds: stats.unlockedBadges),
                    ],
                  ),
                ),
              ),
      ),
    );
  }
}
