class GrammarError {
  final String type;
  final String original;
  final String correction;
  final String explanation;

  const GrammarError({
    required this.type,
    required this.original,
    required this.correction,
    required this.explanation,
  });
}

class GrammarFeedback {
  final bool isCorrect;
  final String? correctedText;
  final List<GrammarError> errors;
  final String encouragement;
  final String? tip;

  const GrammarFeedback({
    required this.isCorrect,
    this.correctedText,
    this.errors = const [],
    required this.encouragement,
    this.tip,
  });
}
