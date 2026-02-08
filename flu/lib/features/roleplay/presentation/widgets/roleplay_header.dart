import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/roleplay/domain/entities/roleplay_session.dart';

class RoleplayHeader extends StatelessWidget {
  final RoleplaySession session;
  final VoidCallback onExit;

  const RoleplayHeader({
    super.key,
    required this.session,
    required this.onExit,
  });

  @override
  Widget build(BuildContext context) {
    final scenario = session.scenario;
    final progress = session.totalStages > 0
        ? session.currentStage / session.totalStages
        : 0.0;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 8, 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.border)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildTitleRow(scenario.title),
            const SizedBox(height: 6),
            _buildRoleInfo(scenario.roles),
            const SizedBox(height: 12),
            _buildStageProgress(progress),
            if (session.learningTip != null) ...[
              const SizedBox(height: 10),
              _buildLearningTip(session.learningTip!),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTitleRow(String title) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: AppTypography.heading3.copyWith(fontSize: 17),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(width: 8),
        SizedBox(
          width: 36,
          height: 36,
          child: IconButton(
            onPressed: onExit,
            icon: const Icon(Icons.close_rounded, size: 20),
            style: IconButton.styleFrom(
              backgroundColor: AppColors.background,
              foregroundColor: AppColors.textSecondary,
              padding: EdgeInsets.zero,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRoleInfo(Map<String, String> roles) {
    final aiRole = roles['ai'] ?? 'AI';
    final userRole = roles['user'] ?? 'You';

    return Text(
      'You: $userRole  /  AI: $aiRole',
      style: AppTypography.caption.copyWith(
        fontSize: 13,
        color: AppColors.textSecondary,
      ),
    );
  }

  Widget _buildStageProgress(double progress) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Stage ${session.currentStage}/${session.totalStages}',
              style: AppTypography.label.copyWith(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
            Text(
              '${(progress * 100).toInt()}%',
              style: AppTypography.caption.copyWith(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 6,
            backgroundColor: AppColors.border,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
        ),
      ],
    );
  }

  Widget _buildLearningTip(String tip) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.primaryLight.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.15)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.lightbulb_outline_rounded,
            size: 16,
            color: AppColors.primaryDark,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              tip,
              style: AppTypography.caption.copyWith(
                fontSize: 12,
                color: AppColors.primaryDark,
                fontWeight: FontWeight.w500,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
