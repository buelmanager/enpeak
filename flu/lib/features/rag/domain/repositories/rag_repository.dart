import 'package:flu/core/errors/result.dart';
import '../../data/models/search_result_model.dart';
import '../../data/models/daily_expression_model.dart';

abstract class RagRepository {
  Future<Result<List<SearchResultModel>>> search(
    String query, {
    int nResults = 10,
    String? filterType,
    String? filterLevel,
    String? filterCategory,
  });
  Future<Result<List<SearchResultModel>>> getRelated(String word);
  Future<Result<Map<String, dynamic>>> getStats();
  Future<Result<DailyExpressionModel>> getDailyExpression();
}
