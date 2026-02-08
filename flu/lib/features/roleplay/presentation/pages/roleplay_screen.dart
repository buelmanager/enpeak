import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';

class RoleplayScreen extends StatelessWidget {
  const RoleplayScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Roleplay'),
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_rounded),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.theater_comedy_rounded,
              size: 64,
              color: AppColors.textSecondary.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text('Roleplay Scenarios', style: AppTypography.heading3),
            const SizedBox(height: 8),
            Text(
              'Practice English in real-life situations',
              style: AppTypography.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}
