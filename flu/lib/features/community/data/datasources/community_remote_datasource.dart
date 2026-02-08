import 'package:flu/core/network/api_client.dart';
import 'package:flu/core/constants/api_endpoints.dart';
import 'package:flu/core/errors/result.dart';
import '../models/community_scenario_model.dart';

class CommunityRemoteDataSource {
  final ApiClient _apiClient;

  CommunityRemoteDataSource(this._apiClient);

  Future<Result<List<CommunityScenarioModel>>> getScenarios({
    String? difficulty,
    String? sortBy,
  }) async {
    final queryParams = <String, dynamic>{};
    if (difficulty != null) queryParams['difficulty'] = difficulty;
    if (sortBy != null) queryParams['sort_by'] = sortBy;

    final result = await _apiClient.get(
      ApiEndpoints.scenariosCommunity,
      queryParameters: queryParams.isNotEmpty ? queryParams : null,
    );
    return result.when(
      ok: (data) {
        final scenarios = (data['scenarios'] as List<dynamic>? ?? [])
            .map(
              (e) => CommunityScenarioModel.fromJson(e as Map<String, dynamic>),
            )
            .toList();
        return Ok(scenarios);
      },
      err: (failure) => Err(failure),
    );
  }

  Future<Result<CommunityScenarioModel>> getScenario(String id) async {
    final result = await _apiClient.get(
      '${ApiEndpoints.scenariosCommunity}/$id',
    );
    return result.when(
      ok: (data) => Ok(CommunityScenarioModel.fromJson(data)),
      err: (failure) => Err(failure),
    );
  }

  Future<Result<CommunityScenarioModel>> createScenario({
    required String title,
    String? titleKo,
    String? description,
    required String place,
    required String situation,
    required String difficulty,
    required List<String> tags,
  }) async {
    final result = await _apiClient.post(
      ApiEndpoints.scenariosCommunity,
      data: {
        'title': title,
        'title_ko': titleKo,
        'description': description,
        'place': place,
        'situation': situation,
        'difficulty': difficulty,
        'tags': tags,
      },
    );
    return result.when(
      ok: (data) => Ok(CommunityScenarioModel.fromJson(data)),
      err: (failure) => Err(failure),
    );
  }

  Future<Result<void>> likeScenario(String id) async {
    final result = await _apiClient.post(
      '${ApiEndpoints.scenariosCommunity}/$id/like',
    );
    return result.when(
      ok: (_) => const Ok(null),
      err: (failure) => Err(failure),
    );
  }
}
