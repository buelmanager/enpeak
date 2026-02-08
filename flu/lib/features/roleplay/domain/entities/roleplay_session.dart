import 'scenario.dart';

class RoleplaySession {
  final String sessionId;
  final Scenario scenario;
  final String aiMessage;
  final int currentStage;
  final int totalStages;
  final String? learningTip;
  final List<String> suggestedResponses;
  final bool isComplete;

  const RoleplaySession({
    required this.sessionId,
    required this.scenario,
    required this.aiMessage,
    required this.currentStage,
    required this.totalStages,
    this.learningTip,
    this.suggestedResponses = const [],
    this.isComplete = false,
  });

  RoleplaySession copyWith({
    String? sessionId,
    Scenario? scenario,
    String? aiMessage,
    int? currentStage,
    int? totalStages,
    String? learningTip,
    List<String>? suggestedResponses,
    bool? isComplete,
  }) {
    return RoleplaySession(
      sessionId: sessionId ?? this.sessionId,
      scenario: scenario ?? this.scenario,
      aiMessage: aiMessage ?? this.aiMessage,
      currentStage: currentStage ?? this.currentStage,
      totalStages: totalStages ?? this.totalStages,
      learningTip: learningTip ?? this.learningTip,
      suggestedResponses: suggestedResponses ?? this.suggestedResponses,
      isComplete: isComplete ?? this.isComplete,
    );
  }
}
