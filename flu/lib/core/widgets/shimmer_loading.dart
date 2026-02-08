import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../constants/app_colors.dart';

/// Base shimmer placeholder box.
///
/// Renders a rounded rectangle with a shimmer animation.
/// Use [width], [height], and [borderRadius] to customise the shape.
class ShimmerBox extends StatelessWidget {
  const ShimmerBox({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 8,
  });

  final double width;
  final double height;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.shimmerBase,
      highlightColor: AppColors.shimmerHighlight,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.shimmerBase,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

/// Shimmer placeholder shaped like a content card.
///
/// Mimics a card with three text lines at different widths:
/// title (60 %), subtitle (80 %), and meta (40 %).
class ShimmerCard extends StatelessWidget {
  const ShimmerCard({super.key});

  static const double _cardRadius = 16;

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.shimmerBase,
      highlightColor: AppColors.shimmerHighlight,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(_cardRadius),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title line - 60 % width
            Container(
              width: double.infinity * 0.6,
              height: 16,
              decoration: BoxDecoration(
                color: AppColors.shimmerBase,
                borderRadius: BorderRadius.circular(4),
              ),
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.6,
              ),
            ),
            const SizedBox(height: 12),
            // Subtitle line - 80 % width
            Container(
              height: 14,
              decoration: BoxDecoration(
                color: AppColors.shimmerBase,
                borderRadius: BorderRadius.circular(4),
              ),
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.8,
              ),
            ),
            const SizedBox(height: 12),
            // Meta line - 40 % width
            Container(
              height: 12,
              decoration: BoxDecoration(
                color: AppColors.shimmerBase,
                borderRadius: BorderRadius.circular(4),
              ),
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// A column of [ShimmerCard] widgets.
///
/// [itemCount] controls how many cards are rendered (default 3).
class ShimmerList extends StatelessWidget {
  const ShimmerList({super.key, this.itemCount = 3});

  final int itemCount;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(itemCount, (index) {
        return Padding(
          padding: EdgeInsets.only(bottom: index < itemCount - 1 ? 12 : 0),
          child: const ShimmerCard(),
        );
      }),
    );
  }
}

/// Full-screen shimmer loading state.
///
/// Centres a [ShimmerList] with horizontal padding, suitable for
/// replacing an entire page while data loads.
class ShimmerFullScreen extends StatelessWidget {
  const ShimmerFullScreen({super.key, this.itemCount = 3});

  final int itemCount;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: ShimmerList(itemCount: itemCount),
      ),
    );
  }
}
