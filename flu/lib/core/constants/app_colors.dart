import 'package:flutter/material.dart';

abstract final class AppColors {
  static const Color primary = Color(0xFF0D9488);
  static const Color background = Color(0xFFFAF9F7);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF1A1A1A);
  static const Color textSecondary = Color(0xFF8A8A8A);
  static const Color border = Color(0xFFE5E5E5);
  static const Color borderLight = Color(0xFFF0F0F0);
  static const Color error = Color(0xFFEF4444);
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);

  static const Color primaryLight = Color(0xFFCCFBF1);
  static const Color primaryDark = Color(0xFF0F766E);
  static const Color shimmerBase = Color(0xFFE0E0E0);
  static const Color shimmerHighlight = Color(0xFFF5F5F5);

  // Additional colors from Next.js design system
  static const Color primaryHover = Color(0xFF0F766E);
  static const Color primaryTint = Color(0xFFF0FDFA);
  static const Color textTertiary = Color(0xFFC5C5C5);
  static const Color textLink = Color(0xFF666666);
  static const Color borderCard = Color(0xFFEBEBEB);
  static const Color inputBg = Color(0xFFF5F5F5);

  // Accent colors
  static const Color accentCoral = Color(0xFFF87171);
  static const Color accentGreen = Color(0xFF10B981);
  static const Color accentOrange = Color(0xFFF59E0B);
  static const Color accentPurple = Color(0xFF8B5CF6);

  // Quiz feedback
  static const Color quizCorrectBg = Color(0xFFE8F5E9);
  static const Color quizCorrectText = Color(0xFF2E7D32);
  static const Color quizCorrectBorder = Color(0xFFC8E6C9);
  static const Color quizWrongBg = Color(0xFFFCE4EC);
  static const Color quizWrongText = Color(0xFFC62828);
  static const Color quizWrongBorder = Color(0xFFF8BBD0);

  // Level colors (A1-C2)
  static const Color levelA1 = Color(0xFF22C55E);
  static const Color levelA2 = Color(0xFF4ADE80);
  static const Color levelB1 = Color(0xFFEAB308);
  static const Color levelB2 = Color(0xFFF97316);
  static const Color levelC1 = Color(0xFFEF4444);
  static const Color levelC2 = Color(0xFFA855F7);

  // Difficulty badge colors
  static const Color difficultyBeginnerBg = Color(0xFFE8F5E9);
  static const Color difficultyBeginnerText = Color(0xFF2E7D32);
  static const Color difficultyIntermediateBg = Color(0xFFFFF3E0);
  static const Color difficultyIntermediateText = Color(0xFFE65100);
  static const Color difficultyAdvancedBg = Color(0xFFFCE4EC);
  static const Color difficultyAdvancedText = Color(0xFFC62828);

  // Status/category badge colors
  static const Color badgeBlueBg = Color(0xFFDBEAFE);
  static const Color badgeBlueText = Color(0xFF1D4ED8);
  static const Color badgeRedBg = Color(0xFFFEE2E2);
  static const Color badgeRedText = Color(0xFFB91C1C);
  static const Color badgeAmberBg = Color(0xFFFEF3C7);
  static const Color badgeAmberText = Color(0xFF92400E);
  static const Color badgeGreenBg = Color(0xFFD1FAE5);
  static const Color badgeGreenText = Color(0xFF065F46);

  // Helper to get level color
  static Color levelColor(String level) {
    switch (level) {
      case 'A1':
        return levelA1;
      case 'A2':
        return levelA2;
      case 'B1':
        return levelB1;
      case 'B2':
        return levelB2;
      case 'C1':
        return levelC1;
      case 'C2':
        return levelC2;
      default:
        return primary;
    }
  }
}
