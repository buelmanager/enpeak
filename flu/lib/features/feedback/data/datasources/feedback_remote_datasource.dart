import 'package:flu/core/network/api_client.dart';
import 'package:flu/core/constants/api_endpoints.dart';
import 'package:flu/core/errors/result.dart';
import '../models/grammar_feedback_model.dart';

class FeedbackRemoteDataSource {
  final ApiClient _apiClient;

  FeedbackRemoteDataSource(this._apiClient);

  Future<Result<GrammarFeedbackModel>> checkGrammar(String text) async {
    final result = await _apiClient.post(
      ApiEndpoints.feedbackGrammar,
      data: {'text': text},
    );
    return result.when(
      ok: (data) => Ok(GrammarFeedbackModel.fromJson(data)),
      err: (failure) => Err(failure),
    );
  }

  Future<Result<void>> submitFeatureRequest(
    String title,
    String description,
  ) async {
    final result = await _apiClient.post(
      ApiEndpoints.feedbackQuickTip,
      data: {'title': title, 'description': description},
    );
    return result.when(
      ok: (_) => const Ok(null),
      err: (failure) => Err(failure),
    );
  }
}
