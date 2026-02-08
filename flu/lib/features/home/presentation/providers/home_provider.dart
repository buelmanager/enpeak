import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:flu/core/di/injection.dart';
import 'package:flu/features/rag/data/models/daily_expression_model.dart';
import 'package:flu/features/rag/domain/repositories/rag_repository.dart';

// --- Learning Record Model ---

class LearningRecord {
  final String id;
  final String type; // 'chat', 'roleplay', 'vocabulary'
  final String title;
  final DateTime timestamp;
  final int durationMinutes;

  const LearningRecord({
    required this.id,
    required this.type,
    required this.title,
    required this.timestamp,
    this.durationMinutes = 0,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'type': type,
    'title': title,
    'timestamp': timestamp.toIso8601String(),
    'durationMinutes': durationMinutes,
  };

  factory LearningRecord.fromJson(Map<String, dynamic> json) {
    return LearningRecord(
      id: json['id'] as String? ?? '',
      type: json['type'] as String? ?? '',
      title: json['title'] as String? ?? '',
      timestamp:
          DateTime.tryParse(json['timestamp'] as String? ?? '') ??
          DateTime.now(),
      durationMinutes: json['durationMinutes'] as int? ?? 0,
    );
  }
}

// --- Home State ---

class HomeState {
  final DailyExpressionModel? dailyExpression;
  final List<LearningRecord> recentRecords;
  final int weeklyStreak;
  final List<bool> weekDays; // Mon-Sun, true if studied
  final bool isLoading;
  final String? error;

  const HomeState({
    this.dailyExpression,
    this.recentRecords = const [],
    this.weeklyStreak = 0,
    this.weekDays = const [false, false, false, false, false, false, false],
    this.isLoading = false,
    this.error,
  });

  HomeState copyWith({
    DailyExpressionModel? dailyExpression,
    List<LearningRecord>? recentRecords,
    int? weeklyStreak,
    List<bool>? weekDays,
    bool? isLoading,
    String? error,
  }) {
    return HomeState(
      dailyExpression: dailyExpression ?? this.dailyExpression,
      recentRecords: recentRecords ?? this.recentRecords,
      weeklyStreak: weeklyStreak ?? this.weeklyStreak,
      weekDays: weekDays ?? this.weekDays,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// --- Home Notifier ---

class HomeNotifier extends StateNotifier<HomeState> {
  final RagRepository _ragRepository;
  final SharedPreferences _prefs;

  static const _recordsKey = 'learning_records';
  static const _streakKey = 'learning_streak_days';

  HomeNotifier(this._ragRepository, this._prefs) : super(const HomeState()) {
    loadAll();
  }

  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, error: null);
    await Future.wait([
      _loadDailyExpression(),
      _loadRecentRecords(),
      _loadStreakData(),
    ]);
    state = state.copyWith(isLoading: false);
  }

  Future<void> refresh() async {
    await loadAll();
  }

  Future<void> _loadDailyExpression() async {
    final result = await _ragRepository.getDailyExpression();
    result.when(
      ok: (expression) {
        state = state.copyWith(dailyExpression: expression);
      },
      err: (failure) {
        state = state.copyWith(error: failure.message);
      },
    );
  }

  Future<void> _loadRecentRecords() async {
    final recordsJson = _prefs.getStringList(_recordsKey) ?? [];
    final records =
        recordsJson
            .map((json) {
              try {
                return LearningRecord.fromJson(
                  jsonDecode(json) as Map<String, dynamic>,
                );
              } catch (_) {
                return null;
              }
            })
            .whereType<LearningRecord>()
            .toList()
          ..sort((a, b) => b.timestamp.compareTo(a.timestamp));

    state = state.copyWith(recentRecords: records.take(5).toList());
  }

  Future<void> _loadStreakData() async {
    final streakDaysJson = _prefs.getStringList(_streakKey) ?? [];
    final now = DateTime.now();
    final monday = now.subtract(Duration(days: now.weekday - 1));

    final weekDays = List.generate(7, (i) {
      final day = DateTime(monday.year, monday.month, monday.day + i);
      final dayStr = '${day.year}-${_pad(day.month)}-${_pad(day.day)}';
      return streakDaysJson.contains(dayStr);
    });

    // Calculate consecutive streak
    int streak = 0;
    final today = '${now.year}-${_pad(now.month)}-${_pad(now.day)}';
    final allDays = List<String>.from(streakDaysJson)..sort();

    if (allDays.isEmpty) {
      state = state.copyWith(weeklyStreak: 0, weekDays: weekDays);
      return;
    }

    // Count backwards from today/yesterday
    var checkDate = now;
    if (!allDays.contains(today)) {
      checkDate = now.subtract(const Duration(days: 1));
    }

    while (true) {
      final dateStr =
          '${checkDate.year}-${_pad(checkDate.month)}-${_pad(checkDate.day)}';
      if (allDays.contains(dateStr)) {
        streak++;
        checkDate = checkDate.subtract(const Duration(days: 1));
      } else {
        break;
      }
    }

    state = state.copyWith(weeklyStreak: streak, weekDays: weekDays);
  }

  Future<void> addLearningRecord(LearningRecord record) async {
    final recordsJson = _prefs.getStringList(_recordsKey) ?? [];
    recordsJson.insert(0, jsonEncode(record.toJson()));

    // Keep max 50 records
    if (recordsJson.length > 50) {
      recordsJson.removeRange(50, recordsJson.length);
    }

    await _prefs.setStringList(_recordsKey, recordsJson);

    // Mark today as studied
    final now = DateTime.now();
    final todayStr = '${now.year}-${_pad(now.month)}-${_pad(now.day)}';
    final streakDays = _prefs.getStringList(_streakKey) ?? [];
    if (!streakDays.contains(todayStr)) {
      streakDays.add(todayStr);
      await _prefs.setStringList(_streakKey, streakDays);
    }

    await _loadRecentRecords();
    await _loadStreakData();
  }

  String _pad(int n) => n.toString().padLeft(2, '0');
}

// --- Providers ---

final homeProvider = StateNotifierProvider<HomeNotifier, HomeState>((ref) {
  return HomeNotifier(sl<RagRepository>(), sl<SharedPreferences>());
});
