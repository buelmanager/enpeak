class DailyExpression {
  final String expression;
  final String meaning;
  final String example;
  final String exampleKo;
  final String category;
  final String level;

  const DailyExpression({
    required this.expression,
    required this.meaning,
    required this.example,
    required this.exampleKo,
    this.category = '',
    this.level = '',
  });
}
