import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_it/get_it.dart';

import '../../../rag/domain/repositories/rag_repository.dart';
import '../../../roleplay/domain/entities/scenario.dart';

enum TalkMode { free, expression, roleplay }

class TalkState {
  final TalkMode mode;
  final Map<String, String>? expressionData;
  final Scenario? scenarioData;
  final bool isLoadingExpression;
  final String? error;
  final String? situationLabel;
  final bool showSituationPicker;

  const TalkState({
    this.mode = TalkMode.free,
    this.expressionData,
    this.scenarioData,
    this.isLoadingExpression = false,
    this.error,
    this.situationLabel,
    this.showSituationPicker = false,
  });

  TalkState copyWith({
    TalkMode? mode,
    Map<String, String>? expressionData,
    Scenario? scenarioData,
    bool? isLoadingExpression,
    String? error,
    String? situationLabel,
    bool? showSituationPicker,
    bool clearExpression = false,
    bool clearScenario = false,
    bool clearError = false,
    bool clearSituation = false,
  }) {
    return TalkState(
      mode: mode ?? this.mode,
      expressionData: clearExpression
          ? null
          : (expressionData ?? this.expressionData),
      scenarioData: clearScenario ? null : (scenarioData ?? this.scenarioData),
      isLoadingExpression: isLoadingExpression ?? this.isLoadingExpression,
      error: clearError ? null : (error ?? this.error),
      situationLabel: clearSituation
          ? null
          : (situationLabel ?? this.situationLabel),
      showSituationPicker: showSituationPicker ?? this.showSituationPicker,
    );
  }
}

const List<Map<String, String>> _fallbackExpressions = [
  {
    'expression': 'Break the ice',
    'meaning': 'To initiate a conversation in an awkward situation',
  },
  {
    'expression': 'Hit the nail on the head',
    'meaning': 'To describe exactly what is causing a situation or problem',
  },
  {'expression': 'Under the weather', 'meaning': 'Feeling ill or sick'},
  {
    'expression': 'A piece of cake',
    'meaning': 'Something that is very easy to do',
  },
  {
    'expression': 'Let the cat out of the bag',
    'meaning': 'To reveal a secret accidentally',
  },
  {'expression': 'Cost an arm and a leg', 'meaning': 'To be very expensive'},
];

class TalkNotifier extends StateNotifier<TalkState> {
  final RagRepository _ragRepository;

  TalkNotifier({required RagRepository ragRepository})
    : _ragRepository = ragRepository,
      super(const TalkState());

  void setMode(TalkMode mode) {
    state = state.copyWith(mode: mode);
  }

  Future<void> loadExpression() async {
    state = state.copyWith(isLoadingExpression: true, clearError: true);

    final result = await _ragRepository.getDailyExpression();

    result.when(
      ok: (model) {
        state = state.copyWith(
          expressionData: {
            'expression': model.expression,
            'meaning': model.meaning,
            'example': model.example,
            'exampleKo': model.exampleKo,
          },
          isLoadingExpression: false,
        );
      },
      err: (failure) {
        final fallback =
            _fallbackExpressions[DateTime.now().millisecond %
                _fallbackExpressions.length];
        state = state.copyWith(
          expressionData: fallback,
          isLoadingExpression: false,
        );
      },
    );
  }

  void selectScenario(Scenario scenario) {
    state = state.copyWith(scenarioData: scenario, mode: TalkMode.roleplay);
  }

  void clearScenario() {
    state = state.copyWith(clearScenario: true);
  }

  void clearExpression() {
    state = state.copyWith(clearExpression: true);
  }

  void setSituation(String label) {
    state = state.copyWith(situationLabel: label, showSituationPicker: false);
  }

  void clearSituation() {
    state = state.copyWith(clearSituation: true);
  }

  void toggleSituationPicker() {
    state = state.copyWith(showSituationPicker: !state.showSituationPicker);
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }
}

final ragRepositoryProvider = Provider<RagRepository>((ref) {
  return GetIt.instance<RagRepository>();
});

final talkProvider = StateNotifierProvider<TalkNotifier, TalkState>((ref) {
  return TalkNotifier(ragRepository: ref.read(ragRepositoryProvider));
});
