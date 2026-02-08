import 'package:flu/core/network/api_client.dart';
import 'package:flu/core/constants/api_endpoints.dart';
import 'package:flu/core/errors/result.dart';
import '../models/scenario_model.dart';
import '../models/roleplay_session_model.dart';
import '../models/roleplay_report_model.dart';

class RoleplayRemoteDataSource {
  final ApiClient _apiClient;

  RoleplayRemoteDataSource(this._apiClient);

  Future<Result<List<ScenarioModel>>> getScenarios() async {
    final result = await _apiClient.get(ApiEndpoints.roleplayScenarios);
    return result.when(
      ok: (data) {
        final scenarios = (data['scenarios'] as List<dynamic>? ?? [])
            .map((e) => ScenarioModel.fromJson(e as Map<String, dynamic>))
            .toList();
        return Ok(scenarios);
      },
      err: (failure) => Err(failure),
    );
  }

  Future<Result<ScenarioModel>> getScenario(String scenarioId) async {
    final result = await _apiClient.get(
      '${ApiEndpoints.roleplayScenarios}/$scenarioId',
    );
    return result.when(
      ok: (data) => Ok(ScenarioModel.fromJson(data)),
      err: (failure) => Err(failure),
    );
  }

  Future<Result<RoleplaySessionModel>> startSession(String scenarioId) async {
    final result = await _apiClient.post(
      ApiEndpoints.roleplayStart,
      data: {'scenario_id': scenarioId},
    );
    return result.when(
      ok: (data) => Ok(RoleplaySessionModel.fromJson(data)),
      err: (failure) => Err(failure),
    );
  }

  Future<Result<RoleplaySessionModel>> sendTurn(
    String sessionId,
    String message,
  ) async {
    final result = await _apiClient.post(
      ApiEndpoints.roleplayTurn,
      data: {'session_id': sessionId, 'message': message},
    );
    return result.when(
      ok: (data) => Ok(RoleplaySessionModel.fromJson(data)),
      err: (failure) => Err(failure),
    );
  }

  Future<Result<RoleplayReportModel>> endSession(String sessionId) async {
    final result = await _apiClient.post(
      ApiEndpoints.roleplayEnd,
      data: {'session_id': sessionId},
    );
    return result.when(
      ok: (data) => Ok(RoleplayReportModel.fromJson(data)),
      err: (failure) => Err(failure),
    );
  }
}
