import 'dart:async';

import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_typography.dart';

/// Banner shown when STT confidence is mid-range (0.4-0.8).
///
/// Displays the recognized transcript, confidence percentage, and an
/// auto-send countdown timer. The user can edit, confirm, or dismiss.
/// Auto-confirms after [countdownSeconds] unless the user enters edit mode.
class STTConfirmationBanner extends StatefulWidget {
  final String transcript;
  final double confidence;
  final ValueChanged<String> onConfirm;
  final ValueChanged<String> onEdit;
  final VoidCallback onDismiss;
  final int countdownSeconds;

  const STTConfirmationBanner({
    super.key,
    required this.transcript,
    required this.confidence,
    required this.onConfirm,
    required this.onEdit,
    required this.onDismiss,
    this.countdownSeconds = 5,
  });

  @override
  State<STTConfirmationBanner> createState() => _STTConfirmationBannerState();
}

class _STTConfirmationBannerState extends State<STTConfirmationBanner>
    with SingleTickerProviderStateMixin {
  bool _isEditing = false;
  late TextEditingController _editController;
  late FocusNode _editFocusNode;

  // Countdown state
  late int _remainingSeconds;
  Timer? _autoSendTimer;
  Timer? _countdownTimer;

  // Slide-in animation
  late final AnimationController _slideController;
  late final Animation<Offset> _slideAnimation;

  // Progress bar animation (smooth continuous)
  double _progress = 0.0;
  late DateTime _countdownStartTime;

  @override
  void initState() {
    super.initState();
    _editController = TextEditingController(text: widget.transcript);
    _editFocusNode = FocusNode();
    _remainingSeconds = widget.countdownSeconds;

    _slideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, -1), end: Offset.zero).animate(
          CurvedAnimation(parent: _slideController, curve: Curves.easeOutCubic),
        );

    _slideController.forward();
    _startCountdown();
  }

  @override
  void dispose() {
    _cancelTimers();
    _editController.dispose();
    _editFocusNode.dispose();
    _slideController.dispose();
    super.dispose();
  }

  void _startCountdown() {
    _countdownStartTime = DateTime.now();
    _remainingSeconds = widget.countdownSeconds;
    _progress = 0.0;

    _autoSendTimer = Timer(Duration(seconds: widget.countdownSeconds), () {
      if (mounted && !_isEditing) {
        widget.onConfirm(widget.transcript);
      }
    });

    // Update countdown display and progress bar every 100ms for smooth bar
    _countdownTimer = Timer.periodic(const Duration(milliseconds: 100), (_) {
      if (!mounted) return;
      final elapsed = DateTime.now()
          .difference(_countdownStartTime)
          .inMilliseconds;
      final totalMs = widget.countdownSeconds * 1000;
      final remaining = (totalMs - elapsed).clamp(0, totalMs);
      setState(() {
        _remainingSeconds = (remaining / 1000).ceil();
        _progress = elapsed / totalMs;
        if (_progress > 1.0) _progress = 1.0;
      });
    });
  }

  void _cancelTimers() {
    _autoSendTimer?.cancel();
    _autoSendTimer = null;
    _countdownTimer?.cancel();
    _countdownTimer = null;
  }

  void _handleEdit() {
    _cancelTimers();
    setState(() {
      _isEditing = true;
    });
    // Delay focus to allow the TextField to build
    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) _editFocusNode.requestFocus();
    });
  }

  void _handleEditSubmit() {
    final text = _editController.text.trim();
    if (text.isNotEmpty) {
      widget.onEdit(text);
    }
  }

  void _handleConfirm() {
    _cancelTimers();
    widget.onConfirm(widget.transcript);
  }

  int get _confidencePercent => (widget.confidence * 100).round();

  @override
  Widget build(BuildContext context) {
    return SlideTransition(
      position: _slideAnimation,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppSpacing.borderRadiusXl,
            border: Border.all(color: AppColors.border),
            boxShadow: const [
              BoxShadow(
                color: Color(0x0D000000),
                blurRadius: 6,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: _isEditing ? _buildEditMode() : _buildDisplayMode(),
          ),
        ),
      ),
    );
  }

  Widget _buildDisplayMode() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Transcript and meta info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '"${widget.transcript}"',
                    style: AppTypography.bodyMessage,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '인식률 $_confidencePercent% - $_remainingSeconds초 후 자동 전송',
                    style: AppTypography.caption,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            // Action buttons
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Edit button
                _OutlinedActionButton(label: '수정', onPressed: _handleEdit),
                const SizedBox(width: 6),
                // Confirm button
                _FilledActionButton(label: '전송', onPressed: _handleConfirm),
              ],
            ),
          ],
        ),
        const SizedBox(height: 8),
        // Progress bar
        ClipRRect(
          borderRadius: AppSpacing.borderRadiusFull,
          child: SizedBox(
            height: 2,
            child: LinearProgressIndicator(
              value: _progress,
              backgroundColor: AppColors.borderLight,
              valueColor: const AlwaysStoppedAnimation<Color>(
                AppColors.primary,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEditMode() {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _editController,
            focusNode: _editFocusNode,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textPrimary,
            ),
            decoration: InputDecoration(
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 10,
              ),
              filled: true,
              fillColor: AppColors.inputBg,
              border: OutlineInputBorder(
                borderRadius: AppSpacing.borderRadiusMd,
                borderSide: const BorderSide(color: AppColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: AppSpacing.borderRadiusMd,
                borderSide: const BorderSide(color: AppColors.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: AppSpacing.borderRadiusMd,
                borderSide: const BorderSide(color: AppColors.primary),
              ),
            ),
            onSubmitted: (_) => _handleEditSubmit(),
          ),
        ),
        const SizedBox(width: 8),
        _FilledActionButton(label: '전송', onPressed: _handleEditSubmit),
        const SizedBox(width: 4),
        GestureDetector(
          onTap: widget.onDismiss,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Text(
              '취소',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ------------------------------------------------------------------
// Private helper widgets
// ------------------------------------------------------------------

/// Small outlined button matching the Next.js "수정" style.
class _OutlinedActionButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;

  const _OutlinedActionButton({required this.label, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          borderRadius: AppSpacing.borderRadiusMd,
          border: Border.all(color: AppColors.border),
        ),
        child: Text(
          label,
          style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
        ),
      ),
    );
  }
}

/// Small filled teal button matching the Next.js "전송" style.
class _FilledActionButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;

  const _FilledActionButton({required this.label, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.primary,
          borderRadius: AppSpacing.borderRadiusMd,
        ),
        child: Text(
          label,
          style: AppTypography.caption.copyWith(color: AppColors.surface),
        ),
      ),
    );
  }
}
