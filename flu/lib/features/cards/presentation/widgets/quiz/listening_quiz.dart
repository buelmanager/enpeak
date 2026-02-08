import 'dart:math';

import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/core/widgets/tap_scale.dart';
import 'package:flu/features/vocabulary/domain/entities/word.dart';

/// Listening quiz widget.
///
/// Plays the word via TTS and shows 4 Korean meaning choices.
/// Audio auto-plays on mount. Choices are disabled until first play completes.
class ListeningQuiz extends StatefulWidget {
  final Word word;
  final List<Word> allWords;
  final void Function(bool correct) onAnswer;
  final VoidCallback onSpeak;
  final bool isSpeaking;

  const ListeningQuiz({
    super.key,
    required this.word,
    required this.allWords,
    required this.onAnswer,
    required this.onSpeak,
    required this.isSpeaking,
  });

  @override
  State<ListeningQuiz> createState() => _ListeningQuizState();
}

class _ListeningQuizState extends State<ListeningQuiz>
    with TickerProviderStateMixin {
  late final List<String> _choices;
  late final int _correctIndex;

  int? _selectedIndex;
  bool _answered = false;
  bool _hasPlayed = false;

  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnimation;
  late final AnimationController _fadeController;
  late final Animation<double> _fadeAnimation;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();

    _buildChoices();

    // Pulse animation for play button while speaking
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    // Feedback fade-in
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

    // Auto-play on mount
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _handlePlay();
    });
  }

  @override
  void didUpdateWidget(ListeningQuiz oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Start/stop pulse when speaking state changes
    if (widget.isSpeaking && !_pulseController.isAnimating) {
      _pulseController.repeat(reverse: true);
    } else if (!widget.isSpeaking && _pulseController.isAnimating) {
      _pulseController.stop();
      _pulseController.animateTo(0.0);
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  void _buildChoices() {
    final rng = Random();

    // Get wrong answers from the word pool
    final others = widget.allWords
        .where((w) => w.word.toLowerCase() != widget.word.word.toLowerCase())
        .toList();
    others.shuffle(rng);

    final wrongMeanings = others.take(3).map((w) => w.meaningKo).toList();

    // Pad with numbered fallbacks if not enough words
    while (wrongMeanings.length < 3) {
      wrongMeanings.add(
        '(${wrongMeanings.length + 1}) ${widget.word.meaningKo}',
      );
    }

    // Combine and shuffle
    final combined = [widget.word.meaningKo, ...wrongMeanings];
    combined.shuffle(rng);

    _choices = combined;
    _correctIndex = _choices.indexOf(widget.word.meaningKo);
  }

  void _handlePlay() {
    widget.onSpeak();
    setState(() {
      _hasPlayed = true;
    });
    // Start pulse
    if (!_pulseController.isAnimating) {
      _pulseController.repeat(reverse: true);
    }
  }

  void _handleSelect(int index) {
    if (_answered || !_hasPlayed) return;

    setState(() {
      _selectedIndex = index;
      _answered = true;
    });

    _fadeController.forward();
    // Stop pulse
    _pulseController.stop();
    _pulseController.animateTo(0.0);
  }

  void _handleContinue() {
    final isCorrect = _selectedIndex == _correctIndex;
    widget.onAnswer(isCorrect);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 32),

        // Instruction
        Text(
          '듣고 맞는 단어를 고르세요',
          style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w500),
        ),

        const SizedBox(height: 24),

        // Large play button
        TapScale(
          onTap: _handlePlay,
          child: AnimatedBuilder(
            animation: _pulseAnimation,
            builder: (context, child) {
              return Transform.scale(
                scale: widget.isSpeaking ? _pulseAnimation.value : 1.0,
                child: child,
              );
            },
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: widget.isSpeaking
                    ? AppColors.primary
                    : AppColors.primaryTint,
                shape: BoxShape.circle,
                boxShadow: widget.isSpeaking
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.3),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ]
                    : null,
              ),
              child: Icon(
                widget.isSpeaking ? Icons.volume_up : Icons.volume_up_outlined,
                size: 36,
                color: widget.isSpeaking ? Colors.white : AppColors.primary,
              ),
            ),
          ),
        ),

        // Replay button
        if (_hasPlayed && !_answered) ...[
          const SizedBox(height: 12),
          GestureDetector(
            onTap: widget.isSpeaking ? null : _handlePlay,
            child: Text(
              '다시 듣기',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: widget.isSpeaking
                    ? AppColors.textSecondary
                    : AppColors.primary,
              ),
            ),
          ),
        ],

        const SizedBox(height: 32),

        // 4 answer choices
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: List.generate(_choices.length, (index) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildChoiceButton(index),
              );
            }),
          ),
        ),

        // Feedback
        if (_answered) ...[
          const SizedBox(height: 20),
          SlideTransition(
            position: _slideAnimation,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: _buildFeedback(),
            ),
          ),
          const SizedBox(height: 20),
          // Continue button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: SizedBox(
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
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildChoiceButton(int index) {
    final isDisabled = !_hasPlayed;
    final isCorrect = index == _correctIndex;
    final isSelected = index == _selectedIndex;

    // Determine styling
    Color bgColor;
    Color borderColor;
    Color textColor;
    Color circleColor;
    Color circleTextColor;

    if (!_answered) {
      // Pre-answer state
      bgColor = isDisabled
          ? AppColors.inputBg.withValues(alpha: 0.3)
          : AppColors.surface;
      borderColor = isDisabled
          ? AppColors.borderLight.withValues(alpha: 0.3)
          : AppColors.border;
      textColor = isDisabled
          ? AppColors.textSecondary.withValues(alpha: 0.3)
          : AppColors.textPrimary;
      circleColor = isDisabled
          ? AppColors.borderLight.withValues(alpha: 0.3)
          : AppColors.inputBg;
      circleTextColor = isDisabled
          ? AppColors.textSecondary.withValues(alpha: 0.3)
          : AppColors.textSecondary;
    } else if (isCorrect) {
      bgColor = AppColors.quizCorrectBg;
      borderColor = AppColors.success;
      textColor = const Color(0xFF059669);
      circleColor = AppColors.success;
      circleTextColor = Colors.white;
    } else if (isSelected && !isCorrect) {
      bgColor = AppColors.quizWrongBg;
      borderColor = AppColors.error;
      textColor = AppColors.error;
      circleColor = AppColors.error;
      circleTextColor = Colors.white;
    } else {
      // Other unselected options after answer
      bgColor = AppColors.surface;
      borderColor = AppColors.border;
      textColor = AppColors.textSecondary.withValues(alpha: 0.5);
      circleColor = AppColors.inputBg;
      circleTextColor = AppColors.textSecondary.withValues(alpha: 0.5);
    }

    return GestureDetector(
      onTap: (_answered || isDisabled) ? null : () => _handleSelect(index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: AppSpacing.borderRadiusXxl,
          border: Border.all(color: borderColor, width: 2),
        ),
        child: Row(
          children: [
            // Numbered circle
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: circleColor,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  '${index + 1}',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: circleTextColor,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            // Choice text
            Expanded(
              child: Text(
                _choices[index],
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: textColor,
                ),
              ),
            ),
            // Check/cross icon after answer
            if (_answered && isCorrect)
              const Icon(
                Icons.check_circle,
                color: AppColors.success,
                size: 22,
              ),
            if (_answered && isSelected && !isCorrect)
              const Icon(Icons.cancel, color: AppColors.error, size: 22),
          ],
        ),
      ),
    );
  }

  Widget _buildFeedback() {
    final isCorrect = _selectedIndex == _correctIndex;

    return Column(
      children: [
        if (isCorrect)
          const Text(
            '정답!',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.success,
            ),
          )
        else ...[
          const Text(
            '틀렸어요',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.error,
            ),
          ),
          const SizedBox(height: 4),
          Text('정답: ${widget.word.meaningKo}', style: AppTypography.bodySmall),
        ],
        const SizedBox(height: 8),
        Text(
          widget.word.word,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
        ),
      ],
    );
  }
}
