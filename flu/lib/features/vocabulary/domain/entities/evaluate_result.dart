class EvaluateResult {
  final bool correct;
  final bool shouldLevelUp;
  final int streak;
  final String? feedback;
  final String? nextLevel;

  const EvaluateResult({
    required this.correct,
    this.shouldLevelUp = false,
    this.streak = 0,
    this.feedback,
    this.nextLevel,
  });
}
