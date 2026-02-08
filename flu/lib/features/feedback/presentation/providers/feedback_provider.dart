import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_it/get_it.dart';

import 'package:flu/features/feedback/data/models/grammar_feedback_model.dart';
import 'package:flu/features/feedback/domain/repositories/feedback_repository.dart';

class FeedbackState {
  final GrammarFeedbackModel? grammarResult;
  final bool isCheckingGrammar;
  final bool isSubmitting;
  final String? error;
  final bool submitSuccess;

  const FeedbackState({
    this.grammarResult,
    this.isCheckingGrammar = false,
    this.isSubmitting = false,
    this.error,
    this.submitSuccess = false,
  });

  FeedbackState copyWith({
    GrammarFeedbackModel? grammarResult,
    bool clearGrammar = false,
    bool? isCheckingGrammar,
    bool? isSubmitting,
    String? error,
    bool? submitSuccess,
  }) {
    return FeedbackState(
      grammarResult: clearGrammar
          ? null
          : (grammarResult ?? this.grammarResult),
      isCheckingGrammar: isCheckingGrammar ?? this.isCheckingGrammar,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: error,
      submitSuccess: submitSuccess ?? this.submitSuccess,
    );
  }
}

class FeedbackNotifier extends StateNotifier<FeedbackState> {
  final FeedbackRepository _feedbackRepository;

  FeedbackNotifier(this._feedbackRepository) : super(const FeedbackState());

  Future<void> checkGrammar(String text) async {
    if (text.trim().isEmpty) return;
    state = state.copyWith(
      isCheckingGrammar: true,
      error: null,
      clearGrammar: true,
    );
    final result = await _feedbackRepository.checkGrammar(text);
    result.when(
      ok: (feedback) {
        state = state.copyWith(
          grammarResult: feedback,
          isCheckingGrammar: false,
        );
      },
      err: (failure) {
        state = state.copyWith(
          isCheckingGrammar: false,
          error: failure.message,
        );
      },
    );
  }

  Future<bool> submitFeatureRequest(String title, String description) async {
    if (title.trim().isEmpty || description.trim().isEmpty) return false;
    state = state.copyWith(
      isSubmitting: true,
      error: null,
      submitSuccess: false,
    );
    final result = await _feedbackRepository.submitFeatureRequest(
      title,
      description,
    );
    return result.when(
      ok: (_) {
        state = state.copyWith(isSubmitting: false, submitSuccess: true);
        return true;
      },
      err: (failure) {
        state = state.copyWith(isSubmitting: false, error: failure.message);
        return false;
      },
    );
  }

  void clearGrammarResult() {
    state = state.copyWith(clearGrammar: true);
  }

  void resetSubmitSuccess() {
    state = state.copyWith(submitSuccess: false);
  }
}

final feedbackRepositoryProvider = Provider<FeedbackRepository>((ref) {
  return GetIt.instance<FeedbackRepository>();
});

final feedbackProvider = StateNotifierProvider<FeedbackNotifier, FeedbackState>(
  (ref) {
    final repo = ref.watch(feedbackRepositoryProvider);
    return FeedbackNotifier(repo);
  },
);
