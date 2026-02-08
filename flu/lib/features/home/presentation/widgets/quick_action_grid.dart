import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_shadows.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/core/widgets/tap_scale.dart';

class QuickActionGrid extends StatelessWidget {
  const QuickActionGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _QuickActionCard(
            icon: Icons.chat_bubble_outline_rounded,
            label: '\uc790\uc720 \ub300\ud654',
            onTap: () => Navigator.pushNamed(context, '/talk'),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _QuickActionCard(
            icon: Icons.lightbulb_outline_rounded,
            label: '\ud45c\ud604 \uc5f0\uc2b5',
            onTap: () => Navigator.pushNamed(
              context,
              '/talk',
              arguments: {'mode': 'expression'},
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _QuickActionCard(
            icon: Icons.groups_outlined,
            label: '\ub864\ud50c\ub808\uc774',
            onTap: () => Navigator.pushNamed(
              context,
              '/talk',
              arguments: {'mode': 'roleplay'},
            ),
          ),
        ),
      ],
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return TapScale(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
          border: Border.all(color: AppColors.borderCard),
          boxShadow: AppShadows.card,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
              ),
              child: Icon(icon, size: 20, color: Colors.white),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: AppTypography.bodyCard.copyWith(
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
