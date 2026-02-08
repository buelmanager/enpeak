import 'package:flu/core/errors/result.dart';
import '../../data/models/community_scenario_model.dart';

abstract class CommunityRepository {
  Future<Result<List<CommunityScenarioModel>>> getScenarios({
    String? difficulty,
    String? sortBy,
  });
  Future<Result<CommunityScenarioModel>> getScenario(String id);
  Future<Result<CommunityScenarioModel>> createScenario({
    required String title,
    String? titleKo,
    String? description,
    required String place,
    required String situation,
    required String difficulty,
    required List<String> tags,
  });
  Future<Result<void>> likeScenario(String id);
}
