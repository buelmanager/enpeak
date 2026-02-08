import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';

/// Calculate word overlap between user answer and correct answer.
///
/// 1. Normalize: lowercase, remove punctuation.
/// 2. Split into words.
/// 3. Count matching words (user words found in correct).
/// 4. Score = matches / max(userWords, correctWords) * 100.
double _calculateWordOverlap(String userAnswer, String correctAnswer) {
  final userWords = _normalizeToWords(userAnswer);
  final correctWords = _normalizeToWords(correctAnswer);

  if (correctWords.isEmpty || userWords.isEmpty) return 0;

  var matchCount = 0;
  final used = <int>{};

  for (final uWord in userWords) {
    for (var i = 0; i < correctWords.length; i++) {
      if (!used.contains(i) && correctWords[i] == uWord) {
        matchCount++;
        used.add(i);
        break;
      }
    }
  }

  final denominator = math.max(userWords.length, correctWords.length);
  return (matchCount / denominator) * 100;
}

List<String> _normalizeToWords(String text) {
  return text
      .toLowerCase()
      .replaceAll(RegExp(r'[.,!?;:()\-]'), '')
      .split(RegExp(r'\s+'))
      .where((w) => w.isNotEmpty)
      .toList();
}

/// Translation quiz: shows Korean sentence, user types English translation.
///
/// Uses word overlap scoring to evaluate the answer.
/// >= 80%: quality 5, >= 50%: quality 3, < 50%: quality 1.
class TranslationQuiz extends StatefulWidget {
  final String sentence;
  final String translation;
  final void Function(int quality) onAnswer;

  const TranslationQuiz({
    super.key,
    required this.sentence,
    required this.translation,
    required this.onAnswer,
  });

  @override
  State<TranslationQuiz> createState() => _TranslationQuizState();
}

class _TranslationQuizState extends State<TranslationQuiz> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  bool _submitted = false;
  double _overlap = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void didUpdateWidget(TranslationQuiz oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.sentence != widget.sentence) {
      _controller.clear();
      _submitted = false;
      _overlap = 0;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _focusNode.requestFocus();
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    if (_controller.text.trim().isEmpty || _submitted) return;

    final pct = _calculateWordOverlap(_controller.text, widget.sentence);

    int quality;
    if (pct >= 80) {
      quality = 5;
    } else if (pct >= 50) {
      quality = 3;
    } else {
      quality = 1;
    }

    setState(() {
      _submitted = true;
      _overlap = pct;
    });

    widget.onAnswer(quality);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 24),

        // Instruction
        Text(
          '한국어를 보고 영어로 작성하세요',
          style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w500),
        ),

        const SizedBox(height: 24),

        // Korean sentence display
        Container(
          width: double.infinity,
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
            boxShadow: [
              BoxShadow(
                color: AppColors.textPrimary.withValues(alpha: 0.04),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            widget.translation,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
        ),

        const SizedBox(height: 20),

        // Text area input
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: TextField(
            controller: _controller,
            focusNode: _focusNode,
            enabled: !_submitted,
            autocorrect: false,
            enableSuggestions: false,
            textCapitalization: TextCapitalization.none,
            maxLines: 3,
            onChanged: (_) => setState(() {}),
            style: const TextStyle(
              fontSize: 15,
              color: AppColors.textPrimary,
              height: 1.5,
            ),
            decoration: InputDecoration(
              hintText: '영어로 번역하세요',
              hintStyle: AppTypography.bodySmall.copyWith(
                color: AppColors.textTertiary,
              ),
              filled: true,
              fillColor: _submitted ? _getResultBg() : AppColors.inputBg,
              contentPadding: const EdgeInsets.all(16),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
                borderSide: BorderSide.none,
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
                borderSide: const BorderSide(
                  color: AppColors.primary,
                  width: 2,
                ),
              ),
              disabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
                borderSide: BorderSide(
                  color: _getResultBorderColor(),
                  width: 2,
                ),
              ),
            ),
          ),
        ),

        const SizedBox(height: 20),

        // Submit button
        if (!_submitted)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _controller.text.trim().isNotEmpty
                    ? _handleSubmit
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _controller.text.trim().isNotEmpty
                      ? AppColors.primary
                      : AppColors.border,
                  foregroundColor: _controller.text.trim().isNotEmpty
                      ? AppColors.surface
                      : AppColors.textSecondary,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
                  ),
                ),
                child: Text(
                  '확인',
                  style: AppTypography.button.copyWith(
                    color: _controller.text.trim().isNotEmpty
                        ? AppColors.surface
                        : AppColors.textSecondary,
                  ),
                ),
              ),
            ),
          ),

        // Result feedback
        if (_submitted) _buildResult(),
      ],
    );
  }

  Color _getResultBg() {
    if (_overlap >= 80) return const Color(0xFFF0FDF4);
    if (_overlap >= 50) return const Color(0xFFFFFBEB);
    return const Color(0xFFFEF2F2);
  }

  Color _getResultBorderColor() {
    if (_overlap >= 80) return AppColors.success;
    if (_overlap >= 50) return AppColors.warning;
    return AppColors.error;
  }

  Widget _buildResult() {
    String label;
    Color color;

    if (_overlap >= 80) {
      label = '훌륭해요!';
      color = AppColors.success;
    } else if (_overlap >= 50) {
      label = '좋아요!';
      color = AppColors.warning;
    } else {
      label = '더 연습해봐요';
      color = AppColors.error;
    }

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, 8 * (1 - value)),
            child: child,
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          children: [
            const SizedBox(height: 16),

            // Feedback label + percentage
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: color,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '(${_overlap.round()}%)',
                  style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Overlap indicator
            Container(
              width: double.infinity,
              height: 6,
              decoration: BoxDecoration(
                color: AppColors.borderLight,
                borderRadius: BorderRadius.circular(3),
              ),
              child: FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: (_overlap / 100).clamp(0.0, 1.0),
                child: Container(
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 4),

            // Overlap text
            Align(
              alignment: Alignment.centerRight,
              child: Text(
                '일치율: ${_overlap.round()}%',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: color,
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Correct answer display
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primaryTint,
                borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '정답',
                    style: AppTypography.caption.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.sentence,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: AppColors.primary,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
