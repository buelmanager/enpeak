import 'package:flu/core/errors/result.dart';
import '../entities/user.dart';

abstract class AuthRepository {
  Future<Result<AppUser>> signInWithGoogle();
  Future<Result<AppUser>> signInAnonymously();
  Future<Result<void>> signOut();
  Future<Result<AppUser?>> getCurrentUser();
  Stream<AppUser?> authStateChanges();
  Future<Result<String?>> getIdToken();
}
