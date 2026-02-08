import 'package:flutter/material.dart';

abstract final class AppShadows {
  // Card shadow: 0 2px 8px rgba(0,0,0,0.04)
  static const List<BoxShadow> card = [
    BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 2)),
  ];

  // Medium shadow: 0 4px 6px rgba(0,0,0,0.1)
  static const List<BoxShadow> medium = [
    BoxShadow(color: Color(0x1A000000), blurRadius: 6, offset: Offset(0, 4)),
  ];

  // FAB shadow: 0 4px 20px rgba(13,148,136,0.35)
  static const List<BoxShadow> fab = [
    BoxShadow(color: Color(0x590D9488), blurRadius: 20, offset: Offset(0, 4)),
  ];

  // No shadow
  static const List<BoxShadow> none = [];
}
