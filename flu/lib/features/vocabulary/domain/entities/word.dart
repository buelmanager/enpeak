class Word {
  final String word;
  final String meaningKo;
  final String? partOfSpeech;
  final String? pronunciation;
  final String? level;
  final List<Map<String, String>>? idioms;
  final List<Map<String, String>>? examples;
  final List<String>? relatedWords;

  const Word({
    required this.word,
    required this.meaningKo,
    this.partOfSpeech,
    this.pronunciation,
    this.level,
    this.idioms,
    this.examples,
    this.relatedWords,
  });

  Word copyWith({
    String? word,
    String? meaningKo,
    String? partOfSpeech,
    String? pronunciation,
    String? level,
    List<Map<String, String>>? idioms,
    List<Map<String, String>>? examples,
    List<String>? relatedWords,
  }) {
    return Word(
      word: word ?? this.word,
      meaningKo: meaningKo ?? this.meaningKo,
      partOfSpeech: partOfSpeech ?? this.partOfSpeech,
      pronunciation: pronunciation ?? this.pronunciation,
      level: level ?? this.level,
      idioms: idioms ?? this.idioms,
      examples: examples ?? this.examples,
      relatedWords: relatedWords ?? this.relatedWords,
    );
  }
}
