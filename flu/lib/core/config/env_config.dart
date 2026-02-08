import 'package:flutter_dotenv/flutter_dotenv.dart';

abstract final class EnvConfig {
  static String get apiUrl => dotenv.env['API_URL'] ?? 'http://localhost:7860';

  static String get hfToken => dotenv.env['HF_TOKEN'] ?? '';

  static bool get isProduction =>
      dotenv.env['PRODUCTION']?.toLowerCase() == 'true';

  static Future<void> load() async {
    await dotenv.load(fileName: '.env');
  }
}
