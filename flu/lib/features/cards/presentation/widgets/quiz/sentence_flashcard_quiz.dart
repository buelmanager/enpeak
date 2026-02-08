import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';

/// Sentence flashcard quiz with 3D card flip animation.
///
/// Front: English sentence + speaker button.
/// Back: English sentence (top) + Korean translation (center) + speaker button.
/// Tap to flip. After flip, 3 self-rating buttons appear below the card.
class SentenceFlashcardQuiz extends StatefulWidget {
  final String sentence;
  final String translation;
  final void Function(int quality) onRate;
  final VoidCallback? onSpeak;

  const SentenceFlashcardQuiz({
    super.key,
    required this.sentence,
    required this.translation,
    required this.onRate,
    this.onSpeak,
  });

  @override
  State<SentenceFlashcardQuiz> createState() => _SentenceFlashcardQuizState();
}

class _SentenceFlashcardQuizState extends State<SentenceFlashcardQuiz>
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
  void didUpdateWidget(SentenceFlashcardQuiz oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.sentence != widget.sentence) {
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
          // English sentence
          Text(
            widget.sentence,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: 20),

          // Speaker button
          _buildSpeakerButton(),

          const SizedBox(height: 20),

          // Hint
          Text(
            '탭하여 해석 보기',
            style: AppTypography.caption.copyWith(
              color: AppColors.textSecondary.withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBack() {
    return Transform(
      alignment: Alignment.center,
      transform: Matrix4.identity()..rotateY(math.pi),
      child: _cardContainer(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // English sentence (smaller on back)
            Text(
              widget.sentence,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w400,
                color: AppColors.textLink,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 12),

            // Korean translation (primary color, larger)
            Text(
              widget.translation,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 16),

            // Speaker button
            _buildSpeakerButton(),
          ],
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
            // "모르겠어요" - quality 1 (coral outlined)
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

            // "어려워요" - quality 3 (orange outlined)
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

            // "알아요" - quality 5 (teal filled)
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

  Widget _cardContainer({required Widget child}) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(minHeight: 200),
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
