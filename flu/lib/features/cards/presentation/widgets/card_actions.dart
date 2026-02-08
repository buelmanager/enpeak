import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import '../providers/cards_state.dart';

class CardActions extends StatelessWidget {
  final HideMode hideMode;
  final bool isRevealed;
  final bool hasPrevious;
  final bool hasNext;
  final VoidCallback onToggleHideMode;
  final VoidCallback onPrevious;
  final VoidCallback onNext;
  final VoidCallback onExpandIdioms;
  final VoidCallback? onKnow;
  final VoidCallback? onDontKnow;

  const CardActions({
    super.key,
    required this.hideMode,
    this.isRevealed = false,
    required this.hasPrevious,
    required this.hasNext,
    required this.onToggleHideMode,
    required this.onPrevious,
    required this.onNext,
    required this.onExpandIdioms,
    this.onKnow,
    this.onDontKnow,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          // Know / Don't Know buttons (only when revealed)
          if (isRevealed) ...[
            Row(
              children: [
                // Don't Know
                Expanded(
                  child: Material(
                    color: Colors.transparent,
                    borderRadius: AppSpacing.borderRadiusXl,
                    child: InkWell(
                      onTap: onDontKnow,
                      borderRadius: AppSpacing.borderRadiusXl,
                      child: Container(
                        height: 52,
                        decoration: BoxDecoration(
                          borderRadius: AppSpacing.borderRadiusXl,
                          border: Border.all(
                            color: AppColors.accentCoral,
                            width: 1.5,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: const Text(
                          '모르겠어요',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: AppColors.accentCoral,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Know
                Expanded(
                  child: Material(
                    color: AppColors.primary,
                    borderRadius: AppSpacing.borderRadiusXl,
                    child: InkWell(
                      onTap: onKnow,
                      borderRadius: AppSpacing.borderRadiusXl,
                      child: Container(
                        height: 52,
                        alignment: Alignment.center,
                        child: const Text(
                          '알아요',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: AppColors.surface,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
          ],
          // Utility actions row
          Row(
            children: [
              Expanded(
                child: _UtilityPill(
                  icon: hideMode == HideMode.hideMeaning
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  label: hideMode == HideMode.hideMeaning ? '뜻 가리기' : '단어 가리기',
                  onTap: onToggleHideMode,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _UtilityPill(
                  icon: Icons.auto_stories_outlined,
                  label: '숙어/예문',
                  onTap: onExpandIdioms,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Navigation arrows
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _NavigationButton(
                icon: Icons.chevron_left_rounded,
                enabled: hasPrevious,
                onTap: onPrevious,
              ),
              const SizedBox(width: 48),
              _NavigationButton(
                icon: Icons.chevron_right_rounded,
                enabled: hasNext,
                onTap: onNext,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _UtilityPill extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _UtilityPill({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.inputBg,
      borderRadius: AppSpacing.borderRadiusMd,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppSpacing.borderRadiusMd,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: AppColors.textSecondary),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavigationButton extends StatelessWidget {
  final IconData icon;
  final bool enabled;
  final VoidCallback onTap;

  const _NavigationButton({
    required this.icon,
    required this.enabled,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = enabled ? AppColors.textPrimary : AppColors.textTertiary;
    final bgColor = enabled ? AppColors.surface : AppColors.borderLight;
    final borderColor = enabled ? AppColors.border : AppColors.borderLight;

    return Material(
      color: bgColor,
      shape: const CircleBorder(),
      child: InkWell(
        onTap: enabled ? onTap : null,
        customBorder: const CircleBorder(),
        child: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: borderColor),
          ),
          child: Icon(icon, size: 28, color: color),
        ),
      ),
    );
  }
}
