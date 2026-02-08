import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/vocabulary/domain/entities/word_expansion.dart';

class IdiomExpansion extends StatefulWidget {
  final WordExpansion? expansion;
  final bool isLoading;
  final bool isExpanded;

  const IdiomExpansion({
    super.key,
    required this.expansion,
    required this.isLoading,
    this.isExpanded = true,
  });

  @override
  State<IdiomExpansion> createState() => _IdiomExpansionState();
}

class _IdiomExpansionState extends State<IdiomExpansion>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _heightFactor;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
      value: widget.isExpanded ? 1.0 : 0.0,
    );
    _heightFactor = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
  }

  @override
  void didUpdateWidget(IdiomExpansion oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isExpanded != oldWidget.isExpanded) {
      if (widget.isExpanded) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final showContent =
        widget.isLoading || (widget.expansion != null && widget.isExpanded);

    if (!showContent && !_controller.isAnimating) {
      return const SizedBox.shrink();
    }

    return AnimatedBuilder(
      animation: _heightFactor,
      builder: (context, child) {
        return ClipRect(
          child: Align(
            alignment: Alignment.topCenter,
            heightFactor: _heightFactor.value,
            child: Opacity(opacity: _heightFactor.value, child: child),
          ),
        );
      },
      child: _buildContent(),
    );
  }

  Widget _buildContent() {
    if (widget.isLoading) {
      return _buildContainer(child: _buildShimmer());
    }

    if (widget.expansion == null) return const SizedBox.shrink();

    final hasIdioms = widget.expansion!.idioms.isNotEmpty;
    final hasSentences = widget.expansion!.sentences.isNotEmpty;
    final hasRelated = widget.expansion!.relatedWords.isNotEmpty;

    if (!hasIdioms && !hasSentences && !hasRelated) {
      return _buildContainer(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Center(
            child: Text(
              '관련 콘텐츠를 찾을 수 없습니다.',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ),
      );
    }

    return _buildContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Idioms section
          if (hasIdioms) ...[
            _SectionHeader(title: '관련 숙어', icon: Icons.menu_book_rounded),
            const SizedBox(height: 10),
            ...widget.expansion!.idioms.map(_buildIdiomCard),
          ],
          // Sentences section
          if (hasSentences) ...[
            if (hasIdioms) ...[
              const SizedBox(height: 16),
              const Divider(color: AppColors.borderLight, height: 1),
              const SizedBox(height: 16),
            ],
            _SectionHeader(title: '예문', icon: Icons.format_quote_rounded),
            const SizedBox(height: 10),
            ...widget.expansion!.sentences.map(_buildSentenceCard),
          ],
          // Related words section
          if (hasRelated) ...[
            if (hasIdioms || hasSentences) ...[
              const SizedBox(height: 16),
              const Divider(color: AppColors.borderLight, height: 1),
              const SizedBox(height: 16),
            ],
            _SectionHeader(title: '관련 단어', icon: Icons.link_rounded),
            const SizedBox(height: 10),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: widget.expansion!.relatedWords
                    .map(
                      (word) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: _buildWordChip(word),
                      ),
                    )
                    .toList(),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildContainer({required Widget child}) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppSpacing.borderRadiusXxl,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: child,
    );
  }

  Widget _buildShimmer() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Shimmer header
        _buildShimmerLine(width: 100, height: 14),
        const SizedBox(height: 12),
        // Shimmer card 1
        _buildShimmerCard(),
        const SizedBox(height: 10),
        // Shimmer card 2
        _buildShimmerCard(),
        const SizedBox(height: 16),
        // Shimmer header 2
        _buildShimmerLine(width: 60, height: 14),
        const SizedBox(height: 12),
        // Shimmer sentence
        _buildShimmerLine(width: double.infinity, height: 14),
        const SizedBox(height: 6),
        _buildShimmerLine(width: 200, height: 12),
      ],
    );
  }

  Widget _buildShimmerLine({required double width, required double height}) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.shimmerBase,
        borderRadius: AppSpacing.borderRadiusSm,
      ),
    );
  }

  Widget _buildShimmerCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.shimmerHighlight,
        borderRadius: AppSpacing.borderRadiusXl,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 160,
            height: 14,
            decoration: BoxDecoration(
              color: AppColors.shimmerBase,
              borderRadius: AppSpacing.borderRadiusSm,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            width: 120,
            height: 12,
            decoration: BoxDecoration(
              color: AppColors.shimmerBase,
              borderRadius: AppSpacing.borderRadiusSm,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIdiomCard(IdiomInfo idiom) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: AppSpacing.borderRadiusXl,
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              idiom.phrase,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              idiom.meaning,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSentenceCard(SentenceInfo sentence) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.only(left: 12),
        decoration: const BoxDecoration(
          border: Border(left: BorderSide(color: AppColors.primary, width: 3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              sentence.en,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              sentence.ko,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWordChip(String word) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
      decoration: BoxDecoration(
        color: AppColors.primaryLight,
        borderRadius: AppSpacing.borderRadiusFull,
      ),
      child: Text(
        word,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: AppColors.primaryDark,
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final IconData icon;

  const _SectionHeader({required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.primary),
        const SizedBox(width: 6),
        Text(
          title,
          style: AppTypography.label.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
