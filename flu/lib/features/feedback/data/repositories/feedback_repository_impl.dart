import 'package:flu/core/errors/result.dart';
import '../../domain/repositories/feedback_repository.dart';
import '../datasources/feedback_remote_datasource.dart';
import '../models/grammar_feedback_model.dart';

class FeedbackRepositoryImpl implements FeedbackRepository {
  final FeedbackRemoteDataSource _remoteDataSource;

  FeedbackRepositoryImpl(this._remoteDataSource);

  @override
  Future<Result<GrammarFeedbackModel>> checkGrammar(String text) async {
    return _remoteDataSource.checkGrammar(text);
  }

  @override
  Future<Result<void>> submitFeatureRequest(
    String title,
    String description,
  ) async {
    return _remoteDataSource.submitFeatureRequest(title, description);
  }
}
