import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_it/get_it.dart';

import '../../domain/entities/roleplay_report.dart';
import '../../domain/entities/scenario.dart';
import '../../domain/repositories/roleplay_repository.dart';

class RoleplayState {
  final List<Scenario> scenarios;
  final String? currentSessionId;
  final Scenario? currentScenario;
  final int currentStage;
  final int totalStages;
  final bool isComplete;
  final RoleplayReport? report;
  final bool isLoading;
  final String? aiMessage;
  final String? learningTip;
  final List<String> suggestedResponses;
  final String? error;

  const RoleplayState({
    this.scenarios = const [],
    this.currentSessionId,
    this.currentScenario,
    this.currentStage = 0,
    this.totalStages = 0,
    this.isComplete = false,
    this.report,
    this.isLoading = false,
    this.aiMessage,
    this.learningTip,
    this.suggestedResponses = const [],
    this.error,
  });

  RoleplayState copyWith({
    List<Scenario>? scenarios,
    String? currentSessionId,
    Scenario? currentScenario,
    int? currentStage,
    int? totalStages,
    bool? isComplete,
    RoleplayReport? report,
    bool? isLoading,
    String? aiMessage,
    String? learningTip,
    List<String>? suggestedResponses,
    String? error,
    bool clearSession = false,
    bool clearReport = false,
    bool clearError = false,
  }) {
    return RoleplayState(
      scenarios: scenarios ?? this.scenarios,
      currentSessionId: clearSession
          ? null
          : (currentSessionId ?? this.currentSessionId),
      currentScenario: clearSession
          ? null
          : (currentScenario ?? this.currentScenario),
      currentStage: clearSession ? 0 : (currentStage ?? this.currentStage),
      totalStages: clearSession ? 0 : (totalStages ?? this.totalStages),
      isComplete: clearSession ? false : (isComplete ?? this.isComplete),
      report: clearReport ? null : (report ?? this.report),
      isLoading: isLoading ?? this.isLoading,
      aiMessage: clearSession ? null : (aiMessage ?? this.aiMessage),
      learningTip: clearSession ? null : (learningTip ?? this.learningTip),
      suggestedResponses: clearSession
          ? const []
          : (suggestedResponses ?? this.suggestedResponses),
      error: clearError ? null : (error ?? this.error),
    );
  }

  bool get hasActiveSession => currentSessionId != null;
}

class RoleplayNotifier extends StateNotifier<RoleplayState> {
  final RoleplayRepository _roleplayRepository;

  RoleplayNotifier({required RoleplayRepository roleplayRepository})
    : _roleplayRepository = roleplayRepository,
      super(const RoleplayState());

  Future<void> loadScenarios() async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _roleplayRepository.getScenarios();

    result.when(
      ok: (models) {
        final entities = models.map((m) => m.toEntity()).toList();
        state = state.copyWith(scenarios: entities, isLoading: false);
      },
      err: (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
      },
    );
  }

  Future<void> startSession(String scenarioId) async {
    state = state.copyWith(
      isLoading: true,
      clearError: true,
      clearReport: true,
    );

    final result = await _roleplayRepository.startSession(scenarioId);

    result.when(
      ok: (session) {
        state = state.copyWith(
          currentSessionId: session.sessionId,
          currentScenario: session.scenario.toEntity(),
          currentStage: session.currentStage,
          totalStages: session.totalStages,
          aiMessage: session.aiMessage,
          learningTip: session.learningTip,
          suggestedResponses: session.suggestedResponses,
          isComplete: false,
          isLoading: false,
        );
      },
      err: (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
      },
    );
  }

  Future<void> sendTurn(String message) async {
    if (state.currentSessionId == null) return;

    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _roleplayRepository.sendTurn(
      state.currentSessionId!,
      message,
    );

    result.when(
      ok: (session) {
        state = state.copyWith(
          currentStage: session.currentStage,
          totalStages: session.totalStages,
          aiMessage: session.aiMessage,
          learningTip: session.learningTip,
          suggestedResponses: session.suggestedResponses,
          isComplete: session.isComplete,
          isLoading: false,
        );
      },
      err: (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
      },
    );
  }

  Future<void> endSession() async {
    if (state.currentSessionId == null) return;

    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _roleplayRepository.endSession(
      state.currentSessionId!,
    );

    result.when(
      ok: (reportModel) {
        state = state.copyWith(
          report: reportModel.toEntity(),
          isComplete: true,
          isLoading: false,
        );
      },
      err: (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
      },
    );
  }

  void resetSession() {
    state = state.copyWith(clearSession: true, clearReport: true);
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }
}

final roleplayRepositoryProvider = Provider<RoleplayRepository>((ref) {
  return GetIt.instance<RoleplayRepository>();
});

final roleplayProvider = StateNotifierProvider<RoleplayNotifier, RoleplayState>(
  (ref) {
    return RoleplayNotifier(
      roleplayRepository: ref.read(roleplayRepositoryProvider),
    );
  },
);
