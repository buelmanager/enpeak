import 'dart:math';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flu/features/vocabulary/domain/entities/word.dart';
import 'package:flu/features/vocabulary/domain/repositories/vocabulary_repository.dart';
import 'package:flu/features/vocabulary/data/datasources/vocabulary_remote_datasource.dart';
import 'package:flu/features/vocabulary/data/datasources/vocabulary_local_datasource.dart';
import 'package:flu/features/vocabulary/data/repositories/vocabulary_repository_impl.dart';
import 'package:flu/core/di/injection.dart';
import 'package:flu/core/network/api_client.dart';
import 'package:flu/features/cards/presentation/widgets/saved_words_tab.dart';
import 'package:flu/features/cards/presentation/widgets/quiz_mode_selector.dart';
import 'cards_state.dart';

final vocabularyRepositoryProvider = Provider<VocabularyRepository>((ref) {
  final apiClient = sl<ApiClient>();
  final remoteDs = VocabularyRemoteDataSource(apiClient);
  final localDs = VocabularyLocalDataSource(sl());
  return VocabularyRepositoryImpl(remoteDs, localDs);
});

class CardsNotifier extends StateNotifier<CardsState> {
  final VocabularyRepository _repository;

  CardsNotifier(this._repository) : super(const CardsState()) {
    loadWords(state.selectedLevel);
    loadSavedWords();
  }

  // ---------------------------------------------------------------------------
  // Existing methods
  // ---------------------------------------------------------------------------

  Future<void> loadWords(String level) async {
    state = state.copyWith(
      isLoading: true,
      error: null,
      selectedLevel: level,
      currentIndex: 0,
      showMeaning: false,
      clearExpansion: true,
    );

    final result = await _repository.getWords(level: level);
    result.when(
      ok: (wordModels) {
        final words = wordModels.map((m) => m.toEntity()).toList();
        state = state.copyWith(isLoading: false, words: words);
      },
      err: (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
      },
    );
  }

  void nextCard() {
    if (state.currentIndex < state.words.length - 1) {
      state = state.copyWith(
        currentIndex: state.currentIndex + 1,
        showMeaning: false,
        clearExpansion: true,
      );
    }
  }

  void previousCard() {
    if (state.currentIndex > 0) {
      state = state.copyWith(
        currentIndex: state.currentIndex - 1,
        showMeaning: false,
        clearExpansion: true,
      );
    }
  }

  void goToCard(int index) {
    if (index >= 0 && index < state.words.length) {
      state = state.copyWith(
        currentIndex: index,
        showMeaning: false,
        clearExpansion: true,
      );
    }
  }

  void toggleMeaning() {
    state = state.copyWith(showMeaning: !state.showMeaning);
  }

  void setHideMode(HideMode mode) {
    state = state.copyWith(hideMode: mode, showMeaning: false);
  }

  void setLevel(String level) {
    if (level != state.selectedLevel) {
      loadWords(level);
    }
  }

  Future<void> expandWord() async {
    final word = state.currentWord;
    if (word == null) return;

    if (state.expandedWord?.word == word.word) {
      state = state.copyWith(clearExpansion: true);
      return;
    }

    state = state.copyWith(isExpanding: true, clearExpansion: true);

    final result = await _repository.expandWord(word.word);
    result.when(
      ok: (expansionModel) {
        state = state.copyWith(
          isExpanding: false,
          expandedWord: expansionModel.toEntity(),
        );
      },
      err: (failure) {
        state = state.copyWith(isExpanding: false, error: failure.message);
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Tab management
  // ---------------------------------------------------------------------------

  void setTab(CardsTab tab) {
    state = state.copyWith(currentTab: tab);
  }

  void setWordFilter(WordFilter filter) {
    state = state.copyWith(wordFilter: filter);
  }

  void setWordSortBy(WordSortBy sortBy) {
    state = state.copyWith(wordSortBy: sortBy);
  }

  // ---------------------------------------------------------------------------
  // Saved words management
  // ---------------------------------------------------------------------------

  void loadSavedWords() {
    // Mock: loads empty list (to be replaced with local storage later)
    state = state.copyWith(savedWords: const [], savedSentences: const []);
  }

  void removeSavedWord(String word) {
    final updated = state.savedWords.where((w) => w.word != word).toList();
    state = state.copyWith(savedWords: updated);
  }

  void saveWord(Word word) {
    // Prevent duplicates
    if (state.savedWords.any((w) => w.word == word.word)) return;

    final savedWord = SavedWordData(
      word: word.word,
      meaning: word.meaningKo,
      pronunciation: word.pronunciation,
      example: word.examples?.isNotEmpty == true
          ? word.examples!.first['en']
          : null,
      level: word.level,
      savedAt: DateTime.now(),
    );

    state = state.copyWith(savedWords: [...state.savedWords, savedWord]);
  }

  // ---------------------------------------------------------------------------
  // Quiz methods
  // ---------------------------------------------------------------------------

  void showQuizModeSelector(bool isSentence) {
    state = state.copyWith(showQuizSelector: true, isSentenceQuiz: isSentence);
  }

  void hideQuizModeSelector() {
    state = state.copyWith(showQuizSelector: false);
  }

  void startQuiz(QuizMode mode, int count, bool reviewOnly) {
    final rng = Random();

    if (state.isSentenceQuiz) {
      // For sentence quizzes, we don't use quizWords (Word list)
      state = state.copyWith(
        isQuizActive: true,
        activeQuizMode: mode,
        isReviewMode: reviewOnly,
        quizWordCount: count,
        quizScore: 0,
        quizTotal: count,
        quizCurrentIndex: 0,
        quizWords: const [],
        showQuizSelector: false,
      );
    } else {
      // Word quiz: pick from savedWords, convert to Word entities
      var pool = List<SavedWordData>.from(state.savedWords);
      if (reviewOnly) {
        pool = pool.where((w) => w.needsReview).toList();
      }
      pool.shuffle(rng);
      final selected = pool.take(count).toList();

      final quizWords = selected
          .map(
            (s) => Word(
              word: s.word,
              meaningKo: s.meaning,
              pronunciation: s.pronunciation,
              level: s.level,
            ),
          )
          .toList();

      state = state.copyWith(
        isQuizActive: true,
        activeQuizMode: mode,
        isReviewMode: reviewOnly,
        quizWordCount: count,
        quizScore: 0,
        quizTotal: quizWords.length,
        quizCurrentIndex: 0,
        quizWords: quizWords,
        showQuizSelector: false,
      );
    }
  }

  void answerQuiz(bool correct) {
    final newScore = correct ? state.quizScore + 1 : state.quizScore;
    final newIndex = state.quizCurrentIndex + 1;
    state = state.copyWith(quizScore: newScore, quizCurrentIndex: newIndex);
  }

  void endQuiz() {
    state = state.copyWith(
      isQuizActive: false,
      clearQuizMode: true,
      quizScore: 0,
      quizTotal: 0,
      quizCurrentIndex: 0,
      quizWords: const [],
      isReviewMode: false,
    );
  }

  // ---------------------------------------------------------------------------
  // SM-2 spaced repetition
  // ---------------------------------------------------------------------------

  void updateWordMastery(String word, int quality) {
    final updated = state.savedWords.map((w) {
      if (w.word != word) return w;

      int newMastery;
      if (quality >= 3) {
        newMastery = min(5, w.mastery + 1);
      } else {
        newMastery = max(0, w.mastery - 1);
      }

      // Interval based on mastery: 0=1min, 1=10min, 2=1day, 3=3days, 4=7days, 5=14days
      final intervals = <int, Duration>{
        0: const Duration(minutes: 1),
        1: const Duration(minutes: 10),
        2: const Duration(days: 1),
        3: const Duration(days: 3),
        4: const Duration(days: 7),
        5: const Duration(days: 14),
      };

      final interval = intervals[newMastery] ?? const Duration(days: 1);
      final nextReview = DateTime.now().add(interval);

      return SavedWordData(
        word: w.word,
        meaning: w.meaning,
        pronunciation: w.pronunciation,
        example: w.example,
        level: w.level,
        savedAt: w.savedAt,
        mastery: newMastery,
        reviewCount: w.reviewCount + 1,
        correctCount: quality >= 3 ? w.correctCount + 1 : w.correctCount,
        lastReviewedAt: DateTime.now(),
        nextReviewAt: nextReview,
      );
    }).toList();

    state = state.copyWith(savedWords: updated);
  }
}

final cardsProvider = StateNotifierProvider<CardsNotifier, CardsState>((ref) {
  final repo = ref.watch(vocabularyRepositoryProvider);
  return CardsNotifier(repo);
});
