import '../widgets/recent_timeline.dart';
import '../widgets/week_comparison_card.dart';

class CategoryData {
  final String label;
  final double value;
  final double percentage;

  const CategoryData({
    required this.label,
    required this.value,
    required this.percentage,
  });
}

class StatsState {
  final List<double> weeklyData;
  final List<String> weeklyLabels;
  final int totalWords;
  final int totalConversations;
  final int totalMinutes;
  final int currentStreak;
  final int longestStreak;
  final List<CategoryData> categoryBreakdown;
  final Set<DateTime> studiedDates;
  final bool isLoading;
  final String? error;

  // New fields for dashboard widgets
  final int wordsToday;
  final int conversationsToday;
  final int minutesToday;
  final List<int> hourlyData;
  final Map<String, int> levelData;
  final Map<DateTime, int> intensityMap;
  final List<ActivityItem> recentActivities;
  final Set<String> unlockedBadges;
  final WeekStats thisWeek;
  final WeekStats lastWeek;

  const StatsState({
    this.weeklyData = const [],
    this.weeklyLabels = const [],
    this.totalWords = 0,
    this.totalConversations = 0,
    this.totalMinutes = 0,
    this.currentStreak = 0,
    this.longestStreak = 0,
    this.categoryBreakdown = const [],
    this.studiedDates = const {},
    this.isLoading = false,
    this.error,
    this.wordsToday = 0,
    this.conversationsToday = 0,
    this.minutesToday = 0,
    this.hourlyData = const [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ],
    this.levelData = const {},
    this.intensityMap = const {},
    this.recentActivities = const [],
    this.unlockedBadges = const {},
    this.thisWeek = const WeekStats(),
    this.lastWeek = const WeekStats(),
  });

  StatsState copyWith({
    List<double>? weeklyData,
    List<String>? weeklyLabels,
    int? totalWords,
    int? totalConversations,
    int? totalMinutes,
    int? currentStreak,
    int? longestStreak,
    List<CategoryData>? categoryBreakdown,
    Set<DateTime>? studiedDates,
    bool? isLoading,
    String? error,
    int? wordsToday,
    int? conversationsToday,
    int? minutesToday,
    List<int>? hourlyData,
    Map<String, int>? levelData,
    Map<DateTime, int>? intensityMap,
    List<ActivityItem>? recentActivities,
    Set<String>? unlockedBadges,
    WeekStats? thisWeek,
    WeekStats? lastWeek,
  }) {
    return StatsState(
      weeklyData: weeklyData ?? this.weeklyData,
      weeklyLabels: weeklyLabels ?? this.weeklyLabels,
      totalWords: totalWords ?? this.totalWords,
      totalConversations: totalConversations ?? this.totalConversations,
      totalMinutes: totalMinutes ?? this.totalMinutes,
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      categoryBreakdown: categoryBreakdown ?? this.categoryBreakdown,
      studiedDates: studiedDates ?? this.studiedDates,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      wordsToday: wordsToday ?? this.wordsToday,
      conversationsToday: conversationsToday ?? this.conversationsToday,
      minutesToday: minutesToday ?? this.minutesToday,
      hourlyData: hourlyData ?? this.hourlyData,
      levelData: levelData ?? this.levelData,
      intensityMap: intensityMap ?? this.intensityMap,
      recentActivities: recentActivities ?? this.recentActivities,
      unlockedBadges: unlockedBadges ?? this.unlockedBadges,
      thisWeek: thisWeek ?? this.thisWeek,
      lastWeek: lastWeek ?? this.lastWeek,
    );
  }
}
