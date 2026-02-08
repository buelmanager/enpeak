import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/features/talk/presentation/providers/talk_provider.dart'
    show TalkMode;

class ModeSelector extends StatelessWidget {
  final TalkMode currentMode;
  final ValueChanged<TalkMode> onModeChanged;

  const ModeSelector({
    super.key,
    required this.currentMode,
    required this.onModeChanged,
  });

  int get _activeIndex => TalkMode.values.indexOf(currentMode);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppColors.borderLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final tabWidth = constraints.maxWidth / TalkMode.values.length;
          return SizedBox(
            height: 36,
            child: Stack(
              children: [
                // Sliding white indicator
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeInOut,
                  left: tabWidth * _activeIndex,
                  top: 0,
                  bottom: 0,
                  width: tabWidth,
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x0D000000),
                          blurRadius: 4,
                          offset: Offset(0, 1),
                        ),
                        BoxShadow(
                          color: Color(0x0A000000),
                          blurRadius: 2,
                          offset: Offset(0, 0),
                        ),
                      ],
                    ),
                  ),
                ),
                // Tab buttons
                Row(
                  children: TalkMode.values.map((mode) {
                    final isActive = mode == currentMode;
                    return Expanded(
                      child: GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onTap: () => onModeChanged(mode),
                        child: Center(
                          child: AnimatedDefaultTextStyle(
                            duration: const Duration(milliseconds: 200),
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isActive
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                              color: isActive
                                  ? AppColors.textPrimary
                                  : AppColors.textSecondary,
                            ),
                            child: Text(_modeLabel(mode)),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  String _modeLabel(TalkMode mode) => switch (mode) {
    TalkMode.free => '\uc790\uc720 \ub300\ud654',
    TalkMode.expression => '\ud45c\ud604 \uc5f0\uc2b5',
    TalkMode.roleplay => '\ub864\ud50c\ub808\uc774',
  };
}
