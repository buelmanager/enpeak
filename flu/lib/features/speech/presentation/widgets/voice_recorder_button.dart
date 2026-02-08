import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../providers/stt_provider.dart';

/// Microphone button with recording pulse animation.
///
/// Integrates with [SttNotifier] via Riverpod.
/// Tap to start/stop recording. Shows a pulsing red circle while listening.
/// Displays a snackbar on permission or recognition errors.
class VoiceRecorderButton extends ConsumerStatefulWidget {
  final double size;
  final String localeId;
  final void Function(String text)? onResult;
  final VoidCallback? onListeningStarted;
  final VoidCallback? onListeningStopped;
  final bool disabled;

  const VoiceRecorderButton({
    super.key,
    this.size = 48,
    this.localeId = 'en_US',
    this.onResult,
    this.onListeningStarted,
    this.onListeningStopped,
    this.disabled = false,
  });

  @override
  ConsumerState<VoiceRecorderButton> createState() =>
      _VoiceRecorderButtonState();
}

class _VoiceRecorderButtonState extends ConsumerState<VoiceRecorderButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _opacityAnimation;

  /// Tracks the last displayed error to avoid duplicate snackbars.
  String? _lastError;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    _opacityAnimation = Tween<double>(begin: 0.6, end: 0.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _toggleListening() async {
    if (widget.disabled) return;

    final stt = ref.read(sttProvider.notifier);
    final state = ref.read(sttProvider);

    if (state.isListening) {
      await stt.stopListening();
      widget.onListeningStopped?.call();
    } else {
      await stt.startListening(
        localeId: widget.localeId,
        onResult: widget.onResult,
      );
      widget.onListeningStarted?.call();
    }
  }

  void _showErrorSnackbar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 3),
          action: SnackBarAction(
            label: 'OK',
            textColor: AppColors.surface,
            onPressed: () {
              ScaffoldMessenger.of(context).hideCurrentSnackBar();
            },
          ),
        ),
      );
  }

  bool _isPermissionError(String? error) {
    if (error == null) return false;
    final lower = error.toLowerCase();
    return lower.contains('permission') ||
        lower.contains('denied') ||
        lower.contains('not-allowed') ||
        lower.contains('audio-capture');
  }

  @override
  Widget build(BuildContext context) {
    final sttState = ref.watch(sttProvider);

    // Sync pulse animation with listening state
    if (sttState.isListening && !_pulseController.isAnimating) {
      _pulseController.repeat();
    } else if (!sttState.isListening && _pulseController.isAnimating) {
      _pulseController.stop();
      _pulseController.reset();
    }

    // Show error snackbar only on new errors
    final currentError = sttState.error;
    if (currentError != null && currentError != _lastError) {
      _lastError = currentError;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _showErrorSnackbar(currentError);
      });
    } else if (currentError == null) {
      _lastError = null;
    }

    final hasPermissionError = _isPermissionError(sttState.error);
    final isDisabled =
        widget.disabled ||
        (!sttState.isAvailable &&
            sttState.isInitialized &&
            !hasPermissionError);

    return Opacity(
      opacity: isDisabled ? 0.4 : 1.0,
      child: SizedBox(
        width: widget.size + 16,
        height: widget.size + 16,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Pulsing circle behind the button during recording
            if (sttState.isListening)
              AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  return Container(
                    width: widget.size * _scaleAnimation.value,
                    height: widget.size * _scaleAnimation.value,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.error.withValues(
                        alpha: _opacityAnimation.value,
                      ),
                    ),
                  );
                },
              ),
            // Main button
            SizedBox(
              width: widget.size,
              height: widget.size,
              child: Material(
                shape: CircleBorder(
                  side: BorderSide(
                    color: hasPermissionError
                        ? AppColors.error.withValues(alpha: 0.5)
                        : AppColors.border,
                    width: 0.5,
                  ),
                ),
                color: _buttonColor(
                  isListening: sttState.isListening,
                  hasPermissionError: hasPermissionError,
                ),
                elevation: sttState.isListening ? 4 : 1,
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: isDisabled ? null : _toggleListening,
                  child: Center(
                    child: Icon(
                      _buttonIcon(
                        isListening: sttState.isListening,
                        hasPermissionError: hasPermissionError,
                      ),
                      color: _iconColor(
                        isListening: sttState.isListening,
                        hasPermissionError: hasPermissionError,
                      ),
                      size: widget.size * 0.5,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _buttonColor({
    required bool isListening,
    required bool hasPermissionError,
  }) {
    if (isListening) return AppColors.error;
    return AppColors.surface;
  }

  IconData _buttonIcon({
    required bool isListening,
    required bool hasPermissionError,
  }) {
    if (isListening) return Icons.stop;
    if (hasPermissionError) return Icons.mic_off;
    return Icons.mic;
  }

  Color _iconColor({
    required bool isListening,
    required bool hasPermissionError,
  }) {
    if (isListening) return AppColors.surface;
    if (hasPermissionError) return AppColors.error;
    return AppColors.primary;
  }
}
