import 'package:flu/core/errors/result.dart';
import '../../domain/repositories/community_repository.dart';
import '../datasources/community_remote_datasource.dart';
import '../models/community_scenario_model.dart';

class CommunityRepositoryImpl implements CommunityRepository {
  final CommunityRemoteDataSource _remoteDataSource;

  CommunityRepositoryImpl(this._remoteDataSource);

  @override
  Future<Result<List<CommunityScenarioModel>>> getScenarios({
    String? difficulty,
    String? sortBy,
  }) async {
    return _remoteDataSource.getScenarios(
      difficulty: difficulty,
      sortBy: sortBy,
    );
  }

  @override
  Future<Result<CommunityScenarioModel>> getScenario(String id) async {
    return _remoteDataSource.getScenario(id);
  }

  @override
  Future<Result<CommunityScenarioModel>> createScenario({
    required String title,
    String? titleKo,
    String? description,
    required String place,
    required String situation,
    required String difficulty,
    required List<String> tags,
  }) async {
    return _remoteDataSource.createScenario(
      title: title,
      titleKo: titleKo,
      description: description,
      place: place,
      situation: situation,
      difficulty: difficulty,
      tags: tags,
    );
  }

  @override
  Future<Result<void>> likeScenario(String id) async {
    return _remoteDataSource.likeScenario(id);
  }
}
