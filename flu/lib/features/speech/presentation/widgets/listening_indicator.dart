import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';

/// Real-time audio visualization with soundwave bars and cancel button.
///
/// Shows an animated teal bar with 5 oscillating white soundwave bars,
/// a "listening" label, optional warning message, and cancel button.
/// Port of the Next.js ListeningIndicator component.
class ListeningIndicator extends StatefulWidget {
  const ListeningIndicator({
    super.key,
    required this.isListening,
    required this.onCancel,
    this.warningMessage,
    this.audioLevel,
  });

  /// Controls whether bars animate.
  final bool isListening;

  /// Called when cancel button is tapped.
  final VoidCallback onCancel;

  /// Optional warning text (e.g. silence/noise detection).
  final String? warningMessage;

  /// 0.0 to 1.0 - if provided, bar heights react to audio level.
  /// If null, bars use autonomous sin-curve animation.
  final double? audioLevel;

  @override
  State<ListeningIndicator> createState() => _ListeningIndicatorState();
}

class _ListeningIndicatorState extends State<ListeningIndicator>
    with TickerProviderStateMixin {
  static const int _barCount = 5;
  static const double _barWidth = 3;
  static const double _barGap = 3;
  static const double _minBarHeight = 8;
  static const double _maxBarHeight = 20;
  static const Duration _animDuration = Duration(milliseconds: 800);

  /// Stagger delays matching the original Next.js: [0, 150, 300, 450, 200]ms
  static const List<int> _staggerDelaysMs = [0, 150, 300, 450, 200];

  late final List<AnimationController> _controllers;
  late final List<Animation<double>> _animations;

  /// Fade controller for the entire widget.
  late final AnimationController _fadeController;
  late final Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();

    // Fade animation
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    );

    // Soundwave bar controllers
    _controllers = List.generate(_barCount, (i) {
      return AnimationController(vsync: this, duration: _animDuration);
    });

    _animations = _controllers.map((c) {
      return Tween<double>(
        begin: _minBarHeight,
        end: _maxBarHeight,
      ).animate(CurvedAnimation(parent: c, curve: Curves.easeInOut));
    }).toList();

    if (widget.isListening) {
      _startAnimations();
    }
  }

  @override
  void didUpdateWidget(ListeningIndicator oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isListening && !oldWidget.isListening) {
      _startAnimations();
    } else if (!widget.isListening && oldWidget.isListening) {
      _stopAnimations();
    }
  }

  void _startAnimations() {
    _fadeController.forward();
    // Only run autonomous animation when no audioLevel provided
    if (widget.audioLevel == null) {
      for (var i = 0; i < _barCount; i++) {
        Future.delayed(Duration(milliseconds: _staggerDelaysMs[i]), () {
          if (mounted) {
            _controllers[i].repeat(reverse: true);
          }
        });
      }
    }
  }

  void _stopAnimations() {
    _fadeController.reverse();
    for (final c in _controllers) {
      c.stop();
    }
  }

  @override
  void dispose() {
    _fadeController.dispose();
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  /// Calculate bar height from audioLevel with sin-based per-bar variation.
  /// Mirrors the Next.js getBarHeight logic.
  double _audioLevelBarHeight(int index) {
    final level = (widget.audioLevel ?? 0).clamp(0.0, 1.0);
    final now = DateTime.now().millisecondsSinceEpoch;
    final variation = math.sin(now / 300 + _staggerDelaysMs[index] / 150) * 0.3;
    final adjusted = (level + variation).clamp(0.0, 1.0);
    return _minBarHeight + adjusted * (_maxBarHeight - _minBarHeight);
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isListening) return const SizedBox.shrink();

    final useRealLevel = widget.audioLevel != null;

    return FadeTransition(
      opacity: _fadeAnimation,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Warning message row
          if (widget.warningMessage != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              color: const Color(0xFF2A2A2A),
              child: Text(
                widget.warningMessage!,
                textAlign: TextAlign.center,
                style: AppTypography.caption.copyWith(
                  color: const Color(0xFFFFB84D),
                ),
              ),
            ),

          // Main teal bar
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            color: AppColors.primary,
            child: Row(
              children: [
                // Left: soundwave bars + label
                Expanded(
                  child: Row(
                    children: [
                      // Soundwave bars
                      SizedBox(
                        height: _maxBarHeight,
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: List.generate(_barCount, (i) {
                            if (useRealLevel) {
                              return _AudioLevelBar(
                                index: i,
                                width: _barWidth,
                                marginRight: i < _barCount - 1 ? _barGap : 0,
                                heightGetter: () => _audioLevelBarHeight(i),
                              );
                            }
                            return AnimatedBuilder(
                              animation: _animations[i],
                              builder: (context, child) {
                                return Container(
                                  width: _barWidth,
                                  height: _animations[i].value,
                                  margin: EdgeInsets.only(
                                    right: i < _barCount - 1 ? _barGap : 0,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(
                                      _barWidth / 2,
                                    ),
                                  ),
                                );
                              },
                            );
                          }),
                        ),
                      ),

                      const SizedBox(width: 12),

                      // Label
                      Text(
                        '듣고 있어요...',
                        style: AppTypography.bodySmall.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),

                // Right: cancel button
                GestureDetector(
                  onTap: widget.onCancel,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(9999),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Text(
                      '취소',
                      style: AppTypography.bodySmall.copyWith(
                        color: Colors.white.withValues(alpha: 0.8),
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Continuously rebuilding bar driven by audioLevel (ticker-based).
///
/// Uses a ticker to poll height at ~60fps for smooth reactive animation
/// when real audio level data is provided.
class _AudioLevelBar extends StatefulWidget {
  const _AudioLevelBar({
    required this.index,
    required this.width,
    required this.marginRight,
    required this.heightGetter,
  });

  final int index;
  final double width;
  final double marginRight;
  final double Function() heightGetter;

  @override
  State<_AudioLevelBar> createState() => _AudioLevelBarState();
}

class _AudioLevelBarState extends State<_AudioLevelBar>
    with SingleTickerProviderStateMixin {
  late final Ticker _ticker;
  double _currentHeight = 8;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((_) {
      final target = widget.heightGetter();
      if ((_currentHeight - target).abs() > 0.5) {
        setState(() => _currentHeight = target);
      }
    });
    _ticker.start();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 100),
      curve: Curves.easeOut,
      width: widget.width,
      height: _currentHeight,
      margin: EdgeInsets.only(right: widget.marginRight),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(widget.width / 2),
      ),
    );
  }
}
