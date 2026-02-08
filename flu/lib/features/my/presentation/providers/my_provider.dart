import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:flu/features/auth/domain/entities/user.dart';
import 'package:flu/features/auth/domain/repositories/auth_repository.dart';
import 'package:flu/features/login/presentation/providers/auth_provider.dart';
import 'package:flu/features/speech/presentation/providers/tts_provider.dart';
import 'package:flu/features/speech/presentation/providers/tts_state.dart';

class LearningStats {
  final int totalWords;
  final int totalConversations;
  final int studyDays;
  final int streakDays;

  const LearningStats({
    this.totalWords = 0,
    this.totalConversations = 0,
    this.studyDays = 0,
    this.streakDays = 0,
  });
}

class MyState {
  final AppUser? user;
  final LearningStats stats;
  final bool isLoading;
  final String? error;
  final TtsMode ttsMode;
  final String selectedVoice;
  final double speechRate;

  const MyState({
    this.user,
    this.stats = const LearningStats(),
    this.isLoading = false,
    this.error,
    this.ttsMode = TtsMode.device,
    this.selectedVoice = 'en-US-AriaNeural',
    this.speechRate = 1.0,
  });

  bool get isLoggedIn => user != null;

  String get userName => user?.displayName ?? 'Guest';

  String get userEmail => user?.email ?? '';

  MyState copyWith({
    AppUser? user,
    bool clearUser = false,
    LearningStats? stats,
    bool? isLoading,
    String? error,
    TtsMode? ttsMode,
    String? selectedVoice,
    double? speechRate,
  }) {
    return MyState(
      user: clearUser ? null : (user ?? this.user),
      stats: stats ?? this.stats,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      ttsMode: ttsMode ?? this.ttsMode,
      selectedVoice: selectedVoice ?? this.selectedVoice,
      speechRate: speechRate ?? this.speechRate,
    );
  }
}

const _keyTtsMode = 'tts_mode';
const _keySelectedVoice = 'selected_voice';
const _keySpeechRate = 'speech_rate';

class MyNotifier extends StateNotifier<MyState> {
  final AuthRepository _authRepository;
  final Ref _ref;

  MyNotifier(this._authRepository, this._ref) : super(const MyState()) {
    _init();
  }

  Future<void> _init() async {
    state = state.copyWith(isLoading: true);

    await _loadSettings();

    final result = await _authRepository.getCurrentUser();
    result.when(
      ok: (user) {
        state = state.copyWith(
          user: user,
          isLoading: false,
          stats: const LearningStats(
            totalWords: 0,
            totalConversations: 0,
            studyDays: 0,
            streakDays: 0,
          ),
        );
      },
      err: (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
      },
    );
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();

    final modeStr = prefs.getString(_keyTtsMode);
    final voice = prefs.getString(_keySelectedVoice);
    final rate = prefs.getDouble(_keySpeechRate);

    final mode = modeStr == 'hd' ? TtsMode.hd : TtsMode.device;

    state = state.copyWith(
      ttsMode: mode,
      selectedVoice: voice ?? state.selectedVoice,
      speechRate: rate ?? state.speechRate,
    );
  }

  Future<void> updateTtsMode(TtsMode mode) async {
    state = state.copyWith(ttsMode: mode);
    _ref.read(ttsProvider.notifier).setMode(mode);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyTtsMode, mode == TtsMode.hd ? 'hd' : 'device');
  }

  Future<void> updateVoice(String voice) async {
    state = state.copyWith(selectedVoice: voice);
    _ref.read(ttsProvider.notifier).setVoice(voice);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keySelectedVoice, voice);
  }

  Future<void> updateSpeechRate(double rate) async {
    final clamped = rate.clamp(0.5, 2.0);
    state = state.copyWith(speechRate: clamped);
    _ref.read(ttsProvider.notifier).setSpeed(clamped);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_keySpeechRate, clamped);
  }

  Future<void> refresh() async => _init();

  Future<void> signOut() async {
    state = state.copyWith(isLoading: true);
    final result = await _authRepository.signOut();
    result.when(
      ok: (_) {
        state = const MyState();
      },
      err: (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
      },
    );
  }
}

final myProvider = StateNotifierProvider<MyNotifier, MyState>((ref) {
  final authRepo = ref.watch(authRepositoryProvider);
  return MyNotifier(authRepo, ref);
});
