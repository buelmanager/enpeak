import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/vocabulary/domain/entities/word.dart';

/// Spelling quiz widget.
///
/// Shows the Korean meaning and optionally a masked example sentence.
/// The user types the English word; fuzzy matching via Levenshtein distance
/// determines quality: exact (5), close (3), wrong (1).
class SpellingQuiz extends StatefulWidget {
  final Word word;
  final void Function(int quality) onAnswer;

  const SpellingQuiz({super.key, required this.word, required this.onAnswer});

  @override
  State<SpellingQuiz> createState() => _SpellingQuizState();
}

enum _ResultType { correct, close, wrong }

class _SpellingQuizState extends State<SpellingQuiz>
    with SingleTickerProviderStateMixin {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();

  bool _submitted = false;
  _ResultType? _resultType;

  late final AnimationController _fadeController;
  late final Animation<double> _fadeAnimation;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.15),
      end: Offset.zero,
    ).animate(_fadeAnimation);

    // Auto-focus after build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  /// Build a masked example sentence with the target word replaced by "___".
  String? get _maskedExample {
    final examples = widget.word.examples;
    if (examples == null || examples.isEmpty) return null;

    final example = examples.first;
    final sentence = example['en'] ?? example['english'] ?? '';
    if (sentence.isEmpty) return null;

    final pattern = RegExp(
      RegExp.escape(widget.word.word),
      caseSensitive: false,
    );
    return sentence.replaceAll(pattern, '___');
  }

  void _handleSubmit() {
    final text = _controller.text.trim();
    if (text.isEmpty || _submitted) return;

    setState(() {
      _submitted = true;

      final userAnswer = text.toLowerCase();
      final correctAnswer = widget.word.word.toLowerCase();

      if (userAnswer == correctAnswer) {
        _resultType = _ResultType.correct;
      } else {
        final distance = _levenshteinDistance(userAnswer, correctAnswer);
        _resultType = distance <= 2 ? _ResultType.close : _ResultType.wrong;
      }
    });

    _fadeController.forward();
  }

  void _handleContinue() {
    final quality = switch (_resultType) {
      _ResultType.correct => 5,
      _ResultType.close => 3,
      _ResultType.wrong => 1,
      null => 1,
    };
    widget.onAnswer(quality);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 32),

        // Instruction
        Text(
          '뜻을 보고 영단어를 입력하세요',
          style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w500),
        ),

        const SizedBox(height: 12),

        // Korean meaning
        Text(
          widget.word.meaningKo,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
          textAlign: TextAlign.center,
        ),

        const SizedBox(height: 24),

        // Masked example sentence
        if (_maskedExample != null)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            margin: const EdgeInsets.symmetric(horizontal: 24),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: AppSpacing.borderRadiusXxl,
            ),
            child: Text(
              _maskedExample!,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                fontStyle: FontStyle.italic,
                height: 1.6,
              ),
              textAlign: TextAlign.center,
            ),
          ),

        if (_maskedExample != null) const SizedBox(height: 24),

        // Text input
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: TextField(
            controller: _controller,
            focusNode: _focusNode,
            enabled: !_submitted,
            textAlign: TextAlign.center,
            autocorrect: false,
            enableSuggestions: false,
            textCapitalization: TextCapitalization.none,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
            decoration: InputDecoration(
              hintText: '단어를 입력하세요',
              hintStyle: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w400,
                color: AppColors.textSecondary.withValues(alpha: 0.5),
              ),
              filled: true,
              fillColor: _submitted ? _resultBgColor : AppColors.inputBg,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 20,
                vertical: 18,
              ),
              border: OutlineInputBorder(
                borderRadius: AppSpacing.borderRadiusXxl,
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: AppSpacing.borderRadiusXxl,
                borderSide: BorderSide.none,
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: AppSpacing.borderRadiusXxl,
                borderSide: const BorderSide(
                  color: AppColors.primary,
                  width: 2,
                ),
              ),
              disabledBorder: OutlineInputBorder(
                borderRadius: AppSpacing.borderRadiusXxl,
                borderSide: BorderSide(color: _resultBorderColor, width: 2),
              ),
            ),
            onSubmitted: (_) => _handleSubmit(),
            inputFormatters: [FilteringTextInputFormatter.deny(RegExp(r'\n'))],
          ),
        ),

        const SizedBox(height: 16),

        // Check / Continue button
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: _submitted ? _buildContinueButton() : _buildCheckButton(),
        ),

        // Feedback
        if (_submitted) ...[
          const SizedBox(height: 24),
          SlideTransition(
            position: _slideAnimation,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: _buildFeedback(),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildCheckButton() {
    return ValueListenableBuilder<TextEditingValue>(
      valueListenable: _controller,
      builder: (context, value, _) {
        final hasText = value.text.trim().isNotEmpty;
        return SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton(
            onPressed: hasText ? _handleSubmit : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: hasText ? AppColors.primary : AppColors.border,
              foregroundColor: hasText ? Colors.white : AppColors.textSecondary,
              disabledBackgroundColor: AppColors.border,
              disabledForegroundColor: AppColors.textSecondary,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: AppSpacing.borderRadiusXxl,
              ),
            ),
            child: const Text(
              '확인',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
          ),
        );
      },
    );
  }

  Widget _buildContinueButton() {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton(
        onPressed: _handleContinue,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusXxl,
          ),
        ),
        child: const Text(
          '다음',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }

  Widget _buildFeedback() {
    return Column(
      children: [
        if (_resultType == _ResultType.correct) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(
                  color: AppColors.success,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: Colors.white, size: 16),
              ),
              const SizedBox(width: 8),
              const Text(
                '정답!',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.success,
                ),
              ),
            ],
          ),
        ],
        if (_resultType == _ResultType.close) ...[
          const Text(
            '거의 맞았어요!',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.warning,
            ),
          ),
        ],
        if (_resultType == _ResultType.wrong) ...[
          const Text(
            '틀렸어요',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.error,
            ),
          ),
        ],

        const SizedBox(height: 12),

        // Always show the correct word after submission
        Text(
          widget.word.word,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: AppColors.success,
          ),
        ),

        if (_resultType != _ResultType.correct) ...[
          const SizedBox(height: 4),
          Text(
            '정답',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ],
    );
  }

  Color get _resultBgColor {
    return switch (_resultType) {
      _ResultType.correct => AppColors.quizCorrectBg,
      _ResultType.close => const Color(0xFFFFF8E1),
      _ResultType.wrong => AppColors.quizWrongBg,
      null => AppColors.inputBg,
    };
  }

  Color get _resultBorderColor {
    return switch (_resultType) {
      _ResultType.correct => AppColors.success,
      _ResultType.close => AppColors.warning,
      _ResultType.wrong => AppColors.error,
      null => AppColors.border,
    };
  }
}

/// Standard Levenshtein distance algorithm.
///
/// Computes the minimum number of single-character edits (insertions,
/// deletions, or substitutions) required to change [a] into [b].
/// Time complexity: O(n * m), space complexity: O(n * m).
int _levenshteinDistance(String a, String b) {
  final m = a.length;
  final n = b.length;

  // Create a (m+1) x (n+1) matrix
  final dp = List.generate(m + 1, (_) => List.filled(n + 1, 0));

  for (var i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (var j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (var i = 1; i <= m; i++) {
    for (var j = 1; j <= n; j++) {
      if (a[i - 1] == b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] =
            1 +
            math.min(dp[i - 1][j], math.min(dp[i][j - 1], dp[i - 1][j - 1]));
      }
    }
  }

  return dp[m][n];
}
