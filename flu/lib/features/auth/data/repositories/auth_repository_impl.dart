import 'dart:async';
import 'package:firebase_auth/firebase_auth.dart' as firebase;
import 'package:flu/core/errors/result.dart';
import 'package:flu/core/errors/failures.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_local_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  final firebase.FirebaseAuth _firebaseAuth;
  final AuthLocalDataSource _localDataSource;

  AuthRepositoryImpl(this._firebaseAuth, this._localDataSource);

  AppUser? _mapFirebaseUser(firebase.User? user) {
    if (user == null) return null;
    return AppUser(
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoURL,
      isAnonymous: user.isAnonymous,
    );
  }

  @override
  Future<Result<AppUser>> signInWithGoogle() async {
    try {
      final provider = firebase.GoogleAuthProvider();
      final userCredential = await _firebaseAuth.signInWithProvider(provider);
      final appUser = _mapFirebaseUser(userCredential.user);
      if (appUser == null) {
        return Err(const ServerFailure('Failed to get user after sign-in'));
      }
      await _localDataSource.cacheUser(appUser);
      return Ok(appUser);
    } catch (e) {
      return Err(ServerFailure('Google sign-in failed: $e'));
    }
  }

  @override
  Future<Result<AppUser>> signInAnonymously() async {
    try {
      final userCredential = await _firebaseAuth.signInAnonymously();
      final appUser = _mapFirebaseUser(userCredential.user);
      if (appUser == null) {
        return Err(
          const ServerFailure('Failed to get user after anonymous sign-in'),
        );
      }
      await _localDataSource.cacheUser(appUser);
      return Ok(appUser);
    } catch (e) {
      return Err(ServerFailure('Anonymous sign-in failed: $e'));
    }
  }

  @override
  Future<Result<void>> signOut() async {
    try {
      await _firebaseAuth.signOut();
      await _localDataSource.clearUser();
      return const Ok(null);
    } catch (e) {
      return Err(ServerFailure('Sign-out failed: $e'));
    }
  }

  @override
  Future<Result<AppUser?>> getCurrentUser() async {
    try {
      final firebaseUser = _firebaseAuth.currentUser;
      if (firebaseUser != null) {
        final appUser = _mapFirebaseUser(firebaseUser);
        if (appUser != null) {
          await _localDataSource.cacheUser(appUser);
        }
        return Ok(appUser);
      }
      final cachedUser = _localDataSource.getCachedUser();
      return Ok(cachedUser);
    } catch (e) {
      return Err(ServerFailure('Failed to get current user: $e'));
    }
  }

  @override
  Stream<AppUser?> authStateChanges() {
    return _firebaseAuth.authStateChanges().map(_mapFirebaseUser);
  }

  @override
  Future<Result<String?>> getIdToken() async {
    try {
      final user = _firebaseAuth.currentUser;
      if (user == null) return const Ok(null);
      final token = await user.getIdToken();
      return Ok(token);
    } catch (e) {
      return Err(ServerFailure('Failed to get ID token: $e'));
    }
  }
}
