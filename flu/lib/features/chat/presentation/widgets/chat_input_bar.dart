import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_shadows.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../speech/presentation/widgets/voice_recorder_button.dart';

/// Chat input bar with voice/text mode toggle, pronunciation toggle,
/// text field with send button, and voice recorder.
///
/// Pixel-perfect match of the Next.js ChatWindow input area.
class ChatInputBar extends StatefulWidget {
  /// Whether in voice or text input mode.
  final bool isVoiceMode;

  /// Toggle between voice and text mode.
  final VoidCallback onToggleMode;

  /// Whether pronunciation practice mode is active.
  final bool isPronunciationMode;

  /// Toggle pronunciation practice mode (null hides the button).
  final VoidCallback? onTogglePronunciation;

  /// Send a text message.
  final void Function(String message) onSendText;

  /// Start voice recording.
  final VoidCallback onStartVoice;

  /// Stop voice recording.
  final VoidCallback onStopVoice;

  /// Whether voice recording is active.
  final bool isRecording;

  /// Whether waiting for AI response (disables input).
  final bool isLoading;

  /// Expression to practice (shows chip above input in expression mode).
  final String? expressionHint;

  /// External text editing controller.
  final TextEditingController? controller;

  const ChatInputBar({
    super.key,
    required this.isVoiceMode,
    required this.onToggleMode,
    this.isPronunciationMode = false,
    this.onTogglePronunciation,
    required this.onSendText,
    required this.onStartVoice,
    required this.onStopVoice,
    this.isRecording = false,
    this.isLoading = false,
    this.expressionHint,
    this.controller,
  });

  @override
  State<ChatInputBar> createState() => _ChatInputBarState();
}

class _ChatInputBarState extends State<ChatInputBar> {
  late TextEditingController _controller;
  final _focusNode = FocusNode();
  bool _hasText = false;
  bool _ownsController = false;

  @override
  void initState() {
    super.initState();
    if (widget.controller != null) {
      _controller = widget.controller!;
    } else {
      _controller = TextEditingController();
      _ownsController = true;
    }
    _controller.addListener(_onTextChanged);
    _focusNode.addListener(() => setState(() {}));
  }

  @override
  void didUpdateWidget(covariant ChatInputBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.controller != oldWidget.controller) {
      _controller.removeListener(_onTextChanged);
      if (_ownsController) {
        _controller.dispose();
        _ownsController = false;
      }
      if (widget.controller != null) {
        _controller = widget.controller!;
      } else {
        _controller = TextEditingController();
        _ownsController = true;
      }
      _controller.addListener(_onTextChanged);
      _onTextChanged();
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_onTextChanged);
    if (_ownsController) {
      _controller.dispose();
    }
    _focusNode.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    final hasText = _controller.text.trim().isNotEmpty;
    if (hasText != _hasText) {
      setState(() => _hasText = hasText);
    }
  }

  void _handleSend() {
    final text = _controller.text.trim();
    if (text.isEmpty || widget.isLoading) return;
    widget.onSendText(text);
    _controller.clear();
    _focusNode.unfocus();
  }

  void _handleVoiceResult(String text) {
    if (text.trim().isNotEmpty) {
      widget.onSendText(text.trim());
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Container(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 8,
        bottom: bottomPadding + 8,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.borderLight, width: 1)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Expression hint chip
          if (widget.expressionHint != null) ...[
            _buildExpressionChip(),
            const SizedBox(height: 8),
          ],

          // Mode toggles row
          _buildModeToggles(),
          const SizedBox(height: 12),

          // Input area (text or voice)
          widget.isVoiceMode ? _buildVoiceInput() : _buildTextInput(),
        ],
      ),
    );
  }

  /// Expression practice chip shown above input.
  Widget _buildExpressionChip() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.primaryTint,
        borderRadius: AppSpacing.borderRadiusMd,
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.lightbulb_outline,
            size: 14,
            color: AppColors.primary,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              '"${widget.expressionHint}" - 이 표현을 사용해서 대화해보세요',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: AppColors.primary,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  /// Voice/Text segmented toggle + Pronunciation toggle.
  Widget _buildModeToggles() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Voice/Text segmented toggle
        _buildSegmentedToggle(),

        // Pronunciation toggle (only in voice mode)
        if (widget.isVoiceMode && widget.onTogglePronunciation != null) ...[
          const SizedBox(width: 8),
          _buildPronunciationToggle(),
        ],
      ],
    );
  }

  /// Segmented voice/text pill toggle matching Next.js design.
  Widget _buildSegmentedToggle() {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppSpacing.borderRadiusFull,
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildSegmentButton(
            icon: Icons.mic,
            label: '\uc74c\uc131',
            isActive: widget.isVoiceMode,
            onTap: () {
              if (!widget.isVoiceMode) widget.onToggleMode();
            },
          ),
          _buildSegmentButton(
            icon: Icons.edit_outlined,
            label: '\ud14d\uc2a4\ud2b8',
            isActive: !widget.isVoiceMode,
            onTap: () {
              if (widget.isVoiceMode) widget.onToggleMode();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSegmentButton({
    required IconData icon,
    required String label,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : Colors.transparent,
          borderRadius: AppSpacing.borderRadiusFull,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 14,
              color: isActive ? AppColors.surface : AppColors.textSecondary,
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: isActive ? AppColors.surface : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Pronunciation practice toggle pill.
  Widget _buildPronunciationToggle() {
    final isActive = widget.isPronunciationMode;

    return GestureDetector(
      onTap: widget.onTogglePronunciation,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : AppColors.surface,
          borderRadius: AppSpacing.borderRadiusFull,
          border: Border.all(
            color: isActive ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.record_voice_over,
              size: 14,
              color: isActive ? AppColors.surface : AppColors.textSecondary,
            ),
            const SizedBox(width: 4),
            Text(
              '\ubc1c\uc74c \uc5f0\uc2b5',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: isActive ? AppColors.surface : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Text mode: TextField + circular send button.
  Widget _buildTextInput() {
    final canSend = _hasText && !widget.isLoading;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        // Text field
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.inputBg,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: _focusNode.hasFocus
                    ? AppColors.primary
                    : Colors.transparent,
                width: 2,
              ),
            ),
            child: TextField(
              controller: _controller,
              focusNode: _focusNode,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _handleSend(),
              enabled: !widget.isLoading,
              maxLines: 4,
              minLines: 1,
              style: const TextStyle(
                fontSize: 15,
                color: AppColors.textPrimary,
              ),
              decoration: const InputDecoration(
                hintText:
                    '\uc601\uc5b4\ub85c \uba54\uc2dc\uc9c0\ub97c \uc785\ub825\ud558\uc138\uc694',
                hintStyle: TextStyle(
                  fontSize: 15,
                  color: AppColors.textTertiary,
                ),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                isDense: true,
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),

        // Send button - 36px circle
        GestureDetector(
          onTap: canSend ? _handleSend : null,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: canSend ? AppColors.primary : AppColors.textTertiary,
            ),
            child: widget.isLoading
                ? const Padding(
                    padding: EdgeInsets.all(8),
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.surface,
                    ),
                  )
                : const Icon(
                    Icons.arrow_upward,
                    size: 20,
                    color: AppColors.surface,
                  ),
          ),
        ),
      ],
    );
  }

  /// Voice mode: centered VoiceRecorderButton + hint text.
  Widget _buildVoiceInput() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Center(
          child: Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: AppShadows.fab,
            ),
            child: VoiceRecorderButton(
              size: 64,
              onResult: _handleVoiceResult,
              onListeningStarted: widget.onStartVoice,
              onListeningStopped: widget.onStopVoice,
              disabled: widget.isLoading,
            ),
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          '\ud0ed\ud558\uc5ec \ub9d0\ud558\uae30',
          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
      ],
    );
  }
}
