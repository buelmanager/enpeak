import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/tap_scale.dart';

/// Suggestion chips displayed below AI messages.
///
/// Matches original Next.js design: purple tinted container with
/// white chip buttons. Users can tap to send a suggestion directly.
class SuggestionChips extends StatelessWidget {
  final List<String> suggestions;
  final void Function(String suggestion)? onTap;

  const SuggestionChips({super.key, required this.suggestions, this.onTap});

  // Design tokens from original
  static const _containerBg = Color(0xFFEDE9FE);
  static const _containerBorder = Color(0xFFC4B5FD);
  static const _headerColor = Color(0xFF7C3AED);
  static const _chipTextColor = Color(0xFF6D28D9);

  @override
  Widget build(BuildContext context) {
    if (suggestions.isEmpty) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _containerBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _containerBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.chat_bubble_outline,
                size: 14,
                color: _headerColor,
              ),
              const SizedBox(width: 6),
              Text(
                '\ucd94\ucc9c \uc751\ub2f5',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: _headerColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: suggestions.map((suggestion) {
              return TapScale(
                onTap: () => onTap?.call(suggestion),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: _containerBorder),
                  ),
                  child: Text(
                    suggestion,
                    style: const TextStyle(fontSize: 13, color: _chipTextColor),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
