import 'package:flu/core/errors/result.dart';
import '../../domain/repositories/rag_repository.dart';
import '../datasources/rag_remote_datasource.dart';
import '../models/search_result_model.dart';
import '../models/daily_expression_model.dart';

class RagRepositoryImpl implements RagRepository {
  final RagRemoteDataSource _remoteDataSource;

  RagRepositoryImpl(this._remoteDataSource);

  @override
  Future<Result<List<SearchResultModel>>> search(
    String query, {
    int nResults = 10,
    String? filterType,
    String? filterLevel,
    String? filterCategory,
  }) async {
    return _remoteDataSource.search(
      query,
      nResults: nResults,
      filterType: filterType,
      filterLevel: filterLevel,
      filterCategory: filterCategory,
    );
  }

  @override
  Future<Result<List<SearchResultModel>>> getRelated(String word) async {
    return _remoteDataSource.getRelated(word);
  }

  @override
  Future<Result<Map<String, dynamic>>> getStats() async {
    return _remoteDataSource.getStats();
  }

  @override
  Future<Result<DailyExpressionModel>> getDailyExpression() async {
    return _remoteDataSource.getDailyExpression();
  }
}
