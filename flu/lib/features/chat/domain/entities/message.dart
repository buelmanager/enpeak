class Message {
  final String id;
  final String role;
  final String content;
  final List<String>? suggestions;
  final List<String>? betterExpressions;
  final String? learningTip;
  final bool ttsPlayed;
  final DateTime timestamp;

  const Message({
    required this.id,
    required this.role,
    required this.content,
    this.suggestions,
    this.betterExpressions,
    this.learningTip,
    this.ttsPlayed = false,
    required this.timestamp,
  });

  Message copyWith({
    String? id,
    String? role,
    String? content,
    List<String>? suggestions,
    List<String>? betterExpressions,
    String? learningTip,
    bool? ttsPlayed,
    DateTime? timestamp,
  }) {
    return Message(
      id: id ?? this.id,
      role: role ?? this.role,
      content: content ?? this.content,
      suggestions: suggestions ?? this.suggestions,
      betterExpressions: betterExpressions ?? this.betterExpressions,
      learningTip: learningTip ?? this.learningTip,
      ttsPlayed: ttsPlayed ?? this.ttsPlayed,
      timestamp: timestamp ?? this.timestamp,
    );
  }
}
