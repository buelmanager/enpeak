import 'message.dart';

class ChatSession {
  final String conversationId;
  final List<Message> messages;
  final String? userLevel;
  final DateTime createdAt;

  const ChatSession({
    required this.conversationId,
    required this.messages,
    this.userLevel,
    required this.createdAt,
  });

  ChatSession copyWith({
    String? conversationId,
    List<Message>? messages,
    String? userLevel,
    DateTime? createdAt,
  }) {
    return ChatSession(
      conversationId: conversationId ?? this.conversationId,
      messages: messages ?? this.messages,
      userLevel: userLevel ?? this.userLevel,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
