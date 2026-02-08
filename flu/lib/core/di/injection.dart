import 'package:firebase_auth/firebase_auth.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../network/api_client.dart';

// Auth
import '../../features/auth/data/datasources/auth_local_datasource.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';

// Chat
import '../../features/chat/data/datasources/chat_remote_datasource.dart';
import '../../features/chat/data/repositories/chat_repository_impl.dart';
import '../../features/chat/domain/repositories/chat_repository.dart';

// Community
import '../../features/community/data/datasources/community_remote_datasource.dart';
import '../../features/community/data/repositories/community_repository_impl.dart';
import '../../features/community/domain/repositories/community_repository.dart';

// Feedback
import '../../features/feedback/data/datasources/feedback_remote_datasource.dart';
import '../../features/feedback/data/repositories/feedback_repository_impl.dart';
import '../../features/feedback/domain/repositories/feedback_repository.dart';

// RAG
import '../../features/rag/data/datasources/rag_remote_datasource.dart';
import '../../features/rag/data/repositories/rag_repository_impl.dart';
import '../../features/rag/domain/repositories/rag_repository.dart';

// Roleplay
import '../../features/roleplay/data/datasources/roleplay_remote_datasource.dart';
import '../../features/roleplay/data/repositories/roleplay_repository_impl.dart';
import '../../features/roleplay/domain/repositories/roleplay_repository.dart';

// Speech
import '../../features/speech/data/datasources/speech_remote_datasource.dart';
import '../../features/speech/data/repositories/speech_repository_impl.dart';
import '../../features/speech/domain/repositories/speech_repository.dart';

// Vocabulary
import '../../features/vocabulary/data/datasources/vocabulary_remote_datasource.dart';
import '../../features/vocabulary/data/datasources/vocabulary_local_datasource.dart';
import '../../features/vocabulary/data/repositories/vocabulary_repository_impl.dart';
import '../../features/vocabulary/domain/repositories/vocabulary_repository.dart';

final sl = GetIt.instance;

Future<void> configureDependencies() async {
  // External
  final sharedPreferences = await SharedPreferences.getInstance();
  sl.registerSingleton<SharedPreferences>(sharedPreferences);

  // Core
  sl.registerLazySingleton<ApiClient>(() => ApiClient());

  // Auth
  sl.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSource(sl<SharedPreferences>()),
  );
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(FirebaseAuth.instance, sl<AuthLocalDataSource>()),
  );

  // Chat
  sl.registerLazySingleton<ChatRemoteDataSource>(
    () => ChatRemoteDataSource(sl<ApiClient>()),
  );
  sl.registerLazySingleton<ChatRepository>(
    () => ChatRepositoryImpl(sl<ChatRemoteDataSource>()),
  );

  // Community
  sl.registerLazySingleton<CommunityRemoteDataSource>(
    () => CommunityRemoteDataSource(sl<ApiClient>()),
  );
  sl.registerLazySingleton<CommunityRepository>(
    () => CommunityRepositoryImpl(sl<CommunityRemoteDataSource>()),
  );

  // Feedback
  sl.registerLazySingleton<FeedbackRemoteDataSource>(
    () => FeedbackRemoteDataSource(sl<ApiClient>()),
  );
  sl.registerLazySingleton<FeedbackRepository>(
    () => FeedbackRepositoryImpl(sl<FeedbackRemoteDataSource>()),
  );

  // RAG
  sl.registerLazySingleton<RagRemoteDataSource>(
    () => RagRemoteDataSource(sl<ApiClient>()),
  );
  sl.registerLazySingleton<RagRepository>(
    () => RagRepositoryImpl(sl<RagRemoteDataSource>()),
  );

  // Roleplay
  sl.registerLazySingleton<RoleplayRemoteDataSource>(
    () => RoleplayRemoteDataSource(sl<ApiClient>()),
  );
  sl.registerLazySingleton<RoleplayRepository>(
    () => RoleplayRepositoryImpl(sl<RoleplayRemoteDataSource>()),
  );

  // Speech
  sl.registerLazySingleton<SpeechRemoteDataSource>(
    () => SpeechRemoteDataSource(sl<ApiClient>()),
  );
  sl.registerLazySingleton<SpeechRepository>(
    () => SpeechRepositoryImpl(sl<SpeechRemoteDataSource>()),
  );

  // Vocabulary
  sl.registerLazySingleton<VocabularyRemoteDataSource>(
    () => VocabularyRemoteDataSource(sl<ApiClient>()),
  );
  sl.registerLazySingleton<VocabularyLocalDataSource>(
    () => VocabularyLocalDataSource(sl<SharedPreferences>()),
  );
  sl.registerLazySingleton<VocabularyRepository>(
    () => VocabularyRepositoryImpl(
      sl<VocabularyRemoteDataSource>(),
      sl<VocabularyLocalDataSource>(),
    ),
  );
}
