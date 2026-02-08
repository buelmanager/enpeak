import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_constants.dart';
import 'package:flu/core/constants/app_typography.dart';
import '../providers/cards_provider.dart';
import '../providers/cards_state.dart';
import '../widgets/level_selector.dart';
import '../widgets/vocabulary_card.dart';
import '../widgets/card_actions.dart';
import '../widgets/idiom_expansion.dart';
import '../widgets/saved_words_tab.dart';
import '../widgets/quiz_mode_selector.dart';
import '../widgets/word_quiz_overlay.dart';
import '../widgets/sentence_quiz_overlay.dart';
import '../widgets/quiz/flashcard_quiz.dart';
import '../widgets/quiz/multiple_choice_quiz.dart';
import '../widgets/quiz/spelling_quiz.dart';
import '../widgets/quiz/listening_quiz.dart';
import '../widgets/quiz/gap_fill_quiz.dart';
import '../widgets/quiz/translation_quiz.dart';
import '../widgets/quiz/sentence_flashcard_quiz.dart';

class CardsScreen extends ConsumerStatefulWidget {
  const CardsScreen({super.key});

  @override
  ConsumerState<CardsScreen> createState() => _CardsScreenState();
}

class _CardsScreenState extends ConsumerState<CardsScreen> {
  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(cardsProvider);
    final notifier = ref.read(cardsProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('단어 학습'),
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_rounded),
        ),
        actions: [
          if (state.currentTab == CardsTab.level && state.words.isNotEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(
                  right: AppConstants.defaultPadding,
                ),
                child: Text(
                  state.progressText,
                  style: AppTypography.label.copyWith(color: AppColors.primary),
                ),
              ),
            ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              const SizedBox(height: 12),
              // Tab row
              _buildTabRow(state, notifier),
              const SizedBox(height: 12),
              // Body
              Expanded(child: _buildTabBody(state, notifier)),
            ],
          ),
          // QuizModeSelector overlay
          if (state.showQuizSelector)
            QuizModeSelector(
              onModeSelected: (mode, count, reviewOnly) {
                notifier.startQuiz(mode, count, reviewOnly);
              },
              onClose: notifier.hideQuizModeSelector,
              availableWords: state.isSentenceQuiz
                  ? state.savedSentences.length
                  : state.savedWords.length,
              reviewableWords: state.isSentenceQuiz
                  ? 0
                  : state.reviewableWordCount,
              isSentenceMode: state.isSentenceQuiz,
            ),
          // Quiz overlays (full-screen)
          if (state.isQuizActive) _buildQuizOverlay(state, notifier),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Tab row (pill toggle matching ModeSelector pattern)
  // ---------------------------------------------------------------------------

  Widget _buildTabRow(CardsState state, CardsNotifier notifier) {
    const tabs = [
      (CardsTab.level, '레벨별'),
      (CardsTab.saved, '저장한 단어'),
      (CardsTab.sentences, '저장한 문장'),
    ];

    final activeIndex = CardsTab.values.indexOf(state.currentTab);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppColors.borderLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final tabWidth = constraints.maxWidth / tabs.length;
          return SizedBox(
            height: 36,
            child: Stack(
              children: [
                // Sliding white indicator
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeInOut,
                  left: tabWidth * activeIndex,
                  top: 0,
                  bottom: 0,
                  width: tabWidth,
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x1F000000),
                          blurRadius: 4,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                  ),
                ),
                // Tab buttons
                Row(
                  children: tabs.map((tab) {
                    final isActive = state.currentTab == tab.$1;
                    return Expanded(
                      child: GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onTap: () => notifier.setTab(tab.$1),
                        child: Center(
                          child: AnimatedDefaultTextStyle(
                            duration: const Duration(milliseconds: 200),
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isActive
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                              color: isActive
                                  ? AppColors.textPrimary
                                  : AppColors.textSecondary,
                            ),
                            child: Text(tab.$2),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Tab body
  // ---------------------------------------------------------------------------

  Widget _buildTabBody(CardsState state, CardsNotifier notifier) {
    switch (state.currentTab) {
      case CardsTab.level:
        return _buildLevelTab(state, notifier);
      case CardsTab.saved:
        return _buildSavedWordsTab(state, notifier);
      case CardsTab.sentences:
        return _buildSavedSentencesTab(state, notifier);
    }
  }

  // Tab 0: Level-based (existing content)
  Widget _buildLevelTab(CardsState state, CardsNotifier notifier) {
    return Column(
      children: [
        LevelSelector(
          selectedLevel: state.selectedLevel,
          onLevelSelected: notifier.setLevel,
        ),
        const SizedBox(height: 20),
        Expanded(child: _buildLevelContent(state, notifier)),
      ],
    );
  }

  Widget _buildLevelContent(CardsState state, CardsNotifier notifier) {
    if (state.isLoading) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: AppColors.primary),
            SizedBox(height: 16),
            Text(
              '단어를 불러오는 중...',
              style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }

    if (state.error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppConstants.defaultPadding),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.error_outline_rounded,
                size: 48,
                color: AppColors.error,
              ),
              const SizedBox(height: 16),
              Text(
                state.error!,
                style: AppTypography.body,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => notifier.loadWords(state.selectedLevel),
                child: const Text(
                  '다시 시도',
                  style: TextStyle(color: AppColors.primary),
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (state.words.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.style_rounded,
              size: 64,
              color: AppColors.textSecondary.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              '${state.selectedLevel} 레벨의 단어가 없습니다',
              style: AppTypography.body,
            ),
          ],
        ),
      );
    }

    final currentWord = state.currentWord;
    if (currentWord == null) return const SizedBox.shrink();

    return SingleChildScrollView(
      child: Column(
        children: [
          VocabularyCard(
            key: ValueKey('${currentWord.word}_${state.currentIndex}'),
            word: currentWord,
            showMeaning: state.showMeaning,
            hideMode: state.hideMode,
            onTap: notifier.toggleMeaning,
          ),
          const SizedBox(height: 24),
          CardActions(
            hideMode: state.hideMode,
            hasPrevious: state.currentIndex > 0,
            hasNext: state.currentIndex < state.words.length - 1,
            onToggleHideMode: () {
              final newMode = state.hideMode == HideMode.hideMeaning
                  ? HideMode.hideWord
                  : HideMode.hideMeaning;
              notifier.setHideMode(newMode);
            },
            onPrevious: notifier.previousCard,
            onNext: notifier.nextCard,
            onExpandIdioms: notifier.expandWord,
          ),
          const SizedBox(height: 16),
          IdiomExpansion(
            expansion: state.expandedWord,
            isLoading: state.isExpanding,
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // Tab 1: Saved words
  Widget _buildSavedWordsTab(CardsState state, CardsNotifier notifier) {
    final filterStr = switch (state.wordFilter) {
      WordFilter.all => 'all',
      WordFilter.review => 'review',
      WordFilter.mastered => 'mastered',
    };

    final sortStr = switch (state.wordSortBy) {
      WordSortBy.date => 'latest',
      WordSortBy.mastery => 'mastery',
      WordSortBy.alphabet => 'alphabetical',
    };

    return SavedWordsTab(
      savedWords: state.savedWords,
      savedSentences: const [],
      onStartQuiz: () => notifier.showQuizModeSelector(false),
      onDeleteWord: (item) => notifier.removeSavedWord(item.word),
      onSpeak: (_) {},
      activeFilter: filterStr,
      activeSort: sortStr,
      onFilterChanged: (f) {
        final filter = switch (f) {
          'review' => WordFilter.review,
          'mastered' => WordFilter.mastered,
          _ => WordFilter.all,
        };
        notifier.setWordFilter(filter);
      },
      onSortChanged: (s) {
        final sort = switch (s) {
          'mastery' => WordSortBy.mastery,
          'alphabetical' => WordSortBy.alphabet,
          _ => WordSortBy.date,
        };
        notifier.setWordSortBy(sort);
      },
    );
  }

  // Tab 2: Saved sentences
  Widget _buildSavedSentencesTab(CardsState state, CardsNotifier notifier) {
    // Reuse SavedWordsTab in sentence mode: pass sentences as savedSentences
    // and empty list for savedWords so internal tab toggles to sentences view
    return SavedWordsTab(
      savedWords: const [],
      savedSentences: state.savedSentences
          .map(
            (s) => SavedWordData(
              word: s.sentence,
              meaning: s.translation,
              savedAt: DateTime.now(),
              mastery: s.mastery,
            ),
          )
          .toList(),
      onStartQuiz: () => notifier.showQuizModeSelector(true),
      onDeleteWord: (_) {},
      onSpeak: (_) {},
      onFilterChanged: (_) {},
      onSortChanged: (_) {},
    );
  }

  // ---------------------------------------------------------------------------
  // Quiz overlay
  // ---------------------------------------------------------------------------

  Widget _buildQuizOverlay(CardsState state, CardsNotifier notifier) {
    final isFinished = state.quizCurrentIndex >= state.quizTotal;
    final scorePercent = state.quizTotal > 0
        ? (state.quizScore / state.quizTotal) * 100
        : 0.0;

    if (state.isSentenceQuiz) {
      return SentenceQuizOverlay(
        currentIndex: state.quizCurrentIndex,
        totalCount: state.quizTotal,
        showResults: isFinished,
        correctCount: state.quizScore,
        wrongCount: state.quizTotal - state.quizScore,
        scorePercent: scorePercent,
        onClose: notifier.endQuiz,
        onComplete: notifier.endQuiz,
        child: _buildSentenceQuizChild(state, notifier),
      );
    }

    return WordQuizOverlay(
      currentIndex: state.quizCurrentIndex,
      totalCount: state.quizTotal,
      showResults: isFinished,
      correctCount: state.quizScore,
      wrongCount: state.quizTotal - state.quizScore,
      scorePercent: scorePercent,
      onClose: notifier.endQuiz,
      onComplete: notifier.endQuiz,
      child: _buildWordQuizChild(state, notifier),
    );
  }

  Widget _buildWordQuizChild(CardsState state, CardsNotifier notifier) {
    if (state.quizWords.isEmpty ||
        state.quizCurrentIndex >= state.quizWords.length) {
      return const SizedBox.shrink();
    }

    final currentWord = state.quizWords[state.quizCurrentIndex];

    switch (state.activeQuizMode) {
      case QuizMode.flashcard:
        return FlashcardQuiz(
          key: ValueKey('flashcard_${state.quizCurrentIndex}'),
          word: currentWord,
          onRate: (quality) {
            notifier.updateWordMastery(currentWord.word, quality);
            notifier.answerQuiz(quality >= 3);
          },
        );
      case QuizMode.multipleChoice:
        return MultipleChoiceQuiz(
          key: ValueKey('mc_${state.quizCurrentIndex}'),
          word: currentWord,
          allWords: state.quizWords,
          onAnswer: (correct) {
            notifier.updateWordMastery(currentWord.word, correct ? 5 : 1);
            notifier.answerQuiz(correct);
          },
        );
      case QuizMode.spelling:
        return SpellingQuiz(
          key: ValueKey('spelling_${state.quizCurrentIndex}'),
          word: currentWord,
          onAnswer: (quality) {
            notifier.updateWordMastery(currentWord.word, quality);
            notifier.answerQuiz(quality >= 3);
          },
        );
      case QuizMode.listening:
        return ListeningQuiz(
          key: ValueKey('listening_${state.quizCurrentIndex}'),
          word: currentWord,
          allWords: state.quizWords,
          onAnswer: (correct) {
            notifier.updateWordMastery(currentWord.word, correct ? 5 : 1);
            notifier.answerQuiz(correct);
          },
          onSpeak: () {},
          isSpeaking: false,
        );
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildSentenceQuizChild(CardsState state, CardsNotifier notifier) {
    if (state.savedSentences.isEmpty ||
        state.quizCurrentIndex >= state.savedSentences.length) {
      return const SizedBox.shrink();
    }

    final currentSentence = state.savedSentences[state.quizCurrentIndex];

    switch (state.activeQuizMode) {
      case QuizMode.flashcard:
        return SentenceFlashcardQuiz(
          key: ValueKey('sflash_${state.quizCurrentIndex}'),
          sentence: currentSentence.sentence,
          translation: currentSentence.translation,
          onRate: (quality) {
            notifier.answerQuiz(quality >= 3);
          },
        );
      case QuizMode.gapFill:
        return GapFillQuiz(
          key: ValueKey('gap_${state.quizCurrentIndex}'),
          sentence: currentSentence.sentence,
          translation: currentSentence.translation,
          onAnswer: (quality) {
            notifier.answerQuiz(quality >= 3);
          },
        );
      case QuizMode.translation:
        return TranslationQuiz(
          key: ValueKey('trans_${state.quizCurrentIndex}'),
          sentence: currentSentence.sentence,
          translation: currentSentence.translation,
          onAnswer: (quality) {
            notifier.answerQuiz(quality >= 3);
          },
        );
      default:
        return const SizedBox.shrink();
    }
  }
}
