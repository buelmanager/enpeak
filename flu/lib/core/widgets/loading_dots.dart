import 'package:flutter/material.dart';

import '../constants/app_colors.dart';

/// Three bouncing dots animation.
///
/// Use [AppColors.primary] for teal (TTS playing), default gray for AI thinking.
/// Optional label text displayed next to dots.
class LoadingDots extends StatefulWidget {
  const LoadingDots({
    super.key,
    this.color = AppColors.textSecondary,
    this.size = 8,
    this.label,
  });

  /// Use AppColors.primary for teal (TTS), default gray for thinking
  final Color color;
  final double size;
  final String? label;

  @override
  State<LoadingDots> createState() => _LoadingDotsState();
}

class _LoadingDotsState extends State<LoadingDots>
    with TickerProviderStateMixin {
  late final List<AnimationController> _controllers;
  late final List<Animation<double>> _animations;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(3, (i) {
      return AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 600),
      );
    });

    // Stagger by 150ms each
    for (var i = 0; i < 3; i++) {
      Future.delayed(Duration(milliseconds: i * 150), () {
        if (mounted) {
          _controllers[i].repeat(reverse: true);
        }
      });
    }

    _animations = _controllers.map((c) {
      return Tween<double>(
        begin: 0,
        end: -8,
      ).animate(CurvedAnimation(parent: c, curve: Curves.easeInOut));
    }).toList();
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(3, (i) {
          return AnimatedBuilder(
            animation: _animations[i],
            builder: (context, child) {
              return Container(
                margin: EdgeInsets.only(right: i < 2 ? 4 : 0),
                child: Transform.translate(
                  offset: Offset(0, _animations[i].value),
                  child: Container(
                    width: widget.size,
                    height: widget.size,
                    decoration: BoxDecoration(
                      color: widget.color,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              );
            },
          );
        }),
        if (widget.label != null) ...[
          const SizedBox(width: 8),
          Text(
            widget.label!,
            style: TextStyle(
              fontSize: 12,
              color: widget.color,
              letterSpacing: 0.1 * 12,
            ),
          ),
        ],
      ],
    );
  }
}
