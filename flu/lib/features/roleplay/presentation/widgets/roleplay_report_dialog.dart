import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/roleplay/domain/entities/roleplay_report.dart';

class RoleplayReportDialog extends StatelessWidget {
  final RoleplayReport report;
  final VoidCallback onPracticeAgain;
  final VoidCallback onClose;

  const RoleplayReportDialog({
    super.key,
    required this.report,
    required this.onPracticeAgain,
    required this.onClose,
  });

  static Future<void> show(
    BuildContext context, {
    required RoleplayReport report,
    required VoidCallback onPracticeAgain,
    required VoidCallback onClose,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => RoleplayReportDialog(
        report: report,
        onPracticeAgain: onPracticeAgain,
        onClose: onClose,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 400),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Roleplay Report',
                style: AppTypography.heading2.copyWith(fontSize: 20),
              ),
              const SizedBox(height: 4),
              Text(
                report.scenarioTitle,
                style: AppTypography.bodySmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              _buildScoreCircle(),
              const SizedBox(height: 24),
              if (report.strengths.isNotEmpty) ...[
                _buildSection(
                  title: 'Strengths',
                  items: report.strengths,
                  icon: Icons.check_circle_rounded,
                  iconColor: AppColors.success,
                ),
                const SizedBox(height: 16),
              ],
              if (report.areasToImprove.isNotEmpty) ...[
                _buildSection(
                  title: 'Areas to Improve',
                  items: report.areasToImprove,
                  icon: Icons.warning_rounded,
                  iconColor: AppColors.warning,
                ),
                const SizedBox(height: 16),
              ],
              if (report.vocabularyHighlights.isNotEmpty) ...[
                _buildVocabularySection(),
                const SizedBox(height: 16),
              ],
              _buildEncouragement(),
              const SizedBox(height: 24),
              _buildActions(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildScoreCircle() {
    final score = report.overallScore.clamp(0, 100);
    final scoreColor = score >= 80
        ? AppColors.success
        : score >= 60
        ? AppColors.warning
        : AppColors.error;

    return SizedBox(
      width: 100,
      height: 100,
      child: CustomPaint(
        painter: _ScoreCirclePainter(
          progress: score / 100,
          color: scoreColor,
          trackColor: AppColors.border,
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '$score',
                style: AppTypography.heading1.copyWith(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: scoreColor,
                ),
              ),
              Text(
                'score',
                style: AppTypography.caption.copyWith(fontSize: 11),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required List<String> items,
    required IconData icon,
    required Color iconColor,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTypography.label.copyWith(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        ...items.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(icon, size: 16, color: iconColor),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    item,
                    style: AppTypography.bodySmall.copyWith(
                      fontSize: 13,
                      color: AppColors.textPrimary,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildVocabularySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Vocabulary Highlights',
          style: AppTypography.label.copyWith(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: report.vocabularyHighlights.map((word) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: AppColors.primaryLight.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.2),
                ),
              ),
              child: Text(
                word,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.primaryDark,
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildEncouragement() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Text(
        report.encouragement,
        style: AppTypography.bodySmall.copyWith(
          fontSize: 13,
          color: AppColors.textPrimary,
          height: 1.5,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget _buildActions() {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: onClose,
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.textSecondary,
              side: const BorderSide(color: AppColors.border),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(
              'Close',
              style: AppTypography.button.copyWith(
                color: AppColors.textSecondary,
                fontSize: 15,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: FilledButton(
            onPressed: onPracticeAgain,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(
              'Practice Again',
              style: AppTypography.button.copyWith(
                color: Colors.white,
                fontSize: 15,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _ScoreCirclePainter extends CustomPainter {
  final double progress;
  final Color color;
  final Color trackColor;

  _ScoreCirclePainter({
    required this.progress,
    required this.color,
    required this.trackColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - 10) / 2;
    const strokeWidth = 8.0;

    final trackPaint = Paint()
      ..color = trackColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, trackPaint);

    final progressPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      2 * math.pi * progress,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _ScoreCirclePainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.color != color;
  }
}
