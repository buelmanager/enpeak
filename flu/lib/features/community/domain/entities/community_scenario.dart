class CommunityScenario {
  final String id;
  final String title;
  final String? titleKo;
  final String? description;
  final String author;
  final String? authorId;
  final String place;
  final String situation;
  final String difficulty;
  final int likes;
  final int plays;
  final String createdAt;
  final List<Map<String, dynamic>> stages;
  final List<String> tags;
  final bool approved;

  const CommunityScenario({
    required this.id,
    required this.title,
    this.titleKo,
    this.description,
    required this.author,
    this.authorId,
    required this.place,
    required this.situation,
    required this.difficulty,
    this.likes = 0,
    this.plays = 0,
    required this.createdAt,
    this.stages = const [],
    this.tags = const [],
    this.approved = false,
  });
}
