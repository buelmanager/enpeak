import 'auth_service.dart';

class TokenManager {
  final AuthService _authService = AuthService();

  Future<String?> getIdToken({bool forceRefresh = false}) async {
    return _authService.getIdToken(forceRefresh: forceRefresh);
  }

  bool get isAuthenticated => _authService.isAuthenticated;
}
