class WordExpansion {
  final String word;
  final List<IdiomInfo> idioms;
  final List<SentenceInfo> sentences;
  final List<String> relatedWords;

  const WordExpansion({
    required this.word,
    this.idioms = const [],
    this.sentences = const [],
    this.relatedWords = const [],
  });
}

class IdiomInfo {
  final String phrase;
  final String meaning;

  const IdiomInfo({required this.phrase, required this.meaning});
}

class SentenceInfo {
  final String en;
  final String ko;

  const SentenceInfo({required this.en, required this.ko});
}
