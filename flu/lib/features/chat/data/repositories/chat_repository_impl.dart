import 'package:flu/core/errors/result.dart';
import '../../domain/repositories/chat_repository.dart';
import '../datasources/chat_remote_datasource.dart';
import '../models/chat_request_model.dart';
import '../models/chat_response_model.dart';

class ChatRepositoryImpl implements ChatRepository {
  final ChatRemoteDataSource _remoteDataSource;

  ChatRepositoryImpl(this._remoteDataSource);

  @override
  Future<Result<ChatResponseModel>> sendMessage(
    ChatRequestModel request,
  ) async {
    return _remoteDataSource.sendMessage(request);
  }

  @override
  Future<Result<String>> translate(
    String text, {
    String targetLang = 'ko',
  }) async {
    return _remoteDataSource.translate(text, targetLang: targetLang);
  }

  @override
  Future<Result<void>> clearConversation(String conversationId) async {
    return _remoteDataSource.clearConversation(conversationId);
  }
}
