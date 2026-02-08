import 'package:flu/core/network/api_client.dart';
import 'package:flu/core/constants/api_endpoints.dart';
import 'package:flu/core/errors/result.dart';
import '../models/search_result_model.dart';
import '../models/daily_expression_model.dart';

class RagRemoteDataSource {
  final ApiClient _apiClient;

  RagRemoteDataSource(this._apiClient);

  Future<Result<List<SearchResultModel>>> search(
    String query, {
    int nResults = 10,
    String? filterType,
    String? filterLevel,
    String? filterCategory,
  }) async {
    final data = <String, dynamic>{'query': query, 'n_results': nResults};
    if (filterType != null) data['filter_type'] = filterType;
    if (filterLevel != null) data['filter_level'] = filterLevel;
    if (filterCategory != null) data['filter_category'] = filterCategory;

    final result = await _apiClient.post(ApiEndpoints.ragSearch, data: data);
    return result.when(
      ok: (responseData) {
        final results = (responseData['results'] as List<dynamic>? ?? [])
            .map((e) => SearchResultModel.fromJson(e as Map<String, dynamic>))
            .toList();
        return Ok(results);
      },
      err: (failure) => Err(failure),
    );
  }

  Future<Result<List<SearchResultModel>>> getRelated(String word) async {
    final result = await _apiClient.get(ApiEndpoints.ragRelated(word));
    return result.when(
      ok: (data) {
        final results = (data['results'] as List<dynamic>? ?? [])
            .map((e) => SearchResultModel.fromJson(e as Map<String, dynamic>))
            .toList();
        return Ok(results);
      },
      err: (failure) => Err(failure),
    );
  }

  Future<Result<Map<String, dynamic>>> getStats() async {
    final result = await _apiClient.get(ApiEndpoints.ragStats);
    return result.when(ok: (data) => Ok(data), err: (failure) => Err(failure));
  }

  Future<Result<DailyExpressionModel>> getDailyExpression() async {
    final result = await _apiClient.get(ApiEndpoints.ragDailyExpression);
    return result.when(
      ok: (data) => Ok(DailyExpressionModel.fromJson(data)),
      err: (failure) => Err(failure),
    );
  }
}
