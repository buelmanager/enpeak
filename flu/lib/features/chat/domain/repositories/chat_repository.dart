import 'package:flu/core/errors/result.dart';
import '../../data/models/chat_request_model.dart';
import '../../data/models/chat_response_model.dart';

abstract class ChatRepository {
  Future<Result<ChatResponseModel>> sendMessage(ChatRequestModel request);
  Future<Result<String>> translate(String text, {String targetLang = 'ko'});
  Future<Result<void>> clearConversation(String conversationId);
}
