import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';

enum QuizMode {
  flashcard,
  multipleChoice,
  spelling,
  listening,
  gapFill,
  translation,
}

class QuizModeSelector extends StatefulWidget {
  final void Function(QuizMode mode, int count, bool reviewOnly) onModeSelected;
  final VoidCallback onClose;
  final int availableWords;
  final int reviewableWords;
  final bool isSentenceMode;

  const QuizModeSelector({
    super.key,
    required this.onModeSelected,
    required this.onClose,
    required this.availableWords,
    required this.reviewableWords,
    this.isSentenceMode = false,
  });

  @override
  State<QuizModeSelector> createState() => _QuizModeSelectorState();
}

class _QuizModeSelectorState extends State<QuizModeSelector>
    with SingleTickerProviderStateMixin {
  bool _reviewOnly = false;
  int _selectedCount = 10;

  late final AnimationController _slideController;
  late final Animation<Offset> _slideAnimation;

  static const _countOptions = [5, 10, 20];

  @override
  void initState() {
    super.initState();
    _slideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _slideController, curve: Curves.easeOut));
    _slideController.forward();
  }

  @override
  void dispose() {
    _slideController.dispose();
    super.dispose();
  }

  int get _availableCount =>
      _reviewOnly ? widget.reviewableWords : widget.availableWords;

  void _handleClose() {
    _slideController.reverse().then((_) => widget.onClose());
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _handleClose,
      child: Material(
        color: Colors.black.withValues(alpha: 0.4),
        child: GestureDetector(
          onTap: () {},
          child: Align(
            alignment: Alignment.bottomCenter,
            child: SlideTransition(
              position: _slideAnimation,
              child: _buildSheet(context),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSheet(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(AppSpacing.radiusXxxl),
          topRight: Radius.circular(AppSpacing.radiusXxxl),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle bar
            Padding(
              padding: const EdgeInsets.only(top: 12, bottom: 4),
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(),
                  const SizedBox(height: 20),
                  _buildReviewToggle(),
                  const SizedBox(height: 16),
                  _buildCountSelector(),
                  const SizedBox(height: 20),
                  _buildModeGrid(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          widget.isSentenceMode ? '문장 퀴즈' : '단어 퀴즈',
          style: AppTypography.heading3,
        ),
        GestureDetector(
          onTap: _handleClose,
          child: Container(
            width: 32,
            height: 32,
            decoration: const BoxDecoration(shape: BoxShape.circle),
            child: const Icon(
              Icons.close_rounded,
              size: 24,
              color: AppColors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildReviewToggle() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: AppSpacing.borderRadiusXl,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('복습 모드', style: AppTypography.bodyMedium14),
              const SizedBox(height: 2),
              Text(
                '복습 필요 ${widget.reviewableWords}개 / 전체 ${widget.availableWords}개',
                style: AppTypography.caption,
              ),
            ],
          ),
          GestureDetector(
            onTap: () {
              setState(() {
                _reviewOnly = !_reviewOnly;
                if (_selectedCount > _availableCount) {
                  for (final c in _countOptions.reversed) {
                    if (c <= _availableCount) {
                      _selectedCount = c;
                      break;
                    }
                  }
                }
              });
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 48,
              height: 28,
              decoration: BoxDecoration(
                color: _reviewOnly ? AppColors.primary : AppColors.border,
                borderRadius: BorderRadius.circular(14),
              ),
              child: AnimatedAlign(
                duration: const Duration(milliseconds: 200),
                alignment: _reviewOnly
                    ? Alignment.centerRight
                    : Alignment.centerLeft,
                child: Container(
                  width: 24,
                  height: 24,
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: const BoxDecoration(
                    color: AppColors.surface,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCountSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('문제 수', style: AppTypography.bodyMedium14),
        const SizedBox(height: 8),
        Row(
          children: _countOptions.map((n) {
            final isActive = _selectedCount == n;
            final isDisabled = n > _availableCount;
            return Expanded(
              child: Padding(
                padding: EdgeInsets.only(
                  right: n == _countOptions.last ? 0 : 8,
                ),
                child: GestureDetector(
                  onTap: isDisabled
                      ? null
                      : () => setState(() => _selectedCount = n),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: isActive
                          ? AppColors.primary
                          : isDisabled
                          ? AppColors.inputBg
                          : AppColors.inputBg,
                      borderRadius: AppSpacing.borderRadiusFull,
                    ),
                    child: Opacity(
                      opacity: isDisabled ? 0.3 : 1.0,
                      child: Text(
                        '$n문제',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: isActive
                              ? AppColors.surface
                              : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildModeGrid() {
    final modes = widget.isSentenceMode ? _sentenceModes : _wordModes;
    return GridView.count(
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: modes.map((mode) => _buildModeCard(mode)).toList(),
    );
  }

  Widget _buildModeCard(_ModeItem mode) {
    final isDisabled = _availableCount == 0;
    return GestureDetector(
      onTap: isDisabled
          ? null
          : () {
              final count = _selectedCount > _availableCount
                  ? _availableCount
                  : _selectedCount;
              widget.onModeSelected(mode.mode, count, _reviewOnly);
            },
      child: AnimatedScale(
        scale: 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          decoration: BoxDecoration(
            color: isDisabled ? AppColors.inputBg : AppColors.primaryTint,
            borderRadius: AppSpacing.borderRadiusXxl,
            border: Border.all(color: Colors.transparent, width: 2),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: isDisabled ? AppColors.border : AppColors.primaryLight,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  mode.icon,
                  size: 20,
                  color: isDisabled
                      ? AppColors.textSecondary
                      : AppColors.primary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                mode.label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: isDisabled
                      ? AppColors.textTertiary
                      : AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                mode.description,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w400,
                  color: isDisabled
                      ? AppColors.textTertiary
                      : AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ModeItem {
  final QuizMode mode;
  final IconData icon;
  final String label;
  final String description;

  const _ModeItem({
    required this.mode,
    required this.icon,
    required this.label,
    required this.description,
  });
}

const _wordModes = [
  _ModeItem(
    mode: QuizMode.flashcard,
    icon: Icons.flip_rounded,
    label: '플래시카드',
    description: '카드를 넘기며 복습',
  ),
  _ModeItem(
    mode: QuizMode.multipleChoice,
    icon: Icons.grid_view_rounded,
    label: '4지선다',
    description: '보기 중 정답 선택',
  ),
  _ModeItem(
    mode: QuizMode.spelling,
    icon: Icons.edit_rounded,
    label: '철자',
    description: '뜻 보고 영단어 입력',
  ),
  _ModeItem(
    mode: QuizMode.listening,
    icon: Icons.headphones_rounded,
    label: '듣기',
    description: '발음 듣고 뜻 맞추기',
  ),
];

const _sentenceModes = [
  _ModeItem(
    mode: QuizMode.flashcard,
    icon: Icons.flip_rounded,
    label: '플래시카드',
    description: '문장을 넘기며 복습',
  ),
  _ModeItem(
    mode: QuizMode.gapFill,
    icon: Icons.text_fields_rounded,
    label: '빈칸 채우기',
    description: '핵심 단어 빈칸 넣기',
  ),
  _ModeItem(
    mode: QuizMode.translation,
    icon: Icons.translate_rounded,
    label: '번역',
    description: '한국어 보고 영작',
  ),
];
