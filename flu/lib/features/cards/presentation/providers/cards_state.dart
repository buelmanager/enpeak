import 'package:flu/features/vocabulary/domain/entities/word.dart';
import 'package:flu/features/vocabulary/domain/entities/word_expansion.dart';
import 'package:flu/features/cards/presentation/widgets/saved_words_tab.dart';
import 'package:flu/features/cards/presentation/widgets/quiz/gap_fill_quiz.dart';
import 'package:flu/features/cards/presentation/widgets/quiz_mode_selector.dart';

enum HideMode { hideMeaning, hideWord }

enum CardsTab { level, saved, sentences }

enum WordFilter { all, review, mastered }

enum WordSortBy { date, mastery, alphabet }

class CardsState {
  // Existing fields
  final String selectedLevel;
  final List<Word> words;
  final int currentIndex;
  final bool isLoading;
  final String? error;
  final bool showMeaning;
  final WordExpansion? expandedWord;
  final HideMode hideMode;
  final bool isExpanding;

  // Tab management
  final CardsTab currentTab;
  final WordFilter wordFilter;
  final WordSortBy wordSortBy;

  // Saved data
  final List<SavedWordData> savedWords;
  final List<SentenceQuizData> savedSentences;

  // Quiz state
  final bool isQuizActive;
  final QuizMode? activeQuizMode;
  final bool isSentenceQuiz;
  final int quizWordCount;
  final bool isReviewMode;
  final int quizScore;
  final int quizTotal;
  final int quizCurrentIndex;
  final List<Word> quizWords;
  final bool showQuizSelector;

  const CardsState({
    this.selectedLevel = 'A1',
    this.words = const [],
    this.currentIndex = 0,
    this.isLoading = false,
    this.error,
    this.showMeaning = false,
    this.expandedWord,
    this.hideMode = HideMode.hideMeaning,
    this.isExpanding = false,
    this.currentTab = CardsTab.level,
    this.wordFilter = WordFilter.all,
    this.wordSortBy = WordSortBy.date,
    this.savedWords = const [],
    this.savedSentences = const [],
    this.isQuizActive = false,
    this.activeQuizMode,
    this.isSentenceQuiz = false,
    this.quizWordCount = 10,
    this.isReviewMode = false,
    this.quizScore = 0,
    this.quizTotal = 0,
    this.quizCurrentIndex = 0,
    this.quizWords = const [],
    this.showQuizSelector = false,
  });

  CardsState copyWith({
    String? selectedLevel,
    List<Word>? words,
    int? currentIndex,
    bool? isLoading,
    String? error,
    bool? showMeaning,
    WordExpansion? expandedWord,
    bool clearExpansion = false,
    HideMode? hideMode,
    bool? isExpanding,
    CardsTab? currentTab,
    WordFilter? wordFilter,
    WordSortBy? wordSortBy,
    List<SavedWordData>? savedWords,
    List<SentenceQuizData>? savedSentences,
    bool? isQuizActive,
    QuizMode? activeQuizMode,
    bool clearQuizMode = false,
    bool? isSentenceQuiz,
    int? quizWordCount,
    bool? isReviewMode,
    int? quizScore,
    int? quizTotal,
    int? quizCurrentIndex,
    List<Word>? quizWords,
    bool? showQuizSelector,
  }) {
    return CardsState(
      selectedLevel: selectedLevel ?? this.selectedLevel,
      words: words ?? this.words,
      currentIndex: currentIndex ?? this.currentIndex,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      showMeaning: showMeaning ?? this.showMeaning,
      expandedWord: clearExpansion ? null : (expandedWord ?? this.expandedWord),
      hideMode: hideMode ?? this.hideMode,
      isExpanding: isExpanding ?? this.isExpanding,
      currentTab: currentTab ?? this.currentTab,
      wordFilter: wordFilter ?? this.wordFilter,
      wordSortBy: wordSortBy ?? this.wordSortBy,
      savedWords: savedWords ?? this.savedWords,
      savedSentences: savedSentences ?? this.savedSentences,
      isQuizActive: isQuizActive ?? this.isQuizActive,
      activeQuizMode: clearQuizMode
          ? null
          : (activeQuizMode ?? this.activeQuizMode),
      isSentenceQuiz: isSentenceQuiz ?? this.isSentenceQuiz,
      quizWordCount: quizWordCount ?? this.quizWordCount,
      isReviewMode: isReviewMode ?? this.isReviewMode,
      quizScore: quizScore ?? this.quizScore,
      quizTotal: quizTotal ?? this.quizTotal,
      quizCurrentIndex: quizCurrentIndex ?? this.quizCurrentIndex,
      quizWords: quizWords ?? this.quizWords,
      showQuizSelector: showQuizSelector ?? this.showQuizSelector,
    );
  }

  // Existing getters
  Word? get currentWord => words.isNotEmpty && currentIndex < words.length
      ? words[currentIndex]
      : null;

  String get progressText =>
      words.isEmpty ? '0/0' : '${currentIndex + 1}/${words.length}';

  // Computed getters for saved words
  List<SavedWordData> get filteredSavedWords {
    var items = List<SavedWordData>.from(savedWords);

    switch (wordFilter) {
      case WordFilter.all:
        break;
      case WordFilter.review:
        items = items.where((w) => w.needsReview).toList();
      case WordFilter.mastered:
        items = items.where((w) => w.mastery >= 4).toList();
    }

    switch (wordSortBy) {
      case WordSortBy.date:
        items.sort((a, b) => b.savedAt.compareTo(a.savedAt));
      case WordSortBy.mastery:
        items.sort((a, b) => b.mastery.compareTo(a.mastery));
      case WordSortBy.alphabet:
        items.sort((a, b) => a.word.compareTo(b.word));
    }

    return items;
  }

  int get reviewableWordCount => savedWords.where((w) => w.needsReview).length;

  int get masteredWordCount => savedWords.where((w) => w.mastery >= 4).length;
}
