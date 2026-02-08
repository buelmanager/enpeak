class RoleplayReport {
  final String sessionId;
  final String scenarioTitle;
  final int totalTurns;
  final int overallScore;
  final List<String> strengths;
  final List<String> areasToImprove;
  final List<String> vocabularyHighlights;
  final String encouragement;

  const RoleplayReport({
    required this.sessionId,
    required this.scenarioTitle,
    required this.totalTurns,
    required this.overallScore,
    this.strengths = const [],
    this.areasToImprove = const [],
    this.vocabularyHighlights = const [],
    required this.encouragement,
  });
}
