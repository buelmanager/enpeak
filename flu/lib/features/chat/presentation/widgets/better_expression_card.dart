import 'package:flutter/material.dart';

/// Card showing better ways to express what the user said.
///
/// Displayed below user messages when the AI detects the user's
/// sentence can be improved with more natural expressions.
/// Matches original Next.js design: green tinted card.
class BetterExpressionCard extends StatelessWidget {
  final List<String> expressions;

  const BetterExpressionCard({super.key, required this.expressions});

  // Design tokens from original
  static const _bgColor = Color(0xFFF0FDF4);
  static const _borderColor = Color(0xFF86EFAC);
  static const _headerColor = Color(0xFF16A34A);
  static const _itemColor = Color(0xFF166534);
  static const _dividerColor = Color(0xFFDCFCE7);

  @override
  Widget build(BuildContext context) {
    if (expressions.isEmpty) return const SizedBox.shrink();

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
              const Icon(Icons.auto_awesome, size: 14, color: _headerColor),
              const SizedBox(width: 6),
              Text(
                '\ub354 \ub098\uc740 \ud45c\ud604',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: _headerColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          for (int i = 0; i < expressions.length; i++) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 6),
              decoration: i < expressions.length - 1
                  ? const BoxDecoration(
                      border: Border(bottom: BorderSide(color: _dividerColor)),
                    )
                  : null,
              child: Text(
                expressions[i],
                style: const TextStyle(fontSize: 13, color: _itemColor),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
