import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:permission_handler/permission_handler.dart';
import '../constants.dart';
import '../bridge/bridge_handler.dart';
import '../../features/recording/recording_service.dart';
import '../../features/auth/auth_service.dart';
import '../../features/auth/token_manager.dart';
import '../../screens/splash_screen.dart';
import '../../screens/error_screen.dart';

class WebViewShell extends StatefulWidget {
  const WebViewShell({super.key});

  @override
  State<WebViewShell> createState() => _WebViewShellState();
}

class _WebViewShellState extends State<WebViewShell> {
  InAppWebViewController? _webViewController;
  late final BridgeHandler _bridgeHandler;
  late final RecordingService _recordingService;
  late final AuthService _authService;
  late final TokenManager _tokenManager;

  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';
  double _progress = 0;

  @override
  void initState() {
    super.initState();
    _recordingService = RecordingService();
    _authService = AuthService();
    _tokenManager = TokenManager();
    _bridgeHandler = BridgeHandler(
      recordingService: _recordingService,
      tokenManager: _tokenManager,
      authService: _authService,
    );
    _requestMicPermission();
  }

  Future<void> _requestMicPermission() async {
    await Permission.microphone.request();
  }

  @override
  void dispose() {
    _recordingService.dispose();
    super.dispose();
  }

  void _retry() {
    setState(() {
      _hasError = false;
      _isLoading = true;
      _progress = 0;
    });
    _webViewController?.loadUrl(
      urlRequest: URLRequest(url: WebUri(AppConstants.webUrl)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            if (_hasError)
              ErrorScreen(
                message: _errorMessage,
                onRetry: _retry,
              )
            else
              InAppWebView(
                initialUrlRequest: URLRequest(
                  url: WebUri(AppConstants.webUrl),
                ),
                initialSettings: InAppWebViewSettings(
                  javaScriptEnabled: true,
                  mediaPlaybackRequiresUserGesture: false,
                  allowsInlineMediaPlayback: true,
                  userAgent:
                      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) '
                      'AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 '
                      '${AppConstants.userAgentSuffix}',
                  mixedContentMode: MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
                  allowFileAccessFromFileURLs: true,
                  allowUniversalAccessFromFileURLs: true,
                ),
                onWebViewCreated: (controller) {
                  _webViewController = controller;
                  _bridgeHandler.register(controller);
                },
                onLoadStart: (controller, url) {
                  setState(() {
                    _isLoading = true;
                    _hasError = false;
                  });
                },
                onLoadStop: (controller, url) async {
                  setState(() => _isLoading = false);

                  // Inject bridge ready signal
                  await controller.evaluateJavascript(source: '''
                    window.__FLUTTER_BRIDGE_READY = true;
                    window.dispatchEvent(new CustomEvent('flutterBridgeReady'));
                    console.log('[EnPeak] Flutter bridge ready');
                  ''');
                },
                onProgressChanged: (controller, progress) {
                  setState(() => _progress = progress / 100);
                },
                onReceivedError: (controller, request, error) {
                  if (request.url.toString() == AppConstants.webUrl) {
                    setState(() {
                      _hasError = true;
                      _errorMessage = error.description;
                    });
                  }
                },
                onPermissionRequest: (controller, request) async {
                  return PermissionResponse(
                    resources: request.resources,
                    action: PermissionResponseAction.GRANT,
                  );
                },
                onConsoleMessage: (controller, consoleMessage) {
                  debugPrint('[WebView] ${consoleMessage.message}');
                },
              ),
            if (_isLoading && !_hasError)
              SplashScreen(progress: _progress),
          ],
        ),
      ),
    );
  }
}
