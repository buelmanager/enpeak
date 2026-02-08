import 'package:flu/core/errors/result.dart';
import '../../data/models/scenario_model.dart';
import '../../data/models/roleplay_session_model.dart';
import '../../data/models/roleplay_report_model.dart';

abstract class RoleplayRepository {
  Future<Result<List<ScenarioModel>>> getScenarios();
  Future<Result<ScenarioModel>> getScenario(String scenarioId);
  Future<Result<RoleplaySessionModel>> startSession(String scenarioId);
  Future<Result<RoleplaySessionModel>> sendTurn(
    String sessionId,
    String message,
  );
  Future<Result<RoleplayReportModel>> endSession(String sessionId);
}
