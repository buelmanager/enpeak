import 'package:flu/core/network/api_client.dart';
import 'package:flu/core/constants/api_endpoints.dart';
import 'package:flu/core/errors/result.dart';
import '../models/word_model.dart';
import '../models/word_expansion_model.dart';

class VocabularyRemoteDataSource {
  final ApiClient _apiClient;

  VocabularyRemoteDataSource(this._apiClient);

  Future<Result<List<WordModel>>> getWords({String? level}) async {
    final queryParams = <String, dynamic>{};
    if (level != null) queryParams['level'] = level;

    final result = await _apiClient.get(
      ApiEndpoints.vocabularyList,
      queryParameters: queryParams.isNotEmpty ? queryParams : null,
    );
    return result.when(
      ok: (data) {
        final words = (data['words'] as List<dynamic>? ?? [])
            .map((e) => WordModel.fromJson(e as Map<String, dynamic>))
            .toList();
        return Ok(words);
      },
      err: (failure) => Err(failure),
    );
  }

  Future<Result<WordModel>> addWord(String word) async {
    final result = await _apiClient.post(
      ApiEndpoints.vocabularyAdd,
      data: {'word': word},
    );
    return result.when(
      ok: (data) => Ok(WordModel.fromJson(data)),
      err: (failure) => Err(failure),
    );
  }

  Future<Result<void>> removeWord(String word) async {
    final result = await _apiClient.delete(
      '${ApiEndpoints.vocabularyRemove}/$word',
    );
    return result.when(
      ok: (_) => const Ok(null),
      err: (failure) => Err(failure),
    );
  }

  Future<Result<WordExpansionModel>> expandWord(String word) async {
    final result = await _apiClient.post(
      ApiEndpoints.vocabularyExpand,
      data: {'word': word},
    );
    return result.when(
      ok: (data) => Ok(WordExpansionModel.fromJson(data)),
      err: (failure) => Err(failure),
    );
  }

  Future<Result<List<WordModel>>> searchWords(String query) async {
    final result = await _apiClient.get(
      '${ApiEndpoints.vocabularySearch}/$query',
    );
    return result.when(
      ok: (data) {
        final words = (data['results'] as List<dynamic>? ?? [])
            .map((e) => WordModel.fromJson(e as Map<String, dynamic>))
            .toList();
        return Ok(words);
      },
      err: (failure) => Err(failure),
    );
  }
}
