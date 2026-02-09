import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'bridge_models.dart';
import 'bridge_actions.dart';
import '../../features/recording/recording_service.dart';
import '../../features/auth/token_manager.dart';
import '../../features/auth/auth_service.dart';

class BridgeHandler {
  final RecordingService _recordingService;
  final TokenManager _tokenManager;
  final AuthService _authService;

  BridgeHandler({
    required RecordingService recordingService,
    required TokenManager tokenManager,
    required AuthService authService,
  })  : _recordingService = recordingService,
        _tokenManager = tokenManager,
        _authService = authService;

  void register(InAppWebViewController controller) {
    controller.addJavaScriptHandler(
      handlerName: 'FlutterBridge',
      callback: (args) async {
        if (args.isEmpty) {
          return BridgeResponse.error('', 'No arguments provided').toMap();
        }

        try {
          final map = args[0] as Map<String, dynamic>;
          final request = BridgeRequest.fromMap(map);
          final response = await _handleRequest(request);
          return response.toMap();
        } catch (e) {
          debugPrint('[Bridge] Error: $e');
          return BridgeResponse.error('', e.toString()).toMap();
        }
      },
    );
  }

  Future<BridgeResponse> _handleRequest(BridgeRequest request) async {
    final action = BridgeAction.fromString(request.action);
    if (action == null) {
      return BridgeResponse.error(request.id, 'Unknown action: ${request.action}');
    }

    switch (action) {
      case BridgeAction.recordStart:
        return _handleRecordStart(request);
      case BridgeAction.recordStopAndGetBase64:
        return _handleRecordStop(request);
      case BridgeAction.getToken:
        return _handleGetToken(request);
      case BridgeAction.getPlatformInfo:
        return _handleGetPlatformInfo(request);
      case BridgeAction.signInGoogle:
        return _handleSignInGoogle(request);
      case BridgeAction.signInEmail:
        return _handleSignInEmail(request);
      case BridgeAction.signUpEmail:
        return _handleSignUpEmail(request);
      case BridgeAction.signOut:
        return _handleSignOut(request);
    }
  }

  Future<BridgeResponse> _handleRecordStart(BridgeRequest request) async {
    try {
      await _recordingService.startRecording();
      return BridgeResponse.success(request.id);
    } catch (e) {
      return BridgeResponse.error(request.id, 'Failed to start recording: $e');
    }
  }

  Future<BridgeResponse> _handleRecordStop(BridgeRequest request) async {
    try {
      final result = await _recordingService.stopAndEncode();
      if (result.tooLong) {
        return BridgeResponse.tooLong(request.id);
      }
      return BridgeResponse.success(request.id, data: {
        'base64': result.base64,
        'mimeType': result.mimeType,
        'durationMs': result.durationMs,
      });
    } catch (e) {
      return BridgeResponse.error(request.id, 'Failed to stop recording: $e');
    }
  }

  Future<BridgeResponse> _handleGetToken(BridgeRequest request) async {
    try {
      final forceRefresh = request.payload?['forceRefresh'] == true;
      final token = await _tokenManager.getIdToken(forceRefresh: forceRefresh);
      if (token == null) {
        return BridgeResponse.error(request.id, 'No authenticated user');
      }
      return BridgeResponse.success(request.id, data: {'token': token});
    } catch (e) {
      return BridgeResponse.error(request.id, 'Failed to get token: $e');
    }
  }

  Future<BridgeResponse> _handleGetPlatformInfo(BridgeRequest request) async {
    return BridgeResponse.success(request.id, data: {
      'platform': Platform.isIOS ? 'ios' : Platform.isAndroid ? 'android' : 'other',
      'version': '1.0.0',
    });
  }

  Future<BridgeResponse> _handleSignInGoogle(BridgeRequest request) async {
    try {
      final result = await _authService.signInWithGoogle();
      if (result.containsKey('error')) {
        return BridgeResponse.error(request.id, result['error'] as String);
      }
      return BridgeResponse.success(request.id, data: result);
    } catch (e) {
      return BridgeResponse.error(request.id, 'Google sign-in failed: $e');
    }
  }

  Future<BridgeResponse> _handleSignInEmail(BridgeRequest request) async {
    try {
      final email = request.payload?['email'] as String?;
      final password = request.payload?['password'] as String?;
      if (email == null || password == null) {
        return BridgeResponse.error(request.id, 'Email and password required');
      }
      final result = await _authService.signInWithEmail(email, password);
      if (result.containsKey('error')) {
        return BridgeResponse.error(request.id, result['error'] as String);
      }
      return BridgeResponse.success(request.id, data: result);
    } catch (e) {
      return BridgeResponse.error(request.id, 'Email sign-in failed: $e');
    }
  }

  Future<BridgeResponse> _handleSignUpEmail(BridgeRequest request) async {
    try {
      final email = request.payload?['email'] as String?;
      final password = request.payload?['password'] as String?;
      if (email == null || password == null) {
        return BridgeResponse.error(request.id, 'Email and password required');
      }
      final result = await _authService.signUpWithEmail(email, password);
      if (result.containsKey('error')) {
        return BridgeResponse.error(request.id, result['error'] as String);
      }
      return BridgeResponse.success(request.id, data: result);
    } catch (e) {
      return BridgeResponse.error(request.id, 'Email sign-up failed: $e');
    }
  }

  Future<BridgeResponse> _handleSignOut(BridgeRequest request) async {
    try {
      await _authService.signOutUser();
      return BridgeResponse.success(request.id);
    } catch (e) {
      return BridgeResponse.error(request.id, 'Sign-out failed: $e');
    }
  }
}
