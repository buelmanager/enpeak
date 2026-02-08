import 'package:flutter/material.dart';

import '../constants/app_colors.dart';
import 'tap_scale.dart';

/// Minimal card with white background, rounded corners, subtle border and shadow.
///
/// Matches the original design: white bg, rounded-2xl (16px), border #ebebeb,
/// shadow 0 2px 8px rgba(0,0,0,0.04), active:scale-0.98.
class MinimalCard extends StatelessWidget {
  const MinimalCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = const EdgeInsets.all(20),
    this.margin = const EdgeInsets.only(bottom: 12),
    this.borderRadius = 16,
    this.color,
  });

  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsets padding;
  final EdgeInsets margin;
  final double borderRadius;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final card = Container(
      margin: margin,
      decoration: BoxDecoration(
        color: color ?? AppColors.surface,
        borderRadius: BorderRadius.circular(borderRadius),
        border: color == null
            ? Border.all(color: const Color(0xFFEBEBEB))
            : null,
        boxShadow: color == null
            ? const [
                BoxShadow(
                  color: Color(0x0A000000),
                  blurRadius: 8,
                  offset: Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: Padding(padding: padding, child: child),
    );

    if (onTap == null) return card;

    return TapScale(onTap: onTap!, child: card);
  }
}
