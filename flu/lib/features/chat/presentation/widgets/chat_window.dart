import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/loading_dots.dart';
import '../../domain/entities/message.dart';
import 'chat_input_bar.dart';
import 'message_bubble.dart';

/// Key vocabulary item for roleplay scenarios.
class VocabularyItem {
  final String word;
  final String meaning;

  const VocabularyItem({required this.word, required this.meaning});
}

/// Full chat window with message list, loading indicator, and input bar.
///
/// Uses a reversed [ListView] for chat-style scrolling (newest at bottom).
/// Auto-scrolls to the latest message when the list updates.
/// Integrates [ChatInputBar] at the bottom for text/voice input.
///
/// Features:
/// - Situation bar (top, when situation context is set)
/// - Scenario progress bar (top, roleplay mode)
/// - Empty state with breathing circle animation and CTAs
/// - TTS playing indicator (primary dots + label)
/// - AI thinking indicator (fake bubble with bouncing dots)
/// - Word tip bar (dismissible hint for long-press lookup)
class ChatWindow extends ConsumerStatefulWidget {
  final List<Message> messages;
  final bool isLoading;
  final void Function(String message) onSendMessage;
  final bool isVoiceMode;

  /// Legacy callback: toggle voice mode with a bool value.
  /// Used when [onToggleMode], [onStartVoice], [onStopVoice] are not provided.
  final ValueChanged<bool>? onVoiceModeChanged;

  /// Toggle between voice and text input mode.
  /// When null, falls back to [onVoiceModeChanged].
  final VoidCallback? onToggleMode;

  /// Start voice recording. Defaults to no-op if not provided.
  final VoidCallback? onStartVoice;

  /// Stop voice recording. Defaults to no-op if not provided.
  final VoidCallback? onStopVoice;

  /// Whether voice recording is currently active.
  final bool isRecording;

  /// Current situation context label (free chat with scenario).
  final String? situationLabel;

  /// Callback to clear the active situation.
  final VoidCallback? onClearSituation;

  /// Current stage number in roleplay (1-based).
  final int? currentStage;

  /// Total number of stages in the roleplay scenario.
  final int? totalStages;

  /// Name of the current roleplay stage.
  final String? stageName;

  /// Learning tip for the current stage.
  final String? learningTip;

  /// Key vocabulary words for the current roleplay stage.
  final List<VocabularyItem>? keyVocabulary;

  /// Whether TTS is currently playing an AI response.
  final bool isTTSPlaying;

  /// Callback for the "Start conversation" CTA in empty state.
  final VoidCallback? onStartConversation;

  /// Callback for the "Setup situation" CTA in empty state (free chat).
  final VoidCallback? onSetupSituation;

  /// Chat mode: 'free', 'expression', or 'roleplay'.
  final String mode;

  /// Expression hint to display in the input bar (expression practice mode).
  final String? expressionHint;

  const ChatWindow({
    super.key,
    required this.messages,
    this.isLoading = false,
    required this.onSendMessage,
    this.isVoiceMode = false,
    this.onVoiceModeChanged,
    this.onToggleMode,
    this.onStartVoice,
    this.onStopVoice,
    this.isRecording = false,
    this.situationLabel,
    this.onClearSituation,
    this.currentStage,
    this.totalStages,
    this.stageName,
    this.learningTip,
    this.keyVocabulary,
    this.isTTSPlaying = false,
    this.onStartConversation,
    this.onSetupSituation,
    this.mode = 'free',
    this.expressionHint,
  });

  @override
  ConsumerState<ChatWindow> createState() => _ChatWindowState();
}

class _ChatWindowState extends ConsumerState<ChatWindow>
    with SingleTickerProviderStateMixin {
  final _scrollController = ScrollController();
  late final AnimationController _breathController;
  late final Animation<double> _breathAnimation;

  bool _showVocabPanel = false;
  bool _showWordTip = true;

  @override
  void initState() {
    super.initState();
    _breathController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _breathAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _breathController, curve: Curves.easeInOut),
    );
  }

  @override
  void didUpdateWidget(covariant ChatWindow oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Auto-scroll when new messages arrive or loading state changes
    if (widget.messages.length != oldWidget.messages.length ||
        widget.isLoading != oldWidget.isLoading ||
        widget.isTTSPlaying != oldWidget.isTTSPlaying) {
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          0,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _handleSuggestionTap(String suggestion) {
    widget.onSendMessage(suggestion);
  }

  /// Resolve toggle mode callback: prefer [onToggleMode], fall back to
  /// [onVoiceModeChanged] with negated current value.
  VoidCallback _resolveToggleMode() {
    if (widget.onToggleMode != null) return widget.onToggleMode!;
    if (widget.onVoiceModeChanged != null) {
      return () => widget.onVoiceModeChanged!(!widget.isVoiceMode);
    }
    return () {};
  }

  @override
  void dispose() {
    _breathController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // A. Situation bar
        if (widget.situationLabel != null && widget.onClearSituation != null)
          _buildSituationBar(),

        // B. Scenario progress bar (roleplay mode)
        if (widget.mode == 'roleplay' &&
            widget.currentStage != null &&
            widget.totalStages != null)
          _buildScenarioProgressBar(),

        // Word tip bar (dismissible)
        if (_showWordTip && widget.messages.isNotEmpty) _buildWordTipBar(),

        // Message list or empty state
        Expanded(
          child: widget.messages.isEmpty
              ? _buildEmptyState()
              : _buildMessageList(),
        ),

        // Input bar
        ChatInputBar(
          isVoiceMode: widget.isVoiceMode,
          onToggleMode: _resolveToggleMode(),
          onSendText: widget.onSendMessage,
          onStartVoice: widget.onStartVoice ?? () {},
          onStopVoice: widget.onStopVoice ?? () {},
          isRecording: widget.isRecording,
          isLoading: widget.isLoading,
          expressionHint: widget.expressionHint,
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // A. Situation Bar
  // ---------------------------------------------------------------------------

  Widget _buildSituationBar() {
    return Container(
      height: 36,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: const BoxDecoration(
        color: AppColors.primaryTint,
        border: Border(bottom: BorderSide(color: AppColors.border, width: 1)),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.location_on_outlined,
            size: 14,
            color: AppColors.primary,
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              widget.situationLabel!,
              style: AppTypography.bodyCard.copyWith(
                fontWeight: FontWeight.w400,
                color: AppColors.primary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          GestureDetector(
            onTap: widget.onClearSituation,
            behavior: HitTestBehavior.opaque,
            child: const Padding(
              padding: EdgeInsets.all(4),
              child: Icon(
                Icons.close,
                size: 16,
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // B. Scenario Progress Bar
  // ---------------------------------------------------------------------------

  Widget _buildScenarioProgressBar() {
    final current = widget.currentStage!;
    final total = widget.totalStages!;
    final isComplete = current > total;
    final progress = isComplete ? 1.0 : (current - 1) / total;
    final hasVocab =
        widget.keyVocabulary != null && widget.keyVocabulary!.isNotEmpty;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(
          bottom: BorderSide(color: AppColors.borderLight, width: 1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Stage label + vocab toggle
          Row(
            children: [
              Expanded(
                child: Text(
                  isComplete
                      ? 'Complete!'
                      : 'Stage $current/$total: ${widget.stageName ?? ''}',
                  style: AppTypography.caption.copyWith(
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (hasVocab)
                GestureDetector(
                  onTap: () =>
                      setState(() => _showVocabPanel = !_showVocabPanel),
                  child: Text(
                    _showVocabPanel
                        ? '\uc811\uae30'
                        : '\ud575\uc2ec \ub2e8\uc5b4',
                    style: AppTypography.badge.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),

          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: AppColors.borderLight,
              valueColor: const AlwaysStoppedAnimation<Color>(
                AppColors.primary,
              ),
            ),
          ),

          // Learning tip
          if (!isComplete && widget.learningTip != null) ...[
            const SizedBox(height: 6),
            Text(
              'Tip: ${widget.learningTip}',
              style: AppTypography.badge.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],

          // Expandable vocabulary panel
          if (_showVocabPanel && hasVocab) ...[
            const SizedBox(height: 8),
            ...widget.keyVocabulary!.map(
              (vocab) => Padding(
                padding: const EdgeInsets.only(bottom: 2),
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: vocab.word,
                        style: AppTypography.badge.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.textLink,
                        ),
                      ),
                      TextSpan(
                        text: ' - ${vocab.meaning}',
                        style: AppTypography.badge.copyWith(
                          color: AppColors.textLink,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Word Tip Bar
  // ---------------------------------------------------------------------------

  Widget _buildWordTipBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      decoration: const BoxDecoration(
        color: AppColors.inputBg,
        border: Border(bottom: BorderSide(color: AppColors.border, width: 1)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              '\ubaa8\ub974\ub294 \ub2e8\uc5b4\ub294 \uae38\uac8c \ub20c\ub7ec \ubcf4\uc138\uc694',
              style: AppTypography.caption.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
          GestureDetector(
            onTap: () => setState(() => _showWordTip = false),
            behavior: HitTestBehavior.opaque,
            child: Padding(
              padding: const EdgeInsets.all(2),
              child: Icon(Icons.close, size: 14, color: AppColors.textTertiary),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // C. Empty State
  // ---------------------------------------------------------------------------

  Widget _buildEmptyState() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Breathing circle animation
            AnimatedBuilder(
              animation: _breathAnimation,
              builder: (context, child) {
                return Transform.scale(
                  scale: _breathAnimation.value,
                  child: child,
                );
              },
              child: Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary.withValues(alpha: 0.15),
                ),
                child: const Center(
                  child: Icon(
                    Icons.chat_bubble_outline_rounded,
                    size: 30,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Primary text
            Text(
              '\uc601\uc5b4\ub85c \ub300\ud654\ub97c \uc2dc\uc791\ud574\ubcf4\uc138\uc694',
              style: AppTypography.bodyMedium.copyWith(
                fontSize: 16,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),

            // Secondary text
            Text(
              '\uc74c\uc131 \ub610\ub294 \ud14d\uc2a4\ud2b8\ub85c \ub300\ud654\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4',
              style: AppTypography.bodyCard.copyWith(
                fontWeight: FontWeight.w400,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 28),

            // CTA: Start conversation
            if (widget.onStartConversation != null)
              GestureDetector(
                onTap: widget.onStartConversation,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
                  ),
                  child: Text(
                    '\ub300\ud654 \uc2dc\uc791\ud558\uae30',
                    style: AppTypography.bodyMedium14.copyWith(
                      color: AppColors.surface,
                    ),
                  ),
                ),
              ),

            // CTA: Setup situation (free chat only)
            if (widget.mode == 'free' && widget.onSetupSituation != null) ...[
              const SizedBox(height: 12),
              GestureDetector(
                onTap: widget.onSetupSituation,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.transparent,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Text(
                    '\uc0c1\ud669 \uc124\uc815\ud558\uae30',
                    style: AppTypography.bodyMedium14.copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ),
            ],

            // Quick suggestion chips
            const SizedBox(height: 28),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children: ['Hello!', 'What should we talk about?', 'How are you?']
                  .map((suggestion) {
                    return GestureDetector(
                      onTap: () => widget.onSendMessage(suggestion),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(
                            AppSpacing.radiusFull,
                          ),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Text(
                          suggestion,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                    );
                  })
                  .toList(),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Message List
  // ---------------------------------------------------------------------------

  Widget _buildMessageList() {
    // Extra items at index 0 (reversed list: newest at bottom visually).
    // Loading (thinking) and TTS indicators appear below the last message.
    final int extraCount =
        (widget.isLoading ? 1 : 0) + (widget.isTTSPlaying ? 1 : 0);

    return ListView.builder(
      controller: _scrollController,
      reverse: true,
      padding: const EdgeInsets.symmetric(vertical: 16),
      itemCount: widget.messages.length + extraCount,
      itemBuilder: (context, index) {
        // Render extra indicators at the lowest indices (visual bottom)
        if (index < extraCount) {
          if (widget.isTTSPlaying && index == 0) {
            return _buildTTSPlayingIndicator();
          }
          if (widget.isLoading) {
            final loadingIndex = widget.isTTSPlaying ? 1 : 0;
            if (index == loadingIndex) {
              return _buildThinkingBubble();
            }
          }
        }

        final messageIndex = index - extraCount;
        final message =
            widget.messages[widget.messages.length - 1 - messageIndex];

        return MessageBubble(
          key: ValueKey(message.id),
          message: message,
          onSuggestionTap: _handleSuggestionTap,
        );
      },
    );
  }

  // ---------------------------------------------------------------------------
  // D. TTS Playing Indicator
  // ---------------------------------------------------------------------------

  Widget _buildTTSPlayingIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: [
          const LoadingDots(color: AppColors.primary, size: 6),
          const SizedBox(width: 8),
          Text(
            '\uc7ac\uc0dd \uc911...',
            style: AppTypography.caption.copyWith(
              color: AppColors.primary,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // E. AI Thinking Indicator (fake AI message bubble with bouncing dots)
  // ---------------------------------------------------------------------------

  Widget _buildThinkingBubble() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(16),
              ),
              border: Border.all(color: AppColors.borderCard),
            ),
            child: const LoadingDots(
              color: AppColors.textSecondary,
              size: 8,
              label: '\uc0dd\uac01 \uc911...',
            ),
          ),
        ],
      ),
    );
  }
}
