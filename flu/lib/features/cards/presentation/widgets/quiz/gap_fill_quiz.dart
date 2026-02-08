import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';

/// Data model for sentence-based quizzes.
class SentenceQuizData {
  final String sentence;
  final String translation;
  final int mastery;

  const SentenceQuizData({
    required this.sentence,
    required this.translation,
    this.mastery = 0,
  });
}

/// A segment of the sentence: either plain text or a gap to fill.
class _GapSegment {
  final bool isGap;
  final String value;
  final int? gapIndex;

  const _GapSegment({required this.isGap, required this.value, this.gapIndex});
}

/// Common English stop words that should not be selected as gap words.
const _stopWords = <String>{
  'the',
  'a',
  'an',
  'is',
  'are',
  'was',
  'were',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'and',
  'but',
  'or',
  'it',
  'he',
  'she',
  'they',
  'we',
  'i',
  'my',
  'your',
  'his',
  'her',
  'its',
  'this',
  'that',
  'be',
  'am',
  'do',
  'does',
  'did',
  'has',
  'have',
  'had',
  'not',
  'no',
};

/// Gap-fill quiz: sentence with 1-2 key words replaced by inline TextFields.
///
/// Displays the sentence with blanks. User fills in the missing words.
/// After submission, shows colored feedback based on correctness.
class GapFillQuiz extends StatefulWidget {
  final String sentence;
  final String translation;
  final void Function(int quality) onAnswer;
  final VoidCallback? onSpeak;

  const GapFillQuiz({
    super.key,
    required this.sentence,
    required this.translation,
    required this.onAnswer,
    this.onSpeak,
  });

  @override
  State<GapFillQuiz> createState() => _GapFillQuizState();
}

class _GapFillQuizState extends State<GapFillQuiz> {
  late List<String> _keyWords;
  late List<_GapSegment> _segments;
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;

  bool _submitted = false;
  Map<int, bool> _gapResults = {};

  @override
  void initState() {
    super.initState();
    _buildQuiz();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_focusNodes.isNotEmpty) {
        _focusNodes[0].requestFocus();
      }
    });
  }

  @override
  void didUpdateWidget(GapFillQuiz oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.sentence != widget.sentence) {
      _disposeControllers();
      _submitted = false;
      _gapResults = {};
      _buildQuiz();
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_focusNodes.isNotEmpty) {
          _focusNodes[0].requestFocus();
        }
      });
    }
  }

  @override
  void dispose() {
    _disposeControllers();
    super.dispose();
  }

  void _disposeControllers() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
  }

  void _buildQuiz() {
    _keyWords = _extractKeyWords(widget.sentence);
    _segments = _buildSegments(widget.sentence, _keyWords);

    final gapCount = _segments.where((s) => s.isGap).length;
    _controllers = List.generate(gapCount, (_) => TextEditingController());
    _focusNodes = List.generate(gapCount, (_) => FocusNode());
  }

  /// Extract 1-2 key words from the sentence.
  /// Filters out stop words and short words (<=3 chars).
  List<String> _extractKeyWords(String sentence) {
    final cleaned = sentence.replaceAll(RegExp(r"[.,!?;:'\x22()\-]"), '');
    final words = cleaned.split(RegExp(r'\s+'));
    final candidates = words.where((w) {
      return w.length > 3 && !_stopWords.contains(w.toLowerCase());
    }).toList();

    if (candidates.isEmpty) {
      // Fallback: pick longest word
      final sorted = List<String>.from(words)
        ..sort((a, b) => b.length.compareTo(a.length));
      return sorted.take(1).toList();
    }

    // Shuffle and take up to 2
    candidates.shuffle();
    return candidates.take(math.min(2, candidates.length)).toList();
  }

  /// Build segments by splitting the sentence around key words.
  List<_GapSegment> _buildSegments(String sentence, List<String> keyWords) {
    final result = <_GapSegment>[];
    var remaining = sentence;
    var gapIndex = 0;

    for (final kw in keyWords) {
      final escapedKw = RegExp.escape(kw);
      final regex = RegExp(escapedKw, caseSensitive: false);
      final match = regex.firstMatch(remaining);

      if (match != null) {
        // Text before the gap
        if (match.start > 0) {
          result.add(
            _GapSegment(
              isGap: false,
              value: remaining.substring(0, match.start),
            ),
          );
        }
        // The gap itself
        result.add(
          _GapSegment(isGap: true, value: match.group(0)!, gapIndex: gapIndex),
        );
        gapIndex++;
        remaining = remaining.substring(match.end);
      }
    }

    // Remaining text after last gap
    if (remaining.isNotEmpty) {
      result.add(_GapSegment(isGap: false, value: remaining));
    }

    return result;
  }

  int get _gapCount => _segments.where((s) => s.isGap).length;

  bool get _allFilled {
    for (final c in _controllers) {
      if (c.text.trim().isEmpty) return false;
    }
    return _controllers.isNotEmpty;
  }

  void _handleSubmit() {
    if (_submitted || !_allFilled) return;

    final results = <int, bool>{};
    var correctCount = 0;

    for (final seg in _segments) {
      if (seg.isGap && seg.gapIndex != null) {
        final userAnswer = _controllers[seg.gapIndex!].text
            .trim()
            .toLowerCase();
        final correctAnswer = seg.value.toLowerCase();
        final isCorrect = userAnswer == correctAnswer;
        results[seg.gapIndex!] = isCorrect;
        if (isCorrect) correctCount++;
      }
    }

    setState(() {
      _gapResults = results;
      _submitted = true;
    });

    widget.onSpeak?.call();

    int quality;
    if (correctCount == _gapCount) {
      quality = 5;
    } else if (correctCount > 0) {
      quality = 3;
    } else {
      quality = 1;
    }

    widget.onAnswer(quality);
  }

  void _handleKeySubmit(int gapIndex) {
    if (gapIndex < _gapCount - 1) {
      _focusNodes[gapIndex + 1].requestFocus();
    } else {
      _handleSubmit();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 24),

        // Instruction
        Text(
          '빈칸에 알맞은 단어를 입력하세요',
          style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w500),
        ),

        const SizedBox(height: 24),

        // Sentence with gaps
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
          child: Wrap(
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 0,
            runSpacing: 12,
            children: _segments.map((seg) {
              if (!seg.isGap) {
                return Text(
                  seg.value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                    height: 1.6,
                  ),
                );
              }

              final gapIdx = seg.gapIndex!;
              final isCorrect = _gapResults[gapIdx];
              final inputWidth = math.max(80.0, seg.value.length * 12.0);

              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      width: inputWidth,
                      child: TextField(
                        controller: _controllers[gapIdx],
                        focusNode: _focusNodes[gapIdx],
                        enabled: !_submitted,
                        autocorrect: false,
                        enableSuggestions: false,
                        textCapitalization: TextCapitalization.none,
                        textAlign: TextAlign.center,
                        textInputAction: gapIdx < _gapCount - 1
                            ? TextInputAction.next
                            : TextInputAction.done,
                        onSubmitted: (_) => _handleKeySubmit(gapIdx),
                        onChanged: (_) => setState(() {}),
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: _submitted
                              ? (isCorrect == true
                                    ? AppColors.success
                                    : AppColors.error)
                              : AppColors.textPrimary,
                        ),
                        decoration: InputDecoration(
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 6,
                          ),
                          border: UnderlineInputBorder(
                            borderSide: BorderSide(
                              color: _submitted
                                  ? (isCorrect == true
                                        ? AppColors.success
                                        : AppColors.error)
                                  : AppColors.primary,
                              width: 2,
                            ),
                          ),
                          enabledBorder: UnderlineInputBorder(
                            borderSide: BorderSide(
                              color: _submitted
                                  ? (isCorrect == true
                                        ? AppColors.success
                                        : AppColors.error)
                                  : AppColors.primary,
                              width: 2,
                            ),
                          ),
                          focusedBorder: const UnderlineInputBorder(
                            borderSide: BorderSide(
                              color: AppColors.primary,
                              width: 2,
                            ),
                          ),
                          disabledBorder: UnderlineInputBorder(
                            borderSide: BorderSide(
                              color: isCorrect == true
                                  ? AppColors.success
                                  : AppColors.error,
                              width: 2,
                            ),
                          ),
                        ),
                      ),
                    ),
                    // Show correct answer when wrong
                    if (_submitted && isCorrect == false)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          seg.value,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),

        const SizedBox(height: 16),

        // Translation hint
        Container(
          width: double.infinity,
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.inputBg,
            borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
          ),
          child: Text(
            widget.translation,
            style: AppTypography.bodySmall.copyWith(color: AppColors.textLink),
            textAlign: TextAlign.center,
          ),
        ),

        const SizedBox(height: 24),

        // Submit / Feedback
        if (!_submitted)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _allFilled ? _handleSubmit : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _allFilled
                      ? AppColors.primary
                      : AppColors.border,
                  foregroundColor: _allFilled
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
                    color: _allFilled
                        ? AppColors.surface
                        : AppColors.textSecondary,
                  ),
                ),
              ),
            ),
          ),

        if (_submitted) _buildFeedback(),
      ],
    );
  }

  Widget _buildFeedback() {
    final allCorrect = _gapResults.values.every((v) => v);
    final someCorrect = _gapResults.values.any((v) => v);

    String message;
    Color color;

    if (allCorrect) {
      message = '완벽해요!';
      color = AppColors.success;
    } else if (someCorrect) {
      message = '거의 맞았어요!';
      color = AppColors.warning;
    } else {
      message = '틀렸어요';
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
        padding: const EdgeInsets.only(top: 16),
        child: Text(
          message,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
      ),
    );
  }
}
