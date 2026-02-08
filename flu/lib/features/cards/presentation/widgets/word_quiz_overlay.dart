import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';

class WordQuizOverlay extends StatelessWidget {
  final int currentIndex;
  final int totalCount;
  final Widget child;
  final bool showResults;
  final int correctCount;
  final int wrongCount;
  final double scorePercent;
  final VoidCallback onClose;
  final VoidCallback onComplete;

  const WordQuizOverlay({
    super.key,
    required this.currentIndex,
    required this.totalCount,
    required this.child,
    required this.showResults,
    required this.correctCount,
    required this.wrongCount,
    required this.scorePercent,
    required this.onClose,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: showResults
            ? _QuizResultsView(
                correctCount: correctCount,
                wrongCount: wrongCount,
                scorePercent: scorePercent,
                onComplete: onComplete,
              )
            : _QuizProgressView(
                currentIndex: currentIndex,
                totalCount: totalCount,
                onClose: onClose,
                child: child,
              ),
      ),
    );
  }
}

class _QuizProgressView extends StatelessWidget {
  final int currentIndex;
  final int totalCount;
  final VoidCallback onClose;
  final Widget child;

  const _QuizProgressView({
    required this.currentIndex,
    required this.totalCount,
    required this.onClose,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final progress = totalCount > 0 ? currentIndex / totalCount : 0.0;
    return Column(
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.fromLTRB(4, 4, 16, 0),
          child: Row(
            children: [
              IconButton(
                onPressed: onClose,
                icon: const Icon(
                  Icons.close_rounded,
                  color: AppColors.textSecondary,
                ),
                splashRadius: 20,
              ),
              Expanded(
                child: Text(
                  '단어 퀴즈',
                  textAlign: TextAlign.center,
                  style: AppTypography.titleMedium,
                ),
              ),
              Text(
                '${currentIndex + 1}/$totalCount',
                style: AppTypography.bodySmall.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
        // Progress bar
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.xl,
            vertical: AppSpacing.md,
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 4,
              backgroundColor: AppColors.border,
              valueColor: const AlwaysStoppedAnimation<Color>(
                AppColors.primary,
              ),
            ),
          ),
        ),
        // Content
        Expanded(child: child),
      ],
    );
  }
}

class _QuizResultsView extends StatefulWidget {
  final int correctCount;
  final int wrongCount;
  final double scorePercent;
  final VoidCallback onComplete;

  const _QuizResultsView({
    required this.correctCount,
    required this.wrongCount,
    required this.scorePercent,
    required this.onComplete,
  });

  @override
  State<_QuizResultsView> createState() => _QuizResultsViewState();
}

class _QuizResultsViewState extends State<_QuizResultsView>
    with SingleTickerProviderStateMixin {
  late final AnimationController _animController;
  late final Animation<double> _scoreAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _scoreAnimation = Tween<double>(
      begin: 0,
      end: widget.scorePercent,
    ).animate(CurvedAnimation(parent: _animController, curve: Curves.easeOut));
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePadding),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Score circle
          AnimatedBuilder(
            animation: _scoreAnimation,
            builder: (context, _) {
              return CustomPaint(
                size: const Size(120, 120),
                painter: _ScoreCirclePainter(
                  score: _scoreAnimation.value,
                  trackColor: AppColors.border,
                  progressColor: AppColors.primary,
                  strokeWidth: 8,
                ),
                child: SizedBox(
                  width: 120,
                  height: 120,
                  child: Center(
                    child: Text(
                      '${_scoreAnimation.value.round()}%',
                      style: const TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 32),
          // Stats row
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _StatDot(
                color: AppColors.primary,
                label: '맞음 ${widget.correctCount}개',
              ),
              const SizedBox(width: 32),
              _StatDot(
                color: AppColors.accentCoral,
                label: '틀림 ${widget.wrongCount}개',
              ),
            ],
          ),
          const SizedBox(height: 40),
          // Complete button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: widget.onComplete,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: AppColors.surface,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: AppSpacing.borderRadiusXxl,
                ),
                elevation: 0,
              ),
              child: Text(
                '완료',
                style: AppTypography.button.copyWith(color: AppColors.surface),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatDot extends StatelessWidget {
  final Color color;
  final String label;

  const _StatDot({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}

class _ScoreCirclePainter extends CustomPainter {
  final double score;
  final Color trackColor;
  final Color progressColor;
  final double strokeWidth;

  _ScoreCirclePainter({
    required this.score,
    required this.trackColor,
    required this.progressColor,
    required this.strokeWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    // Track circle
    final trackPaint = Paint()
      ..color = trackColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, trackPaint);

    // Progress arc
    final progressPaint = Paint()
      ..color = progressColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    final sweepAngle = 2 * math.pi * (score / 100);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      sweepAngle,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _ScoreCirclePainter oldDelegate) {
    return oldDelegate.score != score;
  }
}
