import 'package:flutter/material.dart';
import 'core/webview/webview_shell.dart';

class EnPeakApp extends StatelessWidget {
  const EnPeakApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EnPeak',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF0D9488),
        useMaterial3: true,
        brightness: Brightness.light,
      ),
      home: const WebViewShell(),
    );
  }
}
