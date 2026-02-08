class Scenario {
  final String id;
  final String title;
  final String titleKo;
  final String category;
  final String difficulty;
  final String? description;
  final String? estimatedTime;
  final Map<String, String> roles;
  final List<ScenarioStage> stages;
  final List<KeyVocabulary> keyVocabulary;
  final int totalStages;
  final String? completionMessage;

  const Scenario({
    required this.id,
    required this.title,
    required this.titleKo,
    required this.category,
    required this.difficulty,
    this.description,
    this.estimatedTime,
    required this.roles,
    required this.stages,
    this.keyVocabulary = const [],
    required this.totalStages,
    this.completionMessage,
  });
}

class ScenarioStage {
  final int stage;
  final String name;
  final String? aiOpening;
  final String? aiLine;
  final String? learningTip;
  final List<String> suggestedResponses;
  final List<String>? acceptKeywords;

  const ScenarioStage({
    required this.stage,
    required this.name,
    this.aiOpening,
    this.aiLine,
    this.learningTip,
    this.suggestedResponses = const [],
    this.acceptKeywords,
  });
}

class KeyVocabulary {
  final String word;
  final String meaning;
  final String? example;

  const KeyVocabulary({
    required this.word,
    required this.meaning,
    this.example,
  });
}
