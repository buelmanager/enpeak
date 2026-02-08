import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/vocabulary/domain/entities/word.dart';

/// Multiple-choice quiz with 4 options and visual feedback.
///
/// Displays the word and pronunciation, then 4 answer buttons (1 correct
/// + 3 wrong from [allWords] pool). After selection, shows correct/wrong
/// feedback with color coding and auto-advances after 1.2 seconds.
class MultipleChoiceQuiz extends StatefulWidget {
  final Word word;
  final List<Word> allWords;
  final void Function(bool correct) onAnswer;
  final VoidCallback? onSpeak;

  const MultipleChoiceQuiz({
    super.key,
    required this.word,
    required this.allWords,
    required this.onAnswer,
    this.onSpeak,
  });

  @override
  State<MultipleChoiceQuiz> createState() => _MultipleChoiceQuizState();
}

class _MultipleChoiceQuizState extends State<MultipleChoiceQuiz> {
  late List<String> _choices;
  late int _correctIndex;
  int? _selectedIndex;
  bool _answered = false;
  Timer? _advanceTimer;

  @override
  void initState() {
    super.initState();
    _generateChoices();
  }

  @override
  void didUpdateWidget(MultipleChoiceQuiz oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.word.word != widget.word.word) {
      _advanceTimer?.cancel();
      _selectedIndex = null;
      _answered = false;
      _generateChoices();
    }
  }

  @override
  void dispose() {
    _advanceTimer?.cancel();
    super.dispose();
  }

  void _generateChoices() {
    final rng = Random();
    final correctMeaning = widget.word.meaningKo;

    // Collect wrong answers from other words
    final others =
        widget.allWords
            .where(
              (w) => w.word.toLowerCase() != widget.word.word.toLowerCase(),
            )
            .toList()
          ..shuffle(rng);

    final wrongMeanings = <String>[];
    for (final w in others) {
      if (wrongMeanings.length >= 3) break;
      if (w.meaningKo != correctMeaning &&
          !wrongMeanings.contains(w.meaningKo)) {
        wrongMeanings.add(w.meaningKo);
      }
    }

    // Pad if not enough unique wrong answers
    var counter = 1;
    while (wrongMeanings.length < 3) {
      wrongMeanings.add('($counter) $correctMeaning');
      counter++;
    }

    // Shuffle all choices
    final allChoices = [correctMeaning, ...wrongMeanings]..shuffle(rng);
    setState(() {
      _choices = allChoices;
      _correctIndex = allChoices.indexOf(correctMeaning);
    });
  }

  void _handleSelect(int index) {
    if (_answered) return;

    final isCorrect = index == _correctIndex;

    setState(() {
      _selectedIndex = index;
      _answered = true;
    });

    widget.onSpeak?.call();

    _advanceTimer = Timer(const Duration(milliseconds: 1200), () {
      if (mounted) {
        widget.onAnswer(isCorrect);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 32),

        // Question label
        Text(
          '이 단어의 뜻은?',
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),

        const SizedBox(height: AppSpacing.md),

        // Word
        Text(
          widget.word.word,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w600,
            color: AppColors.primary,
          ),
          textAlign: TextAlign.center,
        ),

        // Pronunciation
        if (widget.word.pronunciation != null) ...[
          const SizedBox(height: 4),
          Text(
            widget.word.pronunciation!,
            style: AppTypography.greeting.copyWith(fontStyle: FontStyle.italic),
          ),
        ],

        const SizedBox(height: 32),

        // 4 answer buttons
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: List.generate(_choices.length, (index) {
              return Padding(
                padding: EdgeInsets.only(
                  bottom: index < _choices.length - 1 ? AppSpacing.md : 0,
                ),
                child: _buildChoiceButton(index),
              );
            }),
          ),
        ),

        // Feedback text
        if (_answered) ...[
          const SizedBox(height: 20),
          TweenAnimationBuilder<double>(
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
            child: _selectedIndex == _correctIndex
                ? const Text(
                    '정답!',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.quizCorrectText,
                    ),
                  )
                : Text(
                    '정답: ${widget.word.meaningKo}',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppColors.quizWrongText,
                    ),
                  ),
          ),
        ],
      ],
    );
  }

  Widget _buildChoiceButton(int index) {
    final isCorrect = index == _correctIndex;
    final isSelected = index == _selectedIndex;

    // Determine visual state
    Color bgColor;
    Color borderColor;
    Color textColor;
    double opacity;

    if (!_answered) {
      bgColor = AppColors.surface;
      borderColor = AppColors.border;
      textColor = AppColors.textPrimary;
      opacity = 1.0;
    } else if (isCorrect) {
      bgColor = AppColors.quizCorrectBg;
      borderColor = AppColors.quizCorrectBorder;
      textColor = AppColors.quizCorrectText;
      opacity = 1.0;
    } else if (isSelected) {
      bgColor = AppColors.quizWrongBg;
      borderColor = AppColors.quizWrongBorder;
      textColor = AppColors.quizWrongText;
      opacity = 1.0;
    } else {
      bgColor = AppColors.surface;
      borderColor = AppColors.border;
      textColor = AppColors.textSecondary;
      opacity = 0.5;
    }

    // Number circle content
    Widget numberContent;
    Color circleBg;
    Color circleFg;

    if (_answered && isCorrect) {
      circleBg = AppColors.quizCorrectText;
      circleFg = AppColors.surface;
      numberContent = Icon(Icons.check, size: 14, color: circleFg);
    } else if (_answered && isSelected && !isCorrect) {
      circleBg = AppColors.quizWrongText;
      circleFg = AppColors.surface;
      numberContent = Icon(Icons.close, size: 14, color: circleFg);
    } else {
      circleBg = _answered ? AppColors.borderLight : AppColors.inputBg;
      circleFg = _answered ? AppColors.textSecondary : AppColors.textLink;
      numberContent = Text(
        '${index + 1}',
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: circleFg,
        ),
      );
    }

    return GestureDetector(
      onTap: () => _handleSelect(index),
      child: Opacity(
        opacity: opacity,
        child: Container(
          width: double.infinity,
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            children: [
              // Number circle
              Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  color: circleBg,
                  shape: BoxShape.circle,
                  border: (!_answered || (!isCorrect && !isSelected))
                      ? Border.all(color: AppColors.border, width: 1)
                      : null,
                ),
                alignment: Alignment.center,
                child: numberContent,
              ),

              const SizedBox(width: 12),

              // Answer text
              Expanded(
                child: Text(
                  _choices[index],
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: textColor,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
