abstract final class AppConstants {
  static const String appName = 'Flu';
  static const String appVersion = '1.0.0';
  static const int buildNumber = 1;
  static const String buildDate = '2026-02-02';

  static const List<String> levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration snackBarDuration = Duration(seconds: 3);

  static const int maxChatHistoryLength = 50;
  static const int maxRetryAttempts = 3;

  static const double bottomNavHeight = 64.0;
  static const double defaultPadding = 16.0;
  static const double cardBorderRadius = 16.0;
  static const double buttonBorderRadius = 12.0;
}
