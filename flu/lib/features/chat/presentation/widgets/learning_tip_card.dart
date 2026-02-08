import 'package:flutter/material.dart';

/// Card displaying a Korean learning tip from the AI tutor.
///
/// Shown below AI messages when the response includes grammar
/// or usage guidance relevant to the conversation.
/// Matches original Next.js design: amber tinted card.
class LearningTipCard extends StatelessWidget {
  final String tip;

  const LearningTipCard({super.key, required this.tip});

  // Design tokens from original
  static const _bgColor = Color(0xFFFEF3C7);
  static const _borderColor = Color(0xFFFCD34D);
  static const _headerColor = Color(0xFFD97706);
  static const _textColor = Color(0xFF92400E);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _bgColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.lightbulb_outline,
                size: 14,
                color: _headerColor,
              ),
              const SizedBox(width: 6),
              Text(
                '\ud559\uc2b5 \ud301',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: _headerColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            tip,
            style: const TextStyle(
              fontSize: 13,
              color: _textColor,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
