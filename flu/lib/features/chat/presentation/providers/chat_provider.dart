import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_it/get_it.dart';

import '../../data/models/chat_request_model.dart';
import '../../domain/entities/message.dart';
import '../../domain/repositories/chat_repository.dart';
import '../../../speech/presentation/providers/tts_provider.dart';
import 'chat_state.dart';

class ChatNotifier extends StateNotifier<ChatState> {
  final ChatRepository _chatRepository;
  final Ref _ref;

  String? _activeScenarioId;
  int? _activeStage;

  ChatNotifier({required ChatRepository chatRepository, required Ref ref})
    : _chatRepository = chatRepository,
      _ref = ref,
      super(const ChatState());

  void setRoleplayContext({
    required String scenarioId,
    required int currentStage,
  }) {
    _activeScenarioId = scenarioId;
    _activeStage = currentStage;
  }

  void clearRoleplayContext() {
    _activeScenarioId = null;
    _activeStage = null;
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final userMessage = Message(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      role: 'user',
      content: text.trim(),
      timestamp: DateTime.now(),
    );

    state = state.copyWith(
      messages: [...state.messages, userMessage],
      isLoading: true,
      clearError: true,
      clearSttConfirmation: true,
    );

    final request = ChatRequestModel(
      message: text.trim(),
      conversationId: state.conversationId,
      scenarioId: _activeScenarioId,
      currentStage: _activeStage,
    );

    final result = await _chatRepository.sendMessage(request);

    result.when(
      ok: (response) {
        final aiMessage = Message(
          id: '${DateTime.now().millisecondsSinceEpoch}_ai',
          role: 'assistant',
          content: response.message,
          suggestions: response.suggestions,
          betterExpressions: response.betterExpressions,
          learningTip: response.learningTip,
          timestamp: DateTime.now(),
        );

        state = state.copyWith(
          messages: [...state.messages, aiMessage],
          isLoading: false,
          conversationId: response.conversationId.isNotEmpty
              ? response.conversationId
              : state.conversationId,
          suggestions: response.suggestions ?? [],
          betterExpressions: response.betterExpressions ?? [],
          learningTip: response.learningTip,
        );

        if (state.isVoiceMode && response.message.isNotEmpty) {
          _ref.read(ttsProvider.notifier).speak(response.message);
        }
      },
      err: (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
      },
    );
  }

  void clearConversation() {
    if (state.conversationId != null) {
      _chatRepository.clearConversation(state.conversationId!);
    }
    state = const ChatState();
    clearRoleplayContext();
  }

  void setVoiceMode(bool enabled) {
    state = state.copyWith(isVoiceMode: enabled);
  }

  void toggleVoiceMode() {
    state = state.copyWith(isVoiceMode: !state.isVoiceMode);
  }

  void togglePronunciationMode() {
    state = state.copyWith(isPronunciationMode: !state.isPronunciationMode);
  }

  void setRecording(bool recording) {
    state = state.copyWith(isRecording: recording);
  }

  void setSttConfirmation(String transcript, double confidence) {
    state = state.copyWith(
      sttTranscript: transcript,
      sttConfidence: confidence,
    );
  }

  void clearSttConfirmation() {
    state = state.copyWith(clearSttConfirmation: true);
  }

  void setTTSPlaying(bool playing) {
    state = state.copyWith(isTTSPlaying: playing);
  }

  Future<String?> translate(String text) async {
    final result = await _chatRepository.translate(text);
    return result.when(ok: (translation) => translation, err: (_) => null);
  }

  void addSystemMessage(String content) {
    final message = Message(
      id: '${DateTime.now().millisecondsSinceEpoch}_system',
      role: 'assistant',
      content: content,
      timestamp: DateTime.now(),
    );
    state = state.copyWith(messages: [...state.messages, message]);
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }
}

final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  return GetIt.instance<ChatRepository>();
});

final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  return ChatNotifier(
    chatRepository: ref.read(chatRepositoryProvider),
    ref: ref,
  );
});
