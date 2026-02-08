import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/chat/presentation/providers/chat_provider.dart';
import 'package:flu/features/chat/presentation/providers/chat_state.dart';
import 'package:flu/features/chat/presentation/widgets/chat_window.dart';
import 'package:flu/features/roleplay/presentation/providers/roleplay_provider.dart';
import 'package:flu/features/roleplay/presentation/widgets/scenario_picker.dart';
import 'package:flu/features/speech/presentation/providers/stt_provider.dart';
import 'package:flu/features/speech/presentation/providers/tts_provider.dart';
import 'package:flu/features/speech/presentation/widgets/listening_indicator.dart';
import 'package:flu/features/speech/presentation/widgets/stt_confirmation_banner.dart';
import 'package:flu/features/talk/presentation/providers/talk_provider.dart';
import 'package:flu/features/talk/presentation/widgets/mode_selector.dart';
import 'package:flu/features/talk/presentation/widgets/situation_picker.dart';

class TalkScreen extends ConsumerStatefulWidget {
  const TalkScreen({super.key});

  @override
  ConsumerState<TalkScreen> createState() => _TalkScreenState();
}

class _TalkScreenState extends ConsumerState<TalkScreen> {
  @override
  Widget build(BuildContext context) {
    final talkState = ref.watch(talkProvider);
    final chatState = ref.watch(chatProvider);
    final roleplayState = ref.watch(roleplayProvider);
    final sttState = ref.watch(sttProvider);

    // Sync TTS playing state into ChatState for ChatWindow indicator.
    ref.listen(ttsProvider.select((s) => s.isSpeaking), (prev, next) {
      if (next != prev) {
        ref.read(chatProvider.notifier).setTTSPlaying(next);
      }
    });

    // Listen for errors from all providers and show SnackBar.
    ref.listen<String?>(chatProvider.select((s) => s.error), (prev, next) {
      if (next != null && next != prev) _showError(next);
    });
    ref.listen<String?>(talkProvider.select((s) => s.error), (prev, next) {
      if (next != null && next != prev) _showError(next);
    });
    ref.listen<String?>(roleplayProvider.select((s) => s.error), (prev, next) {
      if (next != null && next != prev) _showError(next);
    });

    // React to mode changes for side-effects.
    ref.listen<TalkMode>(talkProvider.select((s) => s.mode), (prev, next) {
      if (prev != null && prev != next) {
        _onModeChanged(next);
      }
    });

    // React to roleplay session start: inject AI opening message.
    ref.listen<String?>(roleplayProvider.select((s) => s.aiMessage), (
      prev,
      next,
    ) {
      if (next != null && next != prev && roleplayState.hasActiveSession) {
        ref.read(chatProvider.notifier).addSystemMessage(next);
        if (roleplayState.currentScenario != null) {
          ref
              .read(chatProvider.notifier)
              .setRoleplayContext(
                scenarioId: roleplayState.currentScenario!.id,
                currentStage: roleplayState.currentStage,
              );
        }
      }
    });

    // Handle STT final result: show confirmation banner for mid-confidence,
    // auto-send for high confidence.
    ref.listen(sttProvider.select((s) => s.recognizedText), (prev, next) {
      if (next.isNotEmpty && next != prev) {
        final currentStt = ref.read(sttProvider);
        if (!currentStt.isListening) {
          final confidence = currentStt.confidence;
          if (confidence >= 0.8) {
            ref.read(chatProvider.notifier).sendMessage(next);
            ref.read(sttProvider.notifier).clearText();
          } else if (confidence >= 0.4) {
            ref
                .read(chatProvider.notifier)
                .setSttConfirmation(next, confidence);
            ref.read(sttProvider.notifier).clearText();
          }
        }
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Custom header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                color: AppColors.background,
                border: Border(
                  bottom: BorderSide(color: AppColors.borderLight, width: 1),
                ),
              ),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Icon(
                      Icons.chevron_left,
                      size: 24,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Expanded(
                    child: Text(
                      'Talk',
                      textAlign: TextAlign.center,
                      style: AppTypography.titleMedium,
                    ),
                  ),
                  const SizedBox(width: 24),
                ],
              ),
            ),
            const SizedBox(height: 8),
            ModeSelector(
              currentMode: talkState.mode,
              onModeChanged: (mode) {
                ref.read(talkProvider.notifier).setMode(mode);
              },
            ),
            const SizedBox(height: 8),
            Expanded(
              child: Stack(
                children: [
                  // Main content
                  _buildModeContent(
                    talkState: talkState,
                    chatState: chatState,
                    roleplayState: roleplayState,
                  ),

                  // STT Confirmation Banner overlay (top)
                  if (chatState.sttTranscript != null)
                    Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      child: STTConfirmationBanner(
                        transcript: chatState.sttTranscript!,
                        confidence: chatState.sttConfidence ?? 0.5,
                        onConfirm: (text) {
                          ref.read(chatProvider.notifier).sendMessage(text);
                          ref
                              .read(chatProvider.notifier)
                              .clearSttConfirmation();
                        },
                        onEdit: (text) {
                          ref.read(chatProvider.notifier).sendMessage(text);
                          ref
                              .read(chatProvider.notifier)
                              .clearSttConfirmation();
                        },
                        onDismiss: () {
                          ref
                              .read(chatProvider.notifier)
                              .clearSttConfirmation();
                        },
                      ),
                    ),

                  // Listening Indicator overlay (bottom, above input bar)
                  if (sttState.isListening)
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      child: ListeningIndicator(
                        isListening: sttState.isListening,
                        onCancel: () {
                          ref.read(sttProvider.notifier).cancelListening();
                          ref.read(chatProvider.notifier).setRecording(false);
                        },
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // -- Side-effect handlers ---------------------------------------------------

  void _onModeChanged(TalkMode mode) {
    ref.read(chatProvider.notifier).clearConversation();

    switch (mode) {
      case TalkMode.free:
        ref.read(chatProvider.notifier).clearRoleplayContext();
        ref.read(talkProvider.notifier).clearSituation();
      case TalkMode.expression:
        final talkState = ref.read(talkProvider);
        if (talkState.expressionData == null) {
          ref.read(talkProvider.notifier).loadExpression();
        }
      case TalkMode.roleplay:
        final roleplayState = ref.read(roleplayProvider);
        if (roleplayState.scenarios.isEmpty) {
          ref.read(roleplayProvider.notifier).loadScenarios();
        }
    }
  }

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 3),
        ),
      );
  }

  // -- Voice callbacks --------------------------------------------------------

  void _handleStartVoice() {
    ref.read(chatProvider.notifier).setRecording(true);
    ref.read(sttProvider.notifier).startListening();
  }

  void _handleStopVoice() {
    ref.read(chatProvider.notifier).setRecording(false);
    ref.read(sttProvider.notifier).stopListening();
  }

  void _handleToggleVoiceMode() {
    ref.read(chatProvider.notifier).toggleVoiceMode();
  }

  // -- Mode content builders --------------------------------------------------

  Widget _buildModeContent({
    required TalkState talkState,
    required ChatState chatState,
    required RoleplayState roleplayState,
  }) {
    return switch (talkState.mode) {
      TalkMode.free => _buildFreeChatContent(talkState, chatState),
      TalkMode.expression => _buildExpressionContent(
        talkState: talkState,
        chatState: chatState,
      ),
      TalkMode.roleplay => _buildRoleplayContent(
        roleplayState: roleplayState,
        chatState: chatState,
      ),
    };
  }

  // -- Free Chat --------------------------------------------------------------

  Widget _buildFreeChatContent(TalkState talkState, ChatState chatState) {
    if (talkState.showSituationPicker) {
      return SituationPicker(
        onSituationSelected: (situation) {
          ref.read(talkProvider.notifier).setSituation(situation.label);
          ref.read(chatProvider.notifier).clearConversation();
          ref
              .read(chatProvider.notifier)
              .addSystemMessage(
                "Let's practice English in a situation: ${situation.labelEn}. "
                "I'll be the ${situation.aiRole} and you'll be the "
                '${situation.userRole}. '
                'Setting: ${situation.setting}. '
                "Let's begin!",
              );
        },
        onCustomInput: () {
          ref.read(talkProvider.notifier).toggleSituationPicker();
        },
        onClose: () {
          ref.read(talkProvider.notifier).toggleSituationPicker();
        },
      );
    }

    return ChatWindow(
      messages: chatState.messages,
      isLoading: chatState.isLoading,
      onSendMessage: (msg) => ref.read(chatProvider.notifier).sendMessage(msg),
      isVoiceMode: chatState.isVoiceMode,
      onToggleMode: _handleToggleVoiceMode,
      onStartVoice: _handleStartVoice,
      onStopVoice: _handleStopVoice,
      isRecording: chatState.isRecording,
      situationLabel: talkState.situationLabel,
      onClearSituation: () {
        ref.read(talkProvider.notifier).clearSituation();
      },
      isTTSPlaying: chatState.isTTSPlaying,
      onStartConversation: () {
        ref.read(chatProvider.notifier).sendMessage('Hello!');
      },
      onSetupSituation: () {
        ref.read(talkProvider.notifier).toggleSituationPicker();
      },
      mode: 'free',
    );
  }

  // -- Expression Practice ----------------------------------------------------

  Widget _buildExpressionContent({
    required TalkState talkState,
    required ChatState chatState,
  }) {
    final expression = talkState.expressionData?['expression'];

    return Column(
      children: [
        _buildExpressionCard(talkState),
        const SizedBox(height: 8),
        Expanded(
          child: ChatWindow(
            messages: chatState.messages,
            isLoading: chatState.isLoading,
            onSendMessage: (msg) =>
                ref.read(chatProvider.notifier).sendMessage(msg),
            isVoiceMode: chatState.isVoiceMode,
            onToggleMode: _handleToggleVoiceMode,
            onStartVoice: _handleStartVoice,
            onStopVoice: _handleStopVoice,
            isRecording: chatState.isRecording,
            isTTSPlaying: chatState.isTTSPlaying,
            mode: 'expression',
            expressionHint: expression,
          ),
        ),
      ],
    );
  }

  Widget _buildExpressionCard(TalkState talkState) {
    if (talkState.isLoadingExpression) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.primaryLight,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
        ),
        child: const Center(
          child: SizedBox(
            width: 24,
            height: 24,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              color: AppColors.primary,
            ),
          ),
        ),
      );
    }

    final data = talkState.expressionData;
    if (data == null) {
      return const SizedBox.shrink();
    }

    final expression = data['expression'] ?? '';
    final meaning = data['meaning'] ?? '';
    final example = data['example'];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primaryLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  expression,
                  style: AppTypography.heading3.copyWith(
                    color: AppColors.primaryDark,
                  ),
                ),
              ),
              _buildRefreshButton(),
              const SizedBox(width: 4),
              _buildPracticeButton(expression),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            meaning,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textPrimary.withValues(alpha: 0.7),
            ),
          ),
          if (example != null && example.isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '"$example"',
                style: AppTypography.bodySmall.copyWith(
                  fontStyle: FontStyle.italic,
                  color: AppColors.textPrimary.withValues(alpha: 0.6),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildRefreshButton() {
    return SizedBox(
      width: 32,
      height: 32,
      child: IconButton(
        onPressed: () {
          ref.read(talkProvider.notifier).loadExpression();
        },
        icon: const Icon(Icons.refresh_rounded, size: 18),
        padding: EdgeInsets.zero,
        color: AppColors.primary,
        tooltip: 'New Expression',
      ),
    );
  }

  Widget _buildPracticeButton(String expression) {
    return SizedBox(
      height: 32,
      child: TextButton(
        onPressed: () {
          ref.read(chatProvider.notifier).clearConversation();
          ref
              .read(chatProvider.notifier)
              .addSystemMessage(
                "Let's practice the expression: \"$expression\". "
                'Try using it in a sentence!',
              );
        },
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        child: Text(
          'Practice',
          style: AppTypography.caption.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  // -- Roleplay ---------------------------------------------------------------

  Widget _buildRoleplayContent({
    required RoleplayState roleplayState,
    required ChatState chatState,
  }) {
    if (!roleplayState.hasActiveSession) {
      return ScenarioPicker(
        scenarios: roleplayState.scenarios,
        isLoading: roleplayState.isLoading,
        onScenarioSelected: (scenario) {
          ref.read(roleplayProvider.notifier).startSession(scenario.id);
        },
      );
    }

    return Column(
      children: [
        _buildRoleplayHeader(roleplayState),
        if (roleplayState.isComplete) _buildCompletionBanner(),
        Expanded(
          child: ChatWindow(
            messages: chatState.messages,
            isLoading: chatState.isLoading,
            onSendMessage: (msg) =>
                ref.read(chatProvider.notifier).sendMessage(msg),
            isVoiceMode: chatState.isVoiceMode,
            onToggleMode: _handleToggleVoiceMode,
            onStartVoice: _handleStartVoice,
            onStopVoice: _handleStopVoice,
            isRecording: chatState.isRecording,
            isTTSPlaying: chatState.isTTSPlaying,
            mode: 'roleplay',
            currentStage: roleplayState.currentStage,
            totalStages: roleplayState.totalStages,
            learningTip: roleplayState.learningTip,
          ),
        ),
      ],
    );
  }

  Widget _buildRoleplayHeader(RoleplayState roleplayState) {
    final title = roleplayState.currentScenario?.title ?? 'Roleplay';
    final stage = roleplayState.currentStage;
    final total = roleplayState.totalStages;
    final progress = total > 0 ? stage / total : 0.0;
    final tip = roleplayState.learningTip;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: AppTypography.label.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              SizedBox(
                width: 32,
                height: 32,
                child: IconButton(
                  onPressed: _exitRoleplay,
                  icon: const Icon(Icons.close_rounded, size: 18),
                  padding: EdgeInsets.zero,
                  color: AppColors.textSecondary,
                  tooltip: 'Exit roleplay',
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text('Stage $stage/$total', style: AppTypography.caption),
              const SizedBox(width: 12),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progress,
                    backgroundColor: AppColors.border,
                    color: AppColors.primary,
                    minHeight: 6,
                  ),
                ),
              ),
            ],
          ),
          if (tip != null && tip.isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.lightbulb_outline_rounded,
                    size: 14,
                    color: AppColors.primaryDark,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      tip,
                      style: AppTypography.caption.copyWith(
                        color: AppColors.primaryDark,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildCompletionBanner() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.success.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.check_circle_rounded,
            color: AppColors.success,
            size: 20,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Roleplay complete! Great practice.',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.success,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          TextButton(
            onPressed: _exitRoleplay,
            style: TextButton.styleFrom(
              foregroundColor: AppColors.success,
              padding: const EdgeInsets.symmetric(horizontal: 12),
            ),
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  void _exitRoleplay() {
    ref.read(roleplayProvider.notifier).resetSession();
    ref.read(chatProvider.notifier).clearConversation();
  }
}
