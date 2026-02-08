import 'package:flu/core/errors/result.dart';
import '../../domain/repositories/roleplay_repository.dart';
import '../datasources/roleplay_remote_datasource.dart';
import '../models/scenario_model.dart';
import '../models/roleplay_session_model.dart';
import '../models/roleplay_report_model.dart';

class RoleplayRepositoryImpl implements RoleplayRepository {
  final RoleplayRemoteDataSource _remoteDataSource;

  RoleplayRepositoryImpl(this._remoteDataSource);

  @override
  Future<Result<List<ScenarioModel>>> getScenarios() async {
    return _remoteDataSource.getScenarios();
  }

  @override
  Future<Result<ScenarioModel>> getScenario(String scenarioId) async {
    return _remoteDataSource.getScenario(scenarioId);
  }

  @override
  Future<Result<RoleplaySessionModel>> startSession(String scenarioId) async {
    return _remoteDataSource.startSession(scenarioId);
  }

  @override
  Future<Result<RoleplaySessionModel>> sendTurn(
    String sessionId,
    String message,
  ) async {
    return _remoteDataSource.sendTurn(sessionId, message);
  }

  @override
  Future<Result<RoleplayReportModel>> endSession(String sessionId) async {
    return _remoteDataSource.endSession(sessionId);
  }
}
