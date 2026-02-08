import 'package:flu/core/errors/result.dart';
import '../../data/models/grammar_feedback_model.dart';

abstract class FeedbackRepository {
  Future<Result<GrammarFeedbackModel>> checkGrammar(String text);
  Future<Result<void>> submitFeatureRequest(String title, String description);
}
