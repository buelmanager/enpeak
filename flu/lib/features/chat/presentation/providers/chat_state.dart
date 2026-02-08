import '../../domain/entities/message.dart';

class ChatState {
  final List<Message> messages;
  final bool isLoading;
  final String? conversationId;
  final String? error;
  final bool isVoiceMode;
  final bool isPronunciationMode;
  final bool isRecording;
  final String? sttTranscript;
  final double? sttConfidence;
  final bool isTTSPlaying;
  final List<String> suggestions;
  final List<String> betterExpressions;
  final String? learningTip;

  const ChatState({
    this.messages = const [],
    this.isLoading = false,
    this.conversationId,
    this.error,
    this.isVoiceMode = false,
    this.isPronunciationMode = false,
    this.isRecording = false,
    this.sttTranscript,
    this.sttConfidence,
    this.isTTSPlaying = false,
    this.suggestions = const [],
    this.betterExpressions = const [],
    this.learningTip,
  });

  ChatState copyWith({
    List<Message>? messages,
    bool? isLoading,
    String? conversationId,
    String? error,
    bool? isVoiceMode,
    bool? isPronunciationMode,
    bool? isRecording,
    String? sttTranscript,
    double? sttConfidence,
    bool? isTTSPlaying,
    List<String>? suggestions,
    List<String>? betterExpressions,
    String? learningTip,
    bool clearError = false,
    bool clearConversationId = false,
    bool clearLearningTip = false,
    bool clearSttConfirmation = false,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      conversationId: clearConversationId
          ? null
          : (conversationId ?? this.conversationId),
      error: clearError ? null : (error ?? this.error),
      isVoiceMode: isVoiceMode ?? this.isVoiceMode,
      isPronunciationMode: isPronunciationMode ?? this.isPronunciationMode,
      isRecording: isRecording ?? this.isRecording,
      sttTranscript: clearSttConfirmation
          ? null
          : (sttTranscript ?? this.sttTranscript),
      sttConfidence: clearSttConfirmation
          ? null
          : (sttConfidence ?? this.sttConfidence),
      isTTSPlaying: isTTSPlaying ?? this.isTTSPlaying,
      suggestions: suggestions ?? this.suggestions,
      betterExpressions: betterExpressions ?? this.betterExpressions,
      learningTip: clearLearningTip ? null : (learningTip ?? this.learningTip),
    );
  }
}
