import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_it/get_it.dart';

import 'package:flu/features/rag/data/models/daily_expression_model.dart';
import 'package:flu/features/rag/domain/repositories/rag_repository.dart';

class DailyState {
  final DailyExpressionModel? expression;
  final bool isLoading;
  final String? error;

  const DailyState({this.expression, this.isLoading = false, this.error});

  DailyState copyWith({
    DailyExpressionModel? expression,
    bool? isLoading,
    String? error,
  }) {
    return DailyState(
      expression: expression ?? this.expression,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class DailyNotifier extends StateNotifier<DailyState> {
  final RagRepository _ragRepository;

  DailyNotifier(this._ragRepository) : super(const DailyState()) {
    loadExpression();
  }

  Future<void> loadExpression() async {
    state = state.copyWith(isLoading: true, error: null);
    final result = await _ragRepository.getDailyExpression();
    result.when(
      ok: (expression) {
        state = DailyState(expression: expression);
      },
      err: (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
      },
    );
  }

  Future<void> refresh() async => loadExpression();
}

final ragRepositoryProvider = Provider<RagRepository>((ref) {
  return GetIt.instance<RagRepository>();
});

final dailyProvider = StateNotifierProvider<DailyNotifier, DailyState>((ref) {
  final ragRepo = ref.watch(ragRepositoryProvider);
  return DailyNotifier(ragRepo);
});
