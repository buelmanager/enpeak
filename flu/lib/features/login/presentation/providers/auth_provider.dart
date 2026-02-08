import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_it/get_it.dart';

import 'package:flu/features/auth/domain/entities/user.dart';
import 'package:flu/features/auth/domain/repositories/auth_repository.dart';

class AuthState {
  final AppUser? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    AppUser? user,
    bool clearUser = false,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;
  StreamSubscription<AppUser?>? _authSub;

  AuthNotifier(this._authRepository) : super(const AuthState()) {
    _listenAuthState();
  }

  void _listenAuthState() {
    _authSub = _authRepository.authStateChanges().listen((user) {
      state = state.copyWith(
        user: user,
        clearUser: user == null,
        isLoading: false,
      );
    });
  }

  Future<void> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);
    final result = await _authRepository.signInWithGoogle();
    result.when(
      ok: (user) {
        state = state.copyWith(user: user, isLoading: false);
      },
      err: (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
      },
    );
  }

  Future<void> signInAnonymously() async {
    state = state.copyWith(isLoading: true, error: null);
    final result = await _authRepository.signInAnonymously();
    result.when(
      ok: (user) {
        state = state.copyWith(user: user, isLoading: false);
      },
      err: (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
      },
    );
  }

  Future<void> signOut() async {
    state = state.copyWith(isLoading: true, error: null);
    final result = await _authRepository.signOut();
    result.when(
      ok: (_) {
        state = const AuthState();
      },
      err: (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
      },
    );
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  @override
  void dispose() {
    _authSub?.cancel();
    super.dispose();
  }
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return GetIt.instance<AuthRepository>();
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authRepo = ref.watch(authRepositoryProvider);
  return AuthNotifier(authRepo);
});
