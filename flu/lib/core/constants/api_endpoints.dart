abstract final class ApiEndpoints {
  // Chat
  static const String chat = '/api/chat';
  static const String translate = '/api/translate';
  static String chatDelete(String id) => '/api/chat/$id';

  // Roleplay
  static const String roleplayScenarios = '/api/roleplay/scenarios';
  static String roleplayScenarioMetadata(String id) =>
      '/api/roleplay/scenarios/$id/metadata';
  static const String roleplayStart = '/api/roleplay/start';
  static const String roleplayTurn = '/api/roleplay/turn';
  static const String roleplayEnd = '/api/roleplay/end';

  // Speech
  static const String speechTts = '/api/speech/tts';
  static const String speechTtsStream = '/api/speech/tts/stream';
  static const String speechStt = '/api/speech/stt';
  static const String speechVoices = '/api/speech/voices';

  // Vocabulary
  static const String vocabularyLookup = '/api/vocabulary/lookup';
  static const String vocabularyAdd = '/api/vocabulary/add';
  static const String vocabularyExpand = '/api/vocabulary/expand';
  static const String vocabularyList = '/api/vocabulary/list';
  static String vocabularyRemove(String word) => '/api/vocabulary/remove/$word';
  static String vocabularyLevel(String level) => '/api/vocabulary/level/$level';
  static const String vocabularyEvaluate = '/api/vocabulary/evaluate';
  static String vocabularySearch(String query) =>
      '/api/vocabulary/search/$query';

  // RAG
  static const String ragSearch = '/api/rag/search';
  static String ragRelated(String word) => '/api/rag/related/$word';
  static const String ragDailyExpression = '/api/rag/daily-expression';
  static const String ragStats = '/api/rag/stats';

  // Feedback
  static const String feedbackGrammar = '/api/feedback/grammar';
  static const String feedbackQuickTip = '/api/feedback/quick-tip';

  // Scenarios (Community)
  static const String scenariosCreate = '/api/scenarios/create';
  static const String scenariosRefine = '/api/scenarios/refine';
  static const String scenariosFinalize = '/api/scenarios/finalize';
  static const String scenariosCommunity = '/api/scenarios/community';
  static String scenarioLike(String id) => '/api/scenarios/$id/like';
  static String scenarioPlay(String id) => '/api/scenarios/$id/play';

  // System
  static const String health = '/api/health';
  static const String info = '/api/info';
}
