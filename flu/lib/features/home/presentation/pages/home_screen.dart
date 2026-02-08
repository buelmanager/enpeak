import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import '../providers/home_provider.dart';
import '../widgets/daily_challenge_card.dart';
import '../widgets/daily_expression_card.dart';
import '../widgets/quick_action_grid.dart';
import '../widgets/quick_quiz_widget.dart';
import '../widgets/recent_activity_list.dart';
import '../widgets/scenario_scroll.dart';
import '../widgets/vocab_preview.dart';
import '../widgets/weekly_streak_widget.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(homeProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () => ref.read(homeProvider.notifier).refresh(),
          child: state.isLoading && state.dailyExpression == null
              ? _buildLoadingBody()
              : state.error != null && state.dailyExpression == null
              ? _buildErrorBody(context, ref, state.error!)
              : _buildBody(context, state),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '\ud658\uc601\ud569\ub2c8\ub2e4',
                style: AppTypography.greeting,
              ),
              const SizedBox(height: 2),
              Text('Flu', style: AppTypography.titleLarge),
            ],
          ),
          GestureDetector(
            onTap: () => Navigator.pushNamed(context, '/my'),
            child: Container(
              width: 40,
              height: 40,
              decoration: const BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.person_rounded,
                size: 22,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(BuildContext context, HomeState state) {
    return ListView(
      padding: EdgeInsets.zero,
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        _buildHeader(context),
        const SizedBox(height: 16),

        // Streak badge (conditional)
        if (state.weeklyStreak > 0)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _buildStreakBadge(state.weeklyStreak),
          ),
        if (state.weeklyStreak > 0) const SizedBox(height: 12),

        // Quick mode cards
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: QuickActionGrid(),
        ),
        const SizedBox(height: 12),

        // Daily challenge card
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: DailyChallengeCard(
            conversations: 0,
            conversationTarget: 3,
            vocabulary: 0,
            vocabularyTarget: 10,
            minutes: 0,
            minuteTarget: 15,
          ),
        ),
        const SizedBox(height: 12),

        // Recent activity
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: RecentActivityList(records: state.recentRecords),
        ),
        const SizedBox(height: 12),

        // Quick quiz
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: QuickQuizWidget(
            word: 'elaborate',
            options: const [
              '\uc0c1\uc138\ud788 \uc124\uba85\ud558\ub2e4',
              '\ucd95\ud558\ud558\ub2e4',
              '\uac70\uc808\ud558\ub2e4',
            ],
            correctIndex: 0,
            onNext: () {},
          ),
        ),
        const SizedBox(height: 12),

        // Today's expression
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: DailyExpressionCard(
            expression: state.dailyExpression,
            onTap: () => Navigator.pushNamed(context, '/daily'),
          ),
        ),
        const SizedBox(height: 12),

        // Recommended scenarios (horizontal scroll)
        const ScenarioScroll(),
        const SizedBox(height: 12),

        // Vocabulary preview (horizontal scroll)
        const VocabPreview(),
        const SizedBox(height: 12),

        // Weekly activity grid
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: WeeklyStreakWidget(
            streak: state.weeklyStreak,
            weekDays: state.weekDays,
          ),
        ),

        // Bottom nav clearance
        const SizedBox(height: AppSpacing.bottomNavClearance),
      ],
    );
  }

  Widget _buildStreakBadge(int streak) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: const Color(0xFFFED7AA)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.local_fire_department_rounded,
            size: 18,
            color: Color(0xFFF97316),
          ),
          const SizedBox(width: 6),
          Text(
            '$streak\uc77c \uc5f0\uc18d \ud559\uc2b5 \uc911!',
            style: AppTypography.bodyCard.copyWith(
              color: const Color(0xFFF97316),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingBody() {
    return ListView(
      padding: EdgeInsets.zero,
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        Builder(builder: (context) => _buildHeader(context)),
        const SizedBox(height: 16),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: QuickActionGrid(),
        ),
        const SizedBox(height: 12),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: DailyChallengeCard(
            conversations: 0,
            conversationTarget: 3,
            vocabulary: 0,
            vocabularyTarget: 10,
            minutes: 0,
            minuteTarget: 15,
          ),
        ),
        const SizedBox(height: 12),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: DailyExpressionCard(isLoading: true),
        ),
        const SizedBox(height: AppSpacing.bottomNavClearance),
      ],
    );
  }

  Widget _buildErrorBody(BuildContext context, WidgetRef ref, String error) {
    return ListView(
      padding: EdgeInsets.zero,
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        _buildHeader(context),
        const SizedBox(height: 16),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                Icon(
                  Icons.cloud_off_rounded,
                  size: 40,
                  color: AppColors.textSecondary.withValues(alpha: 0.5),
                ),
                const SizedBox(height: 12),
                Text(
                  '\uc11c\ubc84\uc5d0 \uc5f0\uacb0\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4',
                  style: AppTypography.bodyMedium,
                ),
                const SizedBox(height: 4),
                Text(
                  error,
                  style: AppTypography.caption,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => ref.read(homeProvider.notifier).refresh(),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                  ),
                  child: const Text('\ub2e4\uc2dc \uc2dc\ub3c4'),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: QuickActionGrid(),
        ),
        const SizedBox(height: 12),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: RecentActivityList(records: []),
        ),
        const SizedBox(height: AppSpacing.bottomNavClearance),
      ],
    );
  }
}
