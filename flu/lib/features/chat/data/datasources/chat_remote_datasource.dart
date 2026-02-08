import 'package:flu/core/network/api_client.dart';
import 'package:flu/core/constants/api_endpoints.dart';
import 'package:flu/core/errors/result.dart';
import '../models/chat_request_model.dart';
import '../models/chat_response_model.dart';

class ChatRemoteDataSource {
  final ApiClient _apiClient;

  ChatRemoteDataSource(this._apiClient);

  Future<Result<ChatResponseModel>> sendMessage(
    ChatRequestModel request,
  ) async {
    final result = await _apiClient.post(
      ApiEndpoints.chat,
      data: request.toJson(),
    );
    return result.when(
      ok: (data) => Ok(ChatResponseModel.fromJson(data)),
      err: (failure) => Err(failure),
    );
  }

  Future<Result<String>> translate(
    String text, {
    String targetLang = 'ko',
  }) async {
    final result = await _apiClient.post(
      ApiEndpoints.translate,
      data: {'text': text, 'target_lang': targetLang},
    );
    return result.when(
      ok: (data) => Ok(data['translated_text'] as String? ?? ''),
      err: (failure) => Err(failure),
    );
  }

  Future<Result<void>> clearConversation(String conversationId) async {
    final result = await _apiClient.delete(
      '${ApiEndpoints.chat}/$conversationId',
    );
    return result.when(
      ok: (_) => const Ok(null),
      err: (failure) => Err(failure),
    );
  }
}
