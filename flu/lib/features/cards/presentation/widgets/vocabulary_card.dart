import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/vocabulary/domain/entities/word.dart';
import 'package:flu/features/speech/presentation/widgets/tts_play_button.dart';
import '../providers/cards_state.dart';

class VocabularyCard extends ConsumerStatefulWidget {
  final Word word;
  final bool showMeaning;
  final HideMode hideMode;
  final VoidCallback onTap;

  const VocabularyCard({
    super.key,
    required this.word,
    required this.showMeaning,
    required this.hideMode,
    required this.onTap,
  });

  @override
  ConsumerState<VocabularyCard> createState() => _VocabularyCardState();
}

class _VocabularyCardState extends ConsumerState<VocabularyCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _flipController;
  late Animation<double> _flipAnimation;
  bool _showFront = true;

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
  void didUpdateWidget(VocabularyCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.word.word != widget.word.word) {
      _flipController.reset();
      _showFront = true;
    }
  }

  @override
  void dispose() {
    _flipController.dispose();
    super.dispose();
  }

  void _handleTap() {
    if (_showFront) {
      _flipController.forward();
    } else {
      _flipController.reverse();
    }
    _showFront = !_showFront;
    widget.onTap();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _handleTap,
      child: AnimatedBuilder(
        animation: _flipAnimation,
        builder: (context, child) {
          final angle = _flipAnimation.value * math.pi;
          final isFront = angle < math.pi / 2;

          return Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001)
              ..rotateY(angle),
            child: isFront ? _buildFront() : _buildBack(),
          );
        },
      ),
    );
  }

  Widget _buildFront() {
    final isHideMeaning = widget.hideMode == HideMode.hideMeaning;
    final isHideWord = widget.hideMode == HideMode.hideWord;
    final levelColor = widget.word.level != null
        ? AppColors.levelColor(widget.word.level!)
        : AppColors.primary;

    return _cardContainer(
      child: Stack(
        children: [
          // Level badge - top left
          if (widget.word.level != null)
            Positioned(
              top: 0,
              left: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: levelColor,
                  borderRadius: AppSpacing.borderRadiusFull,
                ),
                child: Text(
                  widget.word.level!,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.surface,
                  ),
                ),
              ),
            ),
          // TTS button - top right
          if (!isHideWord || widget.showMeaning)
            Positioned(
              top: -4,
              right: -4,
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: TtsPlayButton(text: widget.word.word, size: 36),
              ),
            ),
          // Center content
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 12),
                if (isHideMeaning) ...[
                  // Show word, hide meaning
                  Text(
                    widget.word.word,
                    style: AppTypography.display,
                    textAlign: TextAlign.center,
                  ),
                  if (widget.word.pronunciation != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      widget.word.pronunciation!,
                      style: AppTypography.bodySmall,
                    ),
                  ],
                  const SizedBox(height: 32),
                  if (!widget.showMeaning) ...[
                    Container(
                      width: 128,
                      height: 32,
                      decoration: BoxDecoration(
                        color: AppColors.border,
                        borderRadius: AppSpacing.borderRadiusMd,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '탭하여 뜻 보기',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                      ),
                    ),
                  ] else ...[
                    Text(
                      widget.word.meaningKo,
                      style: AppTypography.meaningText,
                      textAlign: TextAlign.center,
                    ),
                    if (widget.word.examples != null &&
                        widget.word.examples!.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.inputBg,
                          borderRadius: AppSpacing.borderRadiusXl,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.word.examples!.first['en'] ??
                                  widget.word.examples!.first['english'] ??
                                  '',
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            if (widget.word.examples!.first['ko'] != null ||
                                widget.word.examples!.first['korean'] !=
                                    null) ...[
                              const SizedBox(height: 4),
                              Text(
                                widget.word.examples!.first['ko'] ??
                                    widget.word.examples!.first['korean'] ??
                                    '',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ],
                ] else if (isHideWord) ...[
                  // Show meaning, hide word
                  Text(
                    widget.word.meaningKo,
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w400,
                      color: AppColors.textLink,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),
                  if (!widget.showMeaning) ...[
                    Container(
                      width: 160,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.border,
                        borderRadius: AppSpacing.borderRadiusMd,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '탭하여 단어 보기',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                      ),
                    ),
                  ] else ...[
                    Text(
                      widget.word.word,
                      style: AppTypography.display,
                      textAlign: TextAlign.center,
                    ),
                    if (widget.word.pronunciation != null) ...[
                      const SizedBox(height: 6),
                      Text(
                        widget.word.pronunciation!,
                        style: AppTypography.bodySmall,
                      ),
                    ],
                    if (widget.word.examples != null &&
                        widget.word.examples!.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.inputBg,
                          borderRadius: AppSpacing.borderRadiusXl,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.word.examples!.first['en'] ??
                                  widget.word.examples!.first['english'] ??
                                  '',
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            if (widget.word.examples!.first['ko'] != null ||
                                widget.word.examples!.first['korean'] !=
                                    null) ...[
                              const SizedBox(height: 4),
                              Text(
                                widget.word.examples!.first['ko'] ??
                                    widget.word.examples!.first['korean'] ??
                                    '',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ],
                ],
              ],
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
            // Word + pronunciation at top
            Text(
              widget.word.word,
              style: AppTypography.display.copyWith(color: AppColors.primary),
              textAlign: TextAlign.center,
            ),
            if (widget.word.pronunciation != null) ...[
              const SizedBox(height: 4),
              Text(widget.word.pronunciation!, style: AppTypography.bodySmall),
            ],
            const SizedBox(height: 20),
            // Korean meaning centered
            Text(
              widget.word.meaningKo,
              style: AppTypography.meaningText,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            TtsPlayButton(text: widget.word.word, size: 40),
            // Up to 2 example sentences
            if (widget.word.examples != null &&
                widget.word.examples!.isNotEmpty) ...[
              const SizedBox(height: 20),
              const Divider(color: AppColors.borderLight),
              const SizedBox(height: 12),
              ...widget.word.examples!
                  .take(2)
                  .map(
                    (example) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Column(
                        children: [
                          Text(
                            example['en'] ?? example['english'] ?? '',
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                              height: 1.5,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          if (example['ko'] != null ||
                              example['korean'] != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              example['ko'] ?? example['korean'] ?? '',
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.textTertiary,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _cardContainer({required Widget child}) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(minHeight: 280),
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppSpacing.borderRadiusXxxl,
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
