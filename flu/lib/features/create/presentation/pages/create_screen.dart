import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/features/create/presentation/providers/create_provider.dart';

const List<Map<String, String>> _placeSuggestions = [
  {'label': '카페', 'value': 'cafe'},
  {'label': '레스토랑', 'value': 'restaurant'},
  {'label': '공항', 'value': 'airport'},
  {'label': '호텔', 'value': 'hotel'},
  {'label': '병원', 'value': 'hospital'},
  {'label': '은행', 'value': 'bank'},
  {'label': '쇼핑몰', 'value': 'shopping'},
  {'label': '회사', 'value': 'business'},
  {'label': '택시', 'value': 'taxi'},
  {'label': '도서관', 'value': 'library'},
];

const List<Map<String, String>> _situationSuggestions = [
  {'label': '주문하기', 'value': 'ordering'},
  {'label': '길 묻기', 'value': 'asking_directions'},
  {'label': '예약하기', 'value': 'reservation'},
  {'label': '자기소개', 'value': 'introduction'},
  {'label': '가격 협상', 'value': 'negotiation'},
  {'label': '도움 요청', 'value': 'asking_help'},
  {'label': '면접', 'value': 'interview'},
  {'label': '전화 통화', 'value': 'phone_call'},
];

final List<Map<String, dynamic>> _difficultyOptions = [
  {
    'key': 'beginner',
    'label': 'Beginner',
    'bgColor': AppColors.difficultyBeginnerBg,
    'textColor': AppColors.difficultyBeginnerText,
  },
  {
    'key': 'intermediate',
    'label': 'Intermediate',
    'bgColor': AppColors.difficultyIntermediateBg,
    'textColor': AppColors.difficultyIntermediateText,
  },
  {
    'key': 'advanced',
    'label': 'Advanced',
    'bgColor': AppColors.difficultyAdvancedBg,
    'textColor': AppColors.difficultyAdvancedText,
  },
];

class _ChatMessage {
  final String role;
  final String content;
  const _ChatMessage({required this.role, required this.content});
}

class CreateScreen extends ConsumerStatefulWidget {
  const CreateScreen({super.key});

  @override
  ConsumerState<CreateScreen> createState() => _CreateScreenState();
}

class _CreateScreenState extends ConsumerState<CreateScreen> {
  final _pageController = PageController();
  final _placeController = TextEditingController();
  final _situationController = TextEditingController();
  final _additionalController = TextEditingController();
  final _chatController = TextEditingController();
  final _scenarioTitleController = TextEditingController();
  final _scrollController = ScrollController();

  int _currentStep = 0;
  final List<_ChatMessage> _messages = [];
  bool _chatLoading = false;

  @override
  void dispose() {
    _pageController.dispose();
    _placeController.dispose();
    _situationController.dispose();
    _additionalController.dispose();
    _chatController.dispose();
    _scenarioTitleController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _goToStep(int step) {
    if (step < 0 || step > 2) return;
    setState(() => _currentStep = step);
    _pageController.animateToPage(
      step,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  void _onContextSubmit() {
    final place = _placeController.text.trim();
    final situation = _situationController.text.trim();
    if (place.isEmpty || situation.isEmpty) return;

    ref.read(createProvider.notifier).setPlace(place);
    ref.read(createProvider.notifier).setSituation(situation);

    setState(() {
      _messages.clear();
      _messages.add(
        _ChatMessage(
          role: 'assistant',
          content:
              '"$place"에서 "$situation" 시나리오를 만들어볼게요! 더 구체적인 상황이 있다면 알려주세요.',
        ),
      );
    });

    _goToStep(1);
  }

  void _onSendChat() {
    final text = _chatController.text.trim();
    if (text.isEmpty || _chatLoading) return;

    setState(() {
      _messages.add(_ChatMessage(role: 'user', content: text));
      _chatLoading = true;
    });
    _chatController.clear();

    Future.delayed(const Duration(milliseconds: 600), () {
      _scrollToBottom();
    });

    // Simulate AI response
    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted) return;
      setState(() {
        _messages.add(
          const _ChatMessage(
            role: 'assistant',
            content:
                '네, 알겠어요! 그 내용으로 시나리오에 반영할게요. 더 추가하고 싶은 내용이 있으면 말씀해주세요. 완성되면 "시나리오 완성하기" 버튼을 눌러주세요!',
          ),
        );
        _chatLoading = false;
      });
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollToBottom();
      });
    });
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(createProvider);

    ref.listen<CreateState>(createProvider, (prev, next) {
      if (next.submitSuccess && !(prev?.submitSuccess ?? false)) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('시나리오가 공유되었습니다!'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
        ref.read(createProvider.notifier).reset();
        Navigator.pop(context);
      }

      if (next.error != null && next.error != prev?.error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          onPressed: () {
            if (_currentStep > 0) {
              _goToStep(_currentStep - 1);
            } else {
              Navigator.pop(context);
            }
          },
          icon: const Icon(
            Icons.arrow_back_rounded,
            color: AppColors.textPrimary,
            size: 22,
          ),
        ),
        title: Text(
          '시나리오 만들기',
          style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w500),
        ),
        centerTitle: true,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Text(
                '${_currentStep + 1}/3',
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: List.generate(3, (index) {
                return Expanded(
                  child: Container(
                    height: 3,
                    margin: EdgeInsets.only(right: index < 2 ? 8 : 0),
                    decoration: BoxDecoration(
                      color: index <= _currentStep
                          ? AppColors.primary
                          : AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
      body: PageView(
        controller: _pageController,
        physics: const NeverScrollableScrollPhysics(),
        onPageChanged: (index) => setState(() => _currentStep = index),
        children: [
          _buildStep1Context(),
          _buildStep2Chat(),
          _buildStep3Review(state),
        ],
      ),
    );
  }

  // ── Step 1: Context Setup ──

  Widget _buildStep1Context() {
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
            children: [
              Text(
                '어떤 상황을 만들어볼까요?',
                style: AppTypography.heading3.copyWith(
                  fontSize: 20,
                  fontWeight: FontWeight.w300,
                ),
              ),
              const SizedBox(height: 8),
              Text('장소와 상황을 선택하거나 직접 입력해주세요', style: AppTypography.bodySmall),
              const SizedBox(height: 28),

              // Place section
              _buildSectionLabel('장소'),
              const SizedBox(height: 12),
              _buildChipSelector(
                suggestions: _placeSuggestions,
                currentValue: _placeController.text,
                onSelect: (label) {
                  setState(() => _placeController.text = label);
                  ref.read(createProvider.notifier).setPlace(label);
                },
              ),
              const SizedBox(height: 12),
              _buildInputField(
                controller: _placeController,
                hint: '또는 직접 입력...',
                onChanged: (v) => ref.read(createProvider.notifier).setPlace(v),
              ),
              const SizedBox(height: 24),

              // Situation section
              _buildSectionLabel('상황'),
              const SizedBox(height: 12),
              _buildChipSelector(
                suggestions: _situationSuggestions,
                currentValue: _situationController.text,
                onSelect: (label) {
                  setState(() => _situationController.text = label);
                  ref.read(createProvider.notifier).setSituation(label);
                },
              ),
              const SizedBox(height: 12),
              _buildInputField(
                controller: _situationController,
                hint: '또는 직접 입력...',
                onChanged: (v) =>
                    ref.read(createProvider.notifier).setSituation(v),
              ),
              const SizedBox(height: 24),

              // Difficulty section
              _buildSectionLabel('난이도'),
              const SizedBox(height: 12),
              _buildDifficultySelector(ref.watch(createProvider).difficulty),
              const SizedBox(height: 24),

              // Additional info
              _buildSectionLabel('추가 설명 (선택)'),
              const SizedBox(height: 12),
              _buildInputField(
                controller: _additionalController,
                hint: '예: 알레르기가 있어서 특별 요청을 해야 하는 상황...',
                maxLines: 3,
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
        _buildBottomButton(
          label: 'AI와 시나리오 만들기',
          onPressed:
              (_placeController.text.trim().isNotEmpty &&
                  _situationController.text.trim().isNotEmpty)
              ? _onContextSubmit
              : null,
        ),
      ],
    );
  }

  // ── Step 2: Chat ──

  Widget _buildStep2Chat() {
    return Column(
      children: [
        // Context summary bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
          decoration: const BoxDecoration(
            color: AppColors.surface,
            border: Border(bottom: BorderSide(color: AppColors.borderLight)),
          ),
          child: Row(
            children: [
              if (_placeController.text.isNotEmpty)
                _buildContextChip(_placeController.text),
              if (_situationController.text.isNotEmpty) ...[
                const SizedBox(width: 8),
                _buildContextChip(_situationController.text),
              ],
            ],
          ),
        ),

        // Messages
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 16),
            itemCount: _messages.length + (_chatLoading ? 1 : 0),
            itemBuilder: (context, index) {
              if (index == _messages.length && _chatLoading) {
                return _buildTypingIndicator();
              }
              final msg = _messages[index];
              return _buildChatBubble(msg);
            },
          ),
        ),

        // Input area
        Container(
          padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
          decoration: const BoxDecoration(
            color: AppColors.background,
            border: Border(top: BorderSide(color: AppColors.borderLight)),
          ),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _chatController,
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textPrimary,
                        ),
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _onSendChat(),
                        enabled: !_chatLoading,
                        decoration: InputDecoration(
                          hintText: '시나리오에 대해 더 설명해주세요...',
                          hintStyle: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary.withValues(
                              alpha: 0.6,
                            ),
                          ),
                          filled: true,
                          fillColor: AppColors.surface,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(
                              AppSpacing.radiusFull,
                            ),
                            borderSide: const BorderSide(
                              color: AppColors.border,
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(
                              AppSpacing.radiusFull,
                            ),
                            borderSide: const BorderSide(
                              color: AppColors.border,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(
                              AppSpacing.radiusFull,
                            ),
                            borderSide: const BorderSide(
                              color: AppColors.primary,
                            ),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 12,
                          ),
                          isDense: true,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    SizedBox(
                      width: 48,
                      height: 48,
                      child: IconButton(
                        onPressed: _chatLoading ? null : _onSendChat,
                        style: IconButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          disabledBackgroundColor: AppColors.primary.withValues(
                            alpha: 0.3,
                          ),
                          shape: const CircleBorder(),
                        ),
                        icon: const Icon(
                          Icons.arrow_upward_rounded,
                          color: AppColors.surface,
                          size: 22,
                        ),
                      ),
                    ),
                  ],
                ),
                if (_messages.length >= 2) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: OutlinedButton(
                      onPressed: () => _goToStep(2),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.primary),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(
                            AppSpacing.radiusXl,
                          ),
                        ),
                      ),
                      child: Text(
                        '시나리오 완성하기',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 8),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ── Step 3: Review ──

  Widget _buildStep3Review(CreateState state) {
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
            children: [
              Text(
                '시나리오 완성!',
                style: AppTypography.heading3.copyWith(
                  fontSize: 20,
                  fontWeight: FontWeight.w300,
                ),
              ),
              const SizedBox(height: 8),
              Text('제목을 입력하고 커뮤니티에 공유해보세요', style: AppTypography.bodySmall),
              const SizedBox(height: 24),

              // Title input
              _buildSectionLabel('시나리오 제목'),
              const SizedBox(height: 12),
              _buildInputField(
                controller: _scenarioTitleController,
                hint: '${_placeController.text}에서 ${_situationController.text}',
                onChanged: (v) => ref.read(createProvider.notifier).setTitle(v),
              ),
              const SizedBox(height: 24),

              // Preview card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _scenarioTitleController.text.isNotEmpty
                          ? _scenarioTitleController.text
                          : '${_placeController.text}에서 ${_situationController.text}',
                      style: AppTypography.bodyMedium,
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        if (_placeController.text.isNotEmpty)
                          _buildPreviewBadge(_placeController.text),
                        if (_situationController.text.isNotEmpty)
                          _buildPreviewBadge(_situationController.text),
                        _buildDifficultyBadge(state.difficulty),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildStageItem(
                      1,
                      'Start',
                      'Hello! How can I help you today?',
                    ),
                    const SizedBox(height: 12),
                    _buildStageItem(
                      2,
                      'Main',
                      'I see, let me help you with that.',
                    ),
                    const SizedBox(height: 12),
                    _buildStageItem(
                      3,
                      'End',
                      'Is there anything else I can help with?',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),

        // Bottom action bar
        Container(
          padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
          decoration: const BoxDecoration(
            color: AppColors.background,
            border: Border(top: BorderSide(color: AppColors.borderLight)),
          ),
          child: SafeArea(
            top: false,
            child: Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 52,
                    child: OutlinedButton(
                      onPressed: () => _goToStep(1),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.border),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(
                            AppSpacing.radiusXl,
                          ),
                        ),
                      ),
                      child: Text(
                        '수정하기',
                        style: AppTypography.button.copyWith(
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: state.isSubmitting ? null : _onPublish,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: AppColors.surface,
                        disabledBackgroundColor: AppColors.primary.withValues(
                          alpha: 0.5,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(
                            AppSpacing.radiusXl,
                          ),
                        ),
                        elevation: 0,
                      ),
                      child: state.isSubmitting
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.surface,
                              ),
                            )
                          : Text(
                              '커뮤니티에 공유',
                              style: AppTypography.button.copyWith(
                                color: AppColors.surface,
                              ),
                            ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _onPublish() {
    final title = _scenarioTitleController.text.trim().isNotEmpty
        ? _scenarioTitleController.text.trim()
        : '${_placeController.text}에서 ${_situationController.text}';
    ref.read(createProvider.notifier).setTitle(title);
    ref.read(createProvider.notifier).submitScenario();
  }

  // ── Shared widgets ──

  Widget _buildSectionLabel(String text) {
    return Text(
      text,
      style: AppTypography.label.copyWith(fontWeight: FontWeight.w500),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String hint,
    int maxLines = 1,
    ValueChanged<String>? onChanged,
  }) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      onChanged: (v) {
        setState(() {});
        onChanged?.call(v);
      },
      style: AppTypography.bodySmall.copyWith(color: AppColors.textPrimary),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: AppTypography.bodySmall.copyWith(
          color: AppColors.textSecondary.withValues(alpha: 0.5),
        ),
        filled: true,
        fillColor: AppColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
          borderSide: const BorderSide(color: AppColors.primary),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
      ),
    );
  }

  Widget _buildChipSelector({
    required List<Map<String, String>> suggestions,
    required String currentValue,
    required void Function(String label) onSelect,
  }) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: suggestions.map((item) {
        final label = item['label']!;
        final isSelected = currentValue == label;
        return GestureDetector(
          onTap: () => onSelect(label),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.primary : AppColors.surface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
              border: Border.all(
                color: isSelected ? AppColors.primary : AppColors.border,
              ),
            ),
            child: Text(
              label,
              style: AppTypography.bodySmall.copyWith(
                color: isSelected ? AppColors.surface : AppColors.textPrimary,
                fontWeight: isSelected ? FontWeight.w500 : FontWeight.w400,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDifficultySelector(String selected) {
    return Row(
      children: _difficultyOptions.asMap().entries.map((entry) {
        final index = entry.key;
        final option = entry.value;
        final key = option['key'] as String;
        final label = option['label'] as String;
        final bgColor = option['bgColor'] as Color;
        final textColor = option['textColor'] as Color;
        final isSelected = selected == key;

        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(
              right: index < _difficultyOptions.length - 1 ? 8 : 0,
            ),
            child: GestureDetector(
              onTap: () => ref.read(createProvider.notifier).setDifficulty(key),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: isSelected ? bgColor : AppColors.surface,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
                  border: Border.all(
                    color: isSelected ? textColor : AppColors.border,
                  ),
                ),
                alignment: Alignment.center,
                child: Text(
                  label,
                  style: AppTypography.bodySmall.copyWith(
                    color: isSelected ? textColor : AppColors.textSecondary,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildBottomButton({required String label, VoidCallback? onPressed}) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
      child: SafeArea(
        top: false,
        child: SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton(
            onPressed: onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.surface,
              disabledBackgroundColor: AppColors.primary.withValues(alpha: 0.3),
              disabledForegroundColor: AppColors.surface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
              ),
              elevation: 0,
            ),
            child: Text(
              label,
              style: AppTypography.button.copyWith(color: AppColors.surface),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContextChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Text(
        label,
        style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
      ),
    );
  }

  Widget _buildChatBubble(_ChatMessage msg) {
    final isUser = msg.role == 'user';
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Align(
        alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.85,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: isUser ? AppColors.primary : AppColors.surface,
            borderRadius: BorderRadius.only(
              topLeft: const Radius.circular(16),
              topRight: const Radius.circular(16),
              bottomLeft: Radius.circular(isUser ? 16 : 4),
              bottomRight: Radius.circular(isUser ? 4 : 16),
            ),
            border: isUser ? null : Border.all(color: AppColors.border),
          ),
          child: Text(
            msg.content,
            style: AppTypography.bodySmall.copyWith(
              color: isUser ? AppColors.surface : AppColors.textPrimary,
              height: 1.5,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(3, (index) {
          return Container(
            width: 8,
            height: 8,
            margin: const EdgeInsets.only(right: 4),
            decoration: BoxDecoration(
              color: AppColors.textTertiary.withValues(alpha: 0.6),
              shape: BoxShape.circle,
            ),
          );
        }),
      ),
    );
  }

  Widget _buildPreviewBadge(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Text(
        label,
        style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
      ),
    );
  }

  Widget _buildDifficultyBadge(String difficulty) {
    final option = _difficultyOptions.firstWhere(
      (o) => o['key'] == difficulty,
      orElse: () => _difficultyOptions[0],
    );
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: option['bgColor'] as Color,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Text(
        option['label'] as String,
        style: AppTypography.caption.copyWith(
          color: option['textColor'] as Color,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildStageItem(int number, String name, String opening) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: const BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: Text(
            '$number',
            style: AppTypography.caption.copyWith(
              color: AppColors.surface,
              fontWeight: FontWeight.w600,
              fontSize: 11,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: AppTypography.bodySmall.copyWith(
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 2),
              Text(opening, style: AppTypography.caption),
            ],
          ),
        ),
      ],
    );
  }
}
