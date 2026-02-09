import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  static String get webUrl =>
      dotenv.env['WEB_URL'] ?? 'https://enpeak.web.app';
  static String get apiUrl =>
      dotenv.env['API_URL'] ?? 'https://wonchulhee-enpeak.hf.space';

  static const String appVersion = '1.0.0';
  static const String userAgentSuffix = 'EnPeakApp/1.0';
  static const int recordingMaxSeconds = 15;
  static const int bridgeTimeoutMs = 5000;
  static const int maxBase64SizeBytes = 2500000; // 2.5MB
}
