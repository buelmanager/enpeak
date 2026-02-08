class SearchResult {
  final String id;
  final String text;
  final String type;
  final String level;
  final String category;
  final Map<String, dynamic> metadata;
  final double? score;

  const SearchResult({
    required this.id,
    required this.text,
    required this.type,
    this.level = '',
    this.category = '',
    this.metadata = const {},
    this.score,
  });
}
