import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/daily/presentation/providers/daily_provider.dart';
import 'package:flu/features/speech/presentation/providers/tts_provider.dart';

class DailyScreen extends ConsumerStatefulWidget {
  const DailyScreen({super.key});

  @override
  ConsumerState<DailyScreen> createState() => _DailyScreenState();
}

class _DailyScreenState extends ConsumerState<DailyScreen>
    with TickerProviderStateMixin {
  bool _showMeaning = false;
  bool _showTranslation = false;

  late final AnimationController _meaningController;
  late final Animation<double> _meaningAnimation;
  late final AnimationController _translationController;
  late final Animation<double> _translationAnimation;

  @override
  void initState() {
    super.initState();
    _meaningController = AnimationController(
      duration: const Duration(milliseconds: 250),
      vsync: this,
    );
    _meaningAnimation = CurvedAnimation(
      parent: _meaningController,
      curve: Curves.easeInOut,
    );
    _translationController = AnimationController(
      duration: const Duration(milliseconds: 250),
      vsync: this,
    );
    _translationAnimation = CurvedAnimation(
      parent: _translationController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _meaningController.dispose();
    _translationController.dispose();
    super.dispose();
  }

  void _toggleMeaning() {
    setState(() {
      _showMeaning = !_showMeaning;
    });
    if (_showMeaning) {
      _meaningController.forward();
    } else {
      _meaningController.reverse();
    }
  }

  void _toggleTranslation() {
    setState(() {
      _showTranslation = !_showTranslation;
    });
    if (_showTranslation) {
      _translationController.forward();
    } else {
      _translationController.reverse();
    }
  }

  void _handleRefresh() {
    setState(() {
      _showMeaning = false;
      _showTranslation = false;
    });
    _meaningController.reset();
    _translationController.reset();
    ref.read(dailyProvider.notifier).refresh();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(dailyProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header - px-6 pt-16 pb-6 matching Next.js
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Padding(
                      padding: EdgeInsets.all(2),
                      child: Icon(
                        Icons.chevron_left_rounded,
                        size: 28,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  Text(
                    '오늘의 표현',
                    style: AppTypography.heading3.copyWith(
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  GestureDetector(
                    onTap: state.isLoading ? null : _handleRefresh,
                    child: Padding(
                      padding: const EdgeInsets.all(2),
                      child: Icon(
                        Icons.refresh_rounded,
                        size: 24,
                        color: state.isLoading
                            ? AppColors.textTertiary
                            : AppColors.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: state.isLoading
                  ? _buildLoading()
                  : state.error != null
                  ? _buildError(state.error!)
                  : state.expression != null
                  ? _buildContent(state)
                  : _buildEmpty(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(DailyState state) {
    final expr = state.expression!;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          // Expression Card - bg-white rounded-2xl p-6 border
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category + TTS row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (expr.category.isNotEmpty)
                      Text(
                        expr.category.toUpperCase(),
                        style: AppTypography.sectionLabel.copyWith(
                          letterSpacing: 1.2,
                        ),
                      )
                    else
                      const SizedBox.shrink(),
                    GestureDetector(
                      onTap: () {
                        ref.read(ttsProvider.notifier).speak(expr.expression);
                      },
                      child: const Icon(
                        Icons.volume_up_outlined,
                        size: 20,
                        color: AppColors.textLink,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Expression text - text-2xl font-medium
                Text(
                  expr.expression,
                  style: AppTypography.heading2.copyWith(
                    fontSize: 24,
                    fontWeight: FontWeight.w500,
                    height: 1.3,
                  ),
                ),

                const SizedBox(height: 16),

                // Collapsible meaning section
                GestureDetector(
                  onTap: _toggleMeaning,
                  behavior: HitTestBehavior.opaque,
                  child: Container(
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: AppColors.borderLight),
                      ),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '뜻 보기',
                          style: AppTypography.bodySmall.copyWith(
                            fontSize: 14,
                            color: AppColors.textLink,
                          ),
                        ),
                        AnimatedRotation(
                          turns: _showMeaning ? 0.5 : 0,
                          duration: const Duration(milliseconds: 250),
                          child: const Icon(
                            Icons.keyboard_arrow_down_rounded,
                            size: 20,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                SizeTransition(
                  sizeFactor: _meaningAnimation,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(
                      expr.meaning,
                      style: AppTypography.body.copyWith(
                        fontSize: 16,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Example Card
          if (expr.example.isNotEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Example label + TTS
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'EXAMPLE',
                        style: AppTypography.sectionLabel.copyWith(
                          letterSpacing: 1.2,
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          ref.read(ttsProvider.notifier).speak(expr.example);
                        },
                        child: const Icon(
                          Icons.volume_up_outlined,
                          size: 20,
                          color: AppColors.textLink,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Example sentence - text-lg leading-relaxed
                  Text(
                    expr.example,
                    style: AppTypography.body.copyWith(
                      fontSize: 18,
                      height: 1.6,
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Collapsible translation
                  if (expr.exampleKo.isNotEmpty)
                    GestureDetector(
                      onTap: _toggleTranslation,
                      behavior: HitTestBehavior.opaque,
                      child: Container(
                        decoration: const BoxDecoration(
                          border: Border(
                            top: BorderSide(color: AppColors.borderLight),
                          ),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '해석 보기',
                              style: AppTypography.bodySmall.copyWith(
                                fontSize: 14,
                                color: AppColors.textLink,
                              ),
                            ),
                            AnimatedRotation(
                              turns: _showTranslation ? 0.5 : 0,
                              duration: const Duration(milliseconds: 250),
                              child: const Icon(
                                Icons.keyboard_arrow_down_rounded,
                                size: 20,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  if (expr.exampleKo.isNotEmpty)
                    SizeTransition(
                      sizeFactor: _translationAnimation,
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Text(
                          expr.exampleKo,
                          style: AppTypography.body.copyWith(
                            fontSize: 15,
                            color: AppColors.textLink,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),

          const SizedBox(height: 24),

          // Practice CTA - w-full py-4 bg-primary text-white rounded-xl
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(
                  context,
                  '/talk',
                  arguments: {
                    'expression': expr.expression,
                    'meaning': expr.meaning,
                  },
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
                ),
                textStyle: AppTypography.button.copyWith(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  letterSpacing: 0.3,
                ),
              ),
              child: const Text('이 표현으로 대화 연습하기'),
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildLoading() {
    return Center(
      child: SizedBox(
        width: 32,
        height: 32,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          color: AppColors.primary,
          backgroundColor: AppColors.primary.withValues(alpha: 0.15),
        ),
      ),
    );
  }

  Widget _buildError(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline_rounded,
              size: 48,
              color: AppColors.error.withValues(alpha: 0.6),
            ),
            const SizedBox(height: 16),
            Text('표현을 불러올 수 없습니다', style: AppTypography.heading3),
            const SizedBox(height: 8),
            Text(
              error,
              style: AppTypography.bodySmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 44,
              child: ElevatedButton.icon(
                onPressed: () => ref.read(dailyProvider.notifier).refresh(),
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('다시 시도'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '표현을 불러올 수 없습니다',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
