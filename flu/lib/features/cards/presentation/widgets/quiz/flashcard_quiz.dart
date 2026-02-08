import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/vocabulary/domain/entities/word.dart';

/// Flashcard quiz with 3D flip animation and self-rating buttons.
///
/// Front: word + pronunciation + speaker button.
/// Back: meaning + example sentence + speaker button.
/// Tap to flip. After flip, 3 rating buttons appear below the card.
class FlashcardQuiz extends StatefulWidget {
  final Word word;
  final void Function(int quality) onRate;
  final VoidCallback? onSpeak;

  const FlashcardQuiz({
    super.key,
    required this.word,
    required this.onRate,
    this.onSpeak,
  });

  @override
  State<FlashcardQuiz> createState() => _FlashcardQuizState();
}

class _FlashcardQuizState extends State<FlashcardQuiz>
    with SingleTickerProviderStateMixin {
  late AnimationController _flipController;
  late Animation<double> _flipAnimation;
  bool _isFlipped = false;

  @override
  void initState() {
    super.initState();
    _flipController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _flipAnimation = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(CurvedAnimation(parent: _flipController, curve: Curves.easeOut));
  }

  @override
  void didUpdateWidget(FlashcardQuiz oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.word.word != widget.word.word) {
      _flipController.reset();
      setState(() => _isFlipped = false);
    }
  }

  @override
  void dispose() {
    _flipController.dispose();
    super.dispose();
  }

  void _handleFlip() {
    if (_isFlipped) return;
    _flipController.forward();
    setState(() => _isFlipped = true);
  }

  void _handleSpeak() {
    widget.onSpeak?.call();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // 3D Flip Card
        GestureDetector(
          onTap: _handleFlip,
          child: AnimatedBuilder(
            animation: _flipAnimation,
            builder: (context, child) {
              final angle = _flipAnimation.value * math.pi;
              final isFront = angle < math.pi / 2;

              return Transform(
                alignment: Alignment.center,
                transform: Matrix4.identity()
                  ..setEntry(3, 2, 0.001) // perspective ~1000px
                  ..rotateY(angle),
                child: isFront ? _buildFront() : _buildBack(),
              );
            },
          ),
        ),

        // Rating Buttons (shown after flip)
        if (_isFlipped) ...[const SizedBox(height: 24), _buildRatingButtons()],
      ],
    );
  }

  Widget _buildFront() {
    return _cardContainer(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Level badge
          if (widget.word.level != null) _buildLevelBadge(),
          if (widget.word.level != null) const SizedBox(height: 20),

          // Word
          Text(
            widget.word.word,
            style: AppTypography.display,
            textAlign: TextAlign.center,
          ),

          // Pronunciation
          if (widget.word.pronunciation != null) ...[
            const SizedBox(height: AppSpacing.md),
            Text(
              widget.word.pronunciation!,
              style: AppTypography.bodySmall.copyWith(
                fontStyle: FontStyle.italic,
              ),
            ),
          ],

          const SizedBox(height: AppSpacing.xl),

          // Speaker button
          _buildSpeakerButton(),

          const SizedBox(height: 20),

          // Hint
          Text(
            '탭하여 뜻 보기',
            style: AppTypography.caption.copyWith(
              color: AppColors.textSecondary.withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBack() {
    final firstExample = _getFirstExample();

    return Transform(
      alignment: Alignment.center,
      transform: Matrix4.identity()..rotateY(math.pi),
      child: _cardContainer(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Level badge
            if (widget.word.level != null) _buildLevelBadge(),
            if (widget.word.level != null) const SizedBox(height: 16),

            // Word (smaller on back)
            Text(
              widget.word.word,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: AppSpacing.md),

            // Meaning
            Text(
              widget.word.meaningKo,
              style: AppTypography.meaningText.copyWith(
                color: AppColors.primary,
              ),
              textAlign: TextAlign.center,
            ),

            // Example sentence
            if (firstExample != null) ...[
              const SizedBox(height: 16),
              const Divider(color: AppColors.borderLight),
              const SizedBox(height: 12),
              Text(
                firstExample,
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textLink,
                  height: 1.6,
                ),
                textAlign: TextAlign.center,
              ),
            ],

            const SizedBox(height: 16),

            // Speaker button
            _buildSpeakerButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildLevelBadge() {
    final level = widget.word.level!;
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
        decoration: BoxDecoration(
          color: AppColors.levelColor(level).withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          level,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: AppColors.levelColor(level),
          ),
        ),
      ),
    );
  }

  Widget _buildSpeakerButton() {
    return GestureDetector(
      onTap: _handleSpeak,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: AppColors.primaryTint,
          borderRadius: BorderRadius.circular(22),
        ),
        child: const Icon(Icons.volume_up, color: AppColors.primary, size: 22),
      ),
    );
  }

  Widget _buildRatingButtons() {
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
        child: Row(
          children: [
            // "모르겠어요" - quality 1
            Expanded(
              child: _RatingButton(
                label: '모르겠어요',
                filled: false,
                borderColor: AppColors.accentCoral,
                textColor: AppColors.accentCoral,
                onTap: () => widget.onRate(1),
              ),
            ),
            const SizedBox(width: AppSpacing.md),

            // "어려워요" - quality 3
            Expanded(
              child: _RatingButton(
                label: '어려워요',
                filled: false,
                borderColor: AppColors.accentOrange,
                textColor: AppColors.accentOrange,
                onTap: () => widget.onRate(3),
              ),
            ),
            const SizedBox(width: AppSpacing.md),

            // "알아요" - quality 5
            Expanded(
              child: _RatingButton(
                label: '알아요',
                filled: true,
                fillColor: AppColors.primary,
                textColor: AppColors.surface,
                onTap: () => widget.onRate(5),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String? _getFirstExample() {
    final examples = widget.word.examples;
    if (examples == null || examples.isEmpty) return null;
    final first = examples.first;
    return first['en'] ?? first['english'];
  }

  Widget _cardContainer({required Widget child}) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(minHeight: 240),
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusXxxl),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: AppColors.textPrimary.withValues(alpha: 0.06),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _RatingButton extends StatelessWidget {
  final String label;
  final bool filled;
  final Color? fillColor;
  final Color? borderColor;
  final Color textColor;
  final VoidCallback onTap;

  const _RatingButton({
    required this.label,
    required this.filled,
    this.fillColor,
    this.borderColor,
    required this.textColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 48,
        decoration: BoxDecoration(
          color: filled ? fillColor : Colors.transparent,
          borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
          border: filled ? null : Border.all(color: borderColor!, width: 1.5),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: textColor,
          ),
        ),
      ),
    );
  }
}
