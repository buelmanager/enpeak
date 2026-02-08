import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';

/// Pulsing circle animation for empty states.
/// Scale 1.0 -> 1.15 -> 1.0, with opacity 0.3 -> 0.6 -> 0.3.
/// Duration: 2000ms, repeating.
class BreathingCircle extends StatefulWidget {
  final double size;
  final Color color;
  final Widget? child;

  const BreathingCircle({
    super.key,
    this.size = 80,
    this.color = AppColors.primary,
    this.child,
  });

  @override
  State<BreathingCircle> createState() => _BreathingCircleState();
}

class _BreathingCircleState extends State<BreathingCircle>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);

    final curved = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(curved);
    _opacityAnimation = Tween<double>(begin: 0.3, end: 0.6).animate(curved);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Opacity(
            opacity: _opacityAnimation.value,
            child: Container(
              width: widget.size,
              height: widget.size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: widget.color,
              ),
              child: child,
            ),
          ),
        );
      },
      child: widget.child != null ? Center(child: widget.child) : null,
    );
  }
}
