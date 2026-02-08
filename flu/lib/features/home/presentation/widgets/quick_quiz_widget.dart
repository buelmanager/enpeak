import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/core/widgets/minimal_card.dart';
import 'package:flu/core/widgets/section_header.dart';

class QuickQuizWidget extends StatefulWidget {
  final String word;
  final List<String> options;
  final int correctIndex;
  final VoidCallback onNext;

  const QuickQuizWidget({
    super.key,
    required this.word,
    required this.options,
    required this.correctIndex,
    required this.onNext,
  });

  @override
  State<QuickQuizWidget> createState() => _QuickQuizWidgetState();
}

class _QuickQuizWidgetState extends State<QuickQuizWidget> {
  int? _selectedIndex;
  bool _answered = false;

  void _selectOption(int index) {
    if (_answered) return;
    setState(() {
      _selectedIndex = index;
      _answered = true;
    });
  }

  void _handleNext() {
    setState(() {
      _selectedIndex = null;
      _answered = false;
    });
    widget.onNext();
  }

  @override
  Widget build(BuildContext context) {
    return MinimalCard(
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          // Left accent bar (orange)
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            child: Container(
              width: 4,
              decoration: const BoxDecoration(
                color: AppColors.accentOrange,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(AppSpacing.radiusXxl),
                  bottomLeft: Radius.circular(AppSpacing.radiusXxl),
                ),
              ),
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(AppSpacing.xxl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionHeader(label: 'QUICK QUIZ'),
                Text(widget.word, style: AppTypography.titleLarge),
                const SizedBox(height: 12),
                ...List.generate(widget.options.length, (index) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: _buildOptionButton(index),
                  );
                }),
                if (_answered) ...[
                  const SizedBox(height: 4),
                  SizedBox(
                    width: double.infinity,
                    child: GestureDetector(
                      onTap: _handleNext,
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(
                            AppSpacing.radiusMd,
                          ),
                        ),
                        child: Text(
                          '\ub2e4\uc74c',
                          textAlign: TextAlign.center,
                          style: AppTypography.bodyMedium14.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOptionButton(int index) {
    Color bgColor = AppColors.inputBg;
    Color borderColor = AppColors.border;
    Color textColor = AppColors.textPrimary;

    if (_answered) {
      if (index == widget.correctIndex) {
        bgColor = AppColors.quizCorrectBg;
        borderColor = AppColors.quizCorrectBorder;
        textColor = AppColors.quizCorrectText;
      } else if (index == _selectedIndex) {
        bgColor = AppColors.quizWrongBg;
        borderColor = AppColors.quizWrongBorder;
        textColor = AppColors.quizWrongText;
      }
    }

    return GestureDetector(
      onTap: () => _selectOption(index),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: bgColor,
          border: Border.all(color: borderColor),
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        ),
        child: Text(
          widget.options[index],
          style: AppTypography.bodyMedium14.copyWith(color: textColor),
        ),
      ),
    );
  }
}
