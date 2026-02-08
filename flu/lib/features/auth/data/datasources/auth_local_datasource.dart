import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/user.dart';

class AuthLocalDataSource {
  static const _userKey = 'current_user';
  final SharedPreferences _prefs;

  AuthLocalDataSource(this._prefs);

  AppUser? getCachedUser() {
    final jsonString = _prefs.getString(_userKey);
    if (jsonString == null) return null;

    final json = jsonDecode(jsonString) as Map<String, dynamic>;
    return AppUser(
      uid: json['uid'] as String? ?? '',
      email: json['email'] as String?,
      displayName: json['display_name'] as String?,
      photoUrl: json['photo_url'] as String?,
      isAnonymous: json['is_anonymous'] as bool? ?? false,
    );
  }

  Future<void> cacheUser(AppUser user) async {
    final json = {
      'uid': user.uid,
      'email': user.email,
      'display_name': user.displayName,
      'photo_url': user.photoUrl,
      'is_anonymous': user.isAnonymous,
    };
    await _prefs.setString(_userKey, jsonEncode(json));
  }

  Future<void> clearUser() async {
    await _prefs.remove(_userKey);
  }
}
