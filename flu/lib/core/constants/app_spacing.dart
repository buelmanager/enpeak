import 'package:flutter/material.dart';

abstract final class AppSpacing {
  // Base spacing values
  static const double xs = 2;
  static const double sm = 4;
  static const double md = 8;
  static const double lg = 12;
  static const double xl = 16;
  static const double xxl = 20;
  static const double xxxl = 24;
  static const double xxxxl = 32;

  // Semantic spacing
  static const double pagePadding = 24;
  static const double cardPadding = 20;
  static const double sectionGap = 12;
  static const double bottomNavClearance = 96;

  // Border radius values
  static const double radiusSm = 4;
  static const double radiusMd = 8;
  static const double radiusLg = 10;
  static const double radiusXl = 12;
  static const double radiusXxl = 16;
  static const double radiusXxxl = 24;
  static const double radiusFull = 9999;

  // Pre-built BorderRadius objects
  static final BorderRadius borderRadiusSm = BorderRadius.circular(radiusSm);
  static final BorderRadius borderRadiusMd = BorderRadius.circular(radiusMd);
  static final BorderRadius borderRadiusLg = BorderRadius.circular(radiusLg);
  static final BorderRadius borderRadiusXl = BorderRadius.circular(radiusXl);
  static final BorderRadius borderRadiusXxl = BorderRadius.circular(radiusXxl);
  static final BorderRadius borderRadiusXxxl = BorderRadius.circular(
    radiusXxxl,
  );
  static final BorderRadius borderRadiusFull = BorderRadius.circular(
    radiusFull,
  );

  // Common padding presets
  static const EdgeInsets pagePaddingH = EdgeInsets.symmetric(
    horizontal: pagePadding,
  );
  static const EdgeInsets cardPaddingAll = EdgeInsets.all(cardPadding);
}
