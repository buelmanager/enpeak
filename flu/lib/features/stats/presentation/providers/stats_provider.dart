import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:flu/core/di/injection.dart';
import 'package:flu/features/home/presentation/providers/home_provider.dart';
import 'package:flu/features/stats/presentation/widgets/recent_timeline.dart';
import 'package:flu/features/stats/presentation/widgets/week_comparison_card.dart';

import 'stats_state.dart';

class StatsNotifier extends StateNotifier<StatsState> {
  final SharedPreferences _prefs;

  static const _recordsKey = 'learning_records';
  static const _streakKey = 'learning_streak_days';

  StatsNotifier(this._prefs) : super(const StatsState(isLoading: true)) {
    loadStats();
  }

  Future<void> loadStats() async {
    state = state.copyWith(isLoading: true);

    try {
      final records = _loadRecords();
      final streakDays = _prefs.getStringList(_streakKey) ?? [];
      final now = DateTime.now();

      final weekdayLabels = _generateWeekdayLabels(now);
      final weeklyData = _calculateWeeklyData(records, now);
      final totalWords = _countByType(records, 'vocabulary');
      final totalConversations =
          _countByType(records, 'chat') + _countByType(records, 'roleplay');
      final totalMinutes = _sumDurationMinutes(records);
      final currentStreak = _calculateCurrentStreak(streakDays, now);
      final longestStreak = _calculateLongestStreak(streakDays);
      final categoryBreakdown = _calculateCategoryBreakdown(records);
      final studiedDates = _parseStudiedDates(streakDays);

      // New computations
      final wordsToday = _countTodayByType(records, 'vocabulary', now);
      final conversationsToday =
          _countTodayByType(records, 'chat', now) +
          _countTodayByType(records, 'roleplay', now);
      final minutesToday = _sumTodayMinutes(records, now);
      final hourlyData = _calculateHourlyData(records);
      final levelData = _calculateLevelData(records);
      final intensityMap = _calculateIntensityMap(records);
      final recentActivities = _buildRecentActivities(records);
      final unlockedBadges = _computeUnlockedBadges(
        totalWords: totalWords,
        totalConversations: totalConversations,
        currentStreak: currentStreak,
        records: records,
      );
      final thisWeek = _calculateWeekStats(records, now, 0);
      final lastWeek = _calculateWeekStats(records, now, 1);

      state = state.copyWith(
        isLoading: false,
        weeklyData: weeklyData,
        weeklyLabels: weekdayLabels,
        totalWords: totalWords,
        totalConversations: totalConversations,
        totalMinutes: totalMinutes,
        currentStreak: currentStreak,
        longestStreak: longestStreak,
        categoryBreakdown: categoryBreakdown,
        studiedDates: studiedDates,
        wordsToday: wordsToday,
        conversationsToday: conversationsToday,
        minutesToday: minutesToday,
        hourlyData: hourlyData,
        levelData: levelData,
        intensityMap: intensityMap,
        recentActivities: recentActivities,
        unlockedBadges: unlockedBadges,
        thisWeek: thisWeek,
        lastWeek: lastWeek,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load stats: $e',
      );
    }
  }

  List<LearningRecord> _loadRecords() {
    final recordsJson = _prefs.getStringList(_recordsKey) ?? [];
    return recordsJson
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
        .toList();
  }

  List<double> _calculateWeeklyData(
    List<LearningRecord> records,
    DateTime now,
  ) {
    final weeklyData = List<double>.filled(7, 0);
    final today = DateTime(now.year, now.month, now.day);

    for (var i = 0; i < 7; i++) {
      final date = today.subtract(Duration(days: 6 - i));
      final dayRecords = records.where((r) {
        final recordDate = DateTime(
          r.timestamp.year,
          r.timestamp.month,
          r.timestamp.day,
        );
        return recordDate == date;
      });
      weeklyData[i] = dayRecords
          .fold<int>(0, (sum, r) => sum + r.durationMinutes)
          .toDouble();
    }

    return weeklyData;
  }

  int _countByType(List<LearningRecord> records, String type) {
    return records.where((r) => r.type == type).length;
  }

  int _sumDurationMinutes(List<LearningRecord> records) {
    return records.fold<int>(0, (sum, r) => sum + r.durationMinutes);
  }

  int _calculateCurrentStreak(List<String> streakDays, DateTime now) {
    if (streakDays.isEmpty) return 0;

    int streak = 0;
    final today = '${now.year}-${_pad(now.month)}-${_pad(now.day)}';
    final allDays = List<String>.from(streakDays)..sort();

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

    return streak;
  }

  int _calculateLongestStreak(List<String> streakDays) {
    if (streakDays.isEmpty) return 0;

    final sortedDays = List<String>.from(streakDays)..sort();
    int longestStreak = 1;
    int currentStreak = 1;

    for (var i = 1; i < sortedDays.length; i++) {
      final prevDate = DateTime.parse(sortedDays[i - 1]);
      final currDate = DateTime.parse(sortedDays[i]);
      final diff = currDate.difference(prevDate).inDays;

      if (diff == 1) {
        currentStreak++;
        longestStreak = currentStreak > longestStreak
            ? currentStreak
            : longestStreak;
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }

  List<CategoryData> _calculateCategoryBreakdown(List<LearningRecord> records) {
    if (records.isEmpty) {
      return [];
    }

    final typeCounts = <String, int>{};
    for (final record in records) {
      typeCounts[record.type] = (typeCounts[record.type] ?? 0) + 1;
    }

    final total = records.length;
    final categoryLabels = {
      'chat': 'Conversation',
      'roleplay': 'Roleplay',
      'vocabulary': 'Vocabulary',
      'expression': 'Expression',
    };

    final breakdown = typeCounts.entries.map((entry) {
      final count = entry.value;
      final percentage = count / total;
      return CategoryData(
        label: categoryLabels[entry.key] ?? entry.key,
        value: count.toDouble(),
        percentage: percentage,
      );
    }).toList()..sort((a, b) => b.value.compareTo(a.value));

    return breakdown;
  }

  Set<DateTime> _parseStudiedDates(List<String> streakDays) {
    return streakDays
        .map((dateStr) {
          try {
            return DateTime.parse(dateStr);
          } catch (_) {
            return null;
          }
        })
        .whereType<DateTime>()
        .toSet();
  }

  String _pad(int n) => n.toString().padLeft(2, '0');

  List<String> _generateWeekdayLabels(DateTime now) {
    const labels = [
      '\uC6D4',
      '\uD654',
      '\uC218',
      '\uBAA9',
      '\uAE08',
      '\uD1A0',
      '\uC77C',
    ];
    final result = <String>[];
    for (var i = 6; i >= 0; i--) {
      final date = now.subtract(Duration(days: i));
      result.add(labels[date.weekday - 1]);
    }
    return result;
  }

  // --- New computation methods ---

  int _countTodayByType(
    List<LearningRecord> records,
    String type,
    DateTime now,
  ) {
    final today = DateTime(now.year, now.month, now.day);
    return records.where((r) {
      final d = DateTime(r.timestamp.year, r.timestamp.month, r.timestamp.day);
      return d == today && r.type == type;
    }).length;
  }

  int _sumTodayMinutes(List<LearningRecord> records, DateTime now) {
    final today = DateTime(now.year, now.month, now.day);
    return records
        .where((r) {
          final d = DateTime(
            r.timestamp.year,
            r.timestamp.month,
            r.timestamp.day,
          );
          return d == today;
        })
        .fold<int>(0, (sum, r) => sum + r.durationMinutes);
  }

  List<int> _calculateHourlyData(List<LearningRecord> records) {
    final hourly = List<int>.filled(24, 0);
    for (final r in records) {
      hourly[r.timestamp.hour]++;
    }
    return hourly;
  }

  Map<String, int> _calculateLevelData(List<LearningRecord> records) {
    // Count vocabulary records per level from title prefix (e.g. "[A1] word")
    // Fall back to reasonable defaults if no level info is present
    final vocabRecords = records.where((r) => r.type == 'vocabulary');
    final counts = <String, int>{
      'A1': 0,
      'A2': 0,
      'B1': 0,
      'B2': 0,
      'C1': 0,
      'C2': 0,
    };

    for (final r in vocabRecords) {
      final title = r.title.toUpperCase();
      for (final level in counts.keys) {
        if (title.contains(level)) {
          counts[level] = counts[level]! + 1;
          break;
        }
      }
    }

    // If all zeros, distribute total vocabulary count across levels
    if (counts.values.every((v) => v == 0) && vocabRecords.isNotEmpty) {
      final total = vocabRecords.length;
      final perLevel = total ~/ 6;
      final remainder = total % 6;
      var i = 0;
      for (final level in counts.keys) {
        counts[level] = perLevel + (i < remainder ? 1 : 0);
        i++;
      }
    }

    return counts;
  }

  Map<DateTime, int> _calculateIntensityMap(List<LearningRecord> records) {
    final map = <DateTime, int>{};
    for (final r in records) {
      final date = DateTime(
        r.timestamp.year,
        r.timestamp.month,
        r.timestamp.day,
      );
      map[date] = (map[date] ?? 0) + 1;
    }
    return map;
  }

  List<ActivityItem> _buildRecentActivities(List<LearningRecord> records) {
    final sorted = List<LearningRecord>.from(records)
      ..sort((a, b) => b.timestamp.compareTo(a.timestamp));

    const typeLabels = {
      'chat': '자유 대화',
      'roleplay': '롤플레이',
      'vocabulary': '단어 학습',
      'expression': '표현 연습',
    };

    return sorted.take(10).map((r) {
      final label = typeLabels[r.type] ?? r.type;
      final desc = r.title.isNotEmpty ? '$label: ${r.title}' : label;
      return ActivityItem(
        type: r.type,
        description: desc,
        timestamp: r.timestamp,
        durationMinutes: r.durationMinutes > 0 ? r.durationMinutes : null,
      );
    }).toList();
  }

  Set<String> _computeUnlockedBadges({
    required int totalWords,
    required int totalConversations,
    required int currentStreak,
    required List<LearningRecord> records,
  }) {
    final badges = <String>{};

    // first_chat: completed at least one chat
    if (records.any((r) => r.type == 'chat')) {
      badges.add('first_chat');
    }

    // word_100: learned 100+ words
    if (totalWords >= 100) {
      badges.add('word_100');
    }

    // streak_3, streak_7, streak_30
    if (currentStreak >= 3) badges.add('streak_3');
    if (currentStreak >= 7) {
      badges.add('streak_7');
      badges.add('perfect_week');
    }
    if (currentStreak >= 30) badges.add('streak_30');

    // first_roleplay
    if (records.any((r) => r.type == 'roleplay')) {
      badges.add('first_roleplay');
    }

    // expression_50
    final expressionCount = records.where((r) => r.type == 'expression').length;
    if (expressionCount >= 50) badges.add('expression_50');

    // chat_50
    if (totalConversations >= 50) badges.add('chat_50');

    return badges;
  }

  WeekStats _calculateWeekStats(
    List<LearningRecord> records,
    DateTime now,
    int weeksAgo,
  ) {
    final today = DateTime(now.year, now.month, now.day);
    // Start of this week (Monday)
    final startOfThisWeek = today.subtract(Duration(days: today.weekday - 1));
    final weekStart = startOfThisWeek.subtract(Duration(days: weeksAgo * 7));
    final weekEnd = weekStart.add(const Duration(days: 7));

    final weekRecords = records.where((r) {
      final d = DateTime(r.timestamp.year, r.timestamp.month, r.timestamp.day);
      return !d.isBefore(weekStart) && d.isBefore(weekEnd);
    });

    return WeekStats(
      words: weekRecords.where((r) => r.type == 'vocabulary').length,
      conversations: weekRecords
          .where((r) => r.type == 'chat' || r.type == 'roleplay')
          .length,
      minutes: weekRecords.fold<int>(0, (sum, r) => sum + r.durationMinutes),
    );
  }
}

final statsProvider = StateNotifierProvider<StatsNotifier, StatsState>((ref) {
  return StatsNotifier(sl<SharedPreferences>());
});
