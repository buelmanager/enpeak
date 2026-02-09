import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  bool _googleInitialized = false;

  User? get currentUser => _auth.currentUser;
  bool get isAuthenticated => _auth.currentUser != null;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  Future<String?> getIdToken({bool forceRefresh = false}) async {
    final user = _auth.currentUser;
    if (user == null) return null;
    return user.getIdToken(forceRefresh);
  }

  Future<void> _ensureGoogleInitialized() async {
    if (!_googleInitialized) {
      await GoogleSignIn.instance.initialize();
      _googleInitialized = true;
    }
  }

  Future<Map<String, dynamic>> signInWithGoogle() async {
    try {
      await _ensureGoogleInitialized();
      final account = await GoogleSignIn.instance.authenticate();
      final idTokenStr = account.authentication.idToken;

      if (idTokenStr == null) {
        return {'error': 'No ID token from Google'};
      }

      final credential = GoogleAuthProvider.credential(
        idToken: idTokenStr,
      );

      final userCredential = await _auth.signInWithCredential(credential);
      final firebaseIdToken = await userCredential.user?.getIdToken();

      return {
        'uid': userCredential.user?.uid,
        'email': userCredential.user?.email,
        'displayName': userCredential.user?.displayName,
        'photoURL': userCredential.user?.photoURL,
        'idToken': firebaseIdToken,
      };
    } catch (e) {
      debugPrint('[Auth] Google sign-in error: $e');
      return {'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> signInWithEmail(String email, String password) async {
    try {
      final userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      final idToken = await userCredential.user?.getIdToken();

      return {
        'uid': userCredential.user?.uid,
        'email': userCredential.user?.email,
        'displayName': userCredential.user?.displayName,
        'idToken': idToken,
      };
    } catch (e) {
      debugPrint('[Auth] Email sign-in error: $e');
      return {'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> signUpWithEmail(String email, String password) async {
    try {
      final userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      final idToken = await userCredential.user?.getIdToken();

      return {
        'uid': userCredential.user?.uid,
        'email': userCredential.user?.email,
        'idToken': idToken,
      };
    } catch (e) {
      debugPrint('[Auth] Email sign-up error: $e');
      return {'error': e.toString()};
    }
  }

  Future<void> signOutUser() async {
    try {
      if (_googleInitialized) {
        await GoogleSignIn.instance.signOut();
      }
    } catch (e) {
      debugPrint('[Auth] Google sign-out error: $e');
    }
    await _auth.signOut();
  }
}
