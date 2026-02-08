import 'package:flutter/material.dart';

import '../constants/app_colors.dart';
import '../constants/app_typography.dart';

/// Section header with teal accent bar and uppercase label.
///
/// Matches the original design pattern: 4px teal bar + 11px uppercase label.
/// Optional trailing widget for actions like "전체 보기" (View All).
class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.label, this.trailing});

  final String label;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 16,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(9999),
            ),
          ),
          const SizedBox(width: 8),
          Text(label.toUpperCase(), style: AppTypography.sectionLabel),
          if (trailing != null) ...[const Spacer(), trailing!],
        ],
      ),
    );
  }
}
