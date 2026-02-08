import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_it/get_it.dart';

import 'package:flu/features/community/domain/repositories/community_repository.dart';
import 'package:flu/features/community/data/models/community_scenario_model.dart';

class CreateState {
  final String title;
  final String place;
  final String situation;
  final String difficulty;
  final List<String> tags;
  final bool isSubmitting;
  final String? error;
  final bool submitSuccess;
  final CommunityScenarioModel? createdScenario;

  const CreateState({
    this.title = '',
    this.place = '',
    this.situation = '',
    this.difficulty = 'beginner',
    this.tags = const [],
    this.isSubmitting = false,
    this.error,
    this.submitSuccess = false,
    this.createdScenario,
  });

  CreateState copyWith({
    String? title,
    String? place,
    String? situation,
    String? difficulty,
    List<String>? tags,
    bool? isSubmitting,
    String? error,
    bool clearError = false,
    bool? submitSuccess,
    CommunityScenarioModel? createdScenario,
    bool clearCreatedScenario = false,
  }) {
    return CreateState(
      title: title ?? this.title,
      place: place ?? this.place,
      situation: situation ?? this.situation,
      difficulty: difficulty ?? this.difficulty,
      tags: tags ?? this.tags,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: clearError ? null : (error ?? this.error),
      submitSuccess: submitSuccess ?? this.submitSuccess,
      createdScenario: clearCreatedScenario
          ? null
          : (createdScenario ?? this.createdScenario),
    );
  }
}

class CreateNotifier extends StateNotifier<CreateState> {
  final CommunityRepository _communityRepository;

  CreateNotifier(this._communityRepository) : super(const CreateState());

  void setTitle(String value) {
    state = state.copyWith(title: value, clearError: true);
  }

  void setPlace(String value) {
    state = state.copyWith(place: value, clearError: true);
  }

  void setSituation(String value) {
    state = state.copyWith(situation: value, clearError: true);
  }

  void setDifficulty(String value) {
    state = state.copyWith(difficulty: value, clearError: true);
  }

  void addTag(String tag) {
    if (tag.trim().isEmpty) return;
    final normalised = tag.trim().toLowerCase();
    if (state.tags.contains(normalised)) return;
    state = state.copyWith(tags: [...state.tags, normalised]);
  }

  void removeTag(String tag) {
    state = state.copyWith(tags: state.tags.where((t) => t != tag).toList());
  }

  Future<void> submitScenario() async {
    if (state.title.trim().isEmpty ||
        state.place.trim().isEmpty ||
        state.situation.trim().isEmpty) {
      state = state.copyWith(error: 'Please fill in all required fields.');
      return;
    }

    state = state.copyWith(
      isSubmitting: true,
      clearError: true,
      submitSuccess: false,
      clearCreatedScenario: true,
    );

    final result = await _communityRepository.createScenario(
      title: state.title.trim(),
      place: state.place.trim(),
      situation: state.situation.trim(),
      difficulty: state.difficulty,
      tags: state.tags,
    );

    result.when(
      ok: (scenario) {
        state = state.copyWith(
          isSubmitting: false,
          submitSuccess: true,
          createdScenario: scenario,
        );
      },
      err: (failure) {
        state = state.copyWith(isSubmitting: false, error: failure.message);
      },
    );
  }

  void reset() {
    state = const CreateState();
  }
}

final communityRepositoryProvider = Provider<CommunityRepository>((ref) {
  return GetIt.instance<CommunityRepository>();
});

final createProvider = StateNotifierProvider<CreateNotifier, CreateState>((
  ref,
) {
  final repo = ref.watch(communityRepositoryProvider);
  return CreateNotifier(repo);
});
