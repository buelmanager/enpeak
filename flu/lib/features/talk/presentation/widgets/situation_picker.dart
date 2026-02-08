import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/core/widgets/tap_scale.dart';

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

class SituationData {
  final String id;
  final String categoryId;
  final String label;
  final String labelEn;
  final String aiRole;
  final String userRole;
  final String setting;
  final String difficulty;

  const SituationData({
    required this.id,
    required this.categoryId,
    required this.label,
    required this.labelEn,
    required this.aiRole,
    required this.userRole,
    required this.setting,
    required this.difficulty,
  });
}

class _SituationCategory {
  final String id;
  final String label;
  final IconData icon;

  const _SituationCategory({
    required this.id,
    required this.label,
    required this.icon,
  });
}

// ---------------------------------------------------------------------------
// Static data (ported from frontend/src/data/situationPresets.ts)
// ---------------------------------------------------------------------------

const List<_SituationCategory> _categories = [
  _SituationCategory(id: 'food', label: '음식/카페', icon: Icons.coffee_rounded),
  _SituationCategory(
    id: 'shopping',
    label: '쇼핑',
    icon: Icons.shopping_bag_rounded,
  ),
  _SituationCategory(id: 'travel', label: '여행', icon: Icons.flight_rounded),
  _SituationCategory(id: 'daily', label: '일상', icon: Icons.home_rounded),
  _SituationCategory(
    id: 'work',
    label: '직장',
    icon: Icons.business_center_rounded,
  ),
  _SituationCategory(id: 'social', label: '사교', icon: Icons.people_rounded),
  _SituationCategory(id: 'health', label: '건강', icon: Icons.favorite_rounded),
  _SituationCategory(
    id: 'services',
    label: '생활서비스',
    icon: Icons.apartment_rounded,
  ),
];

const List<SituationData> _presets = [
  // food
  SituationData(
    id: 'cafe-order',
    categoryId: 'food',
    label: '카페 주문',
    labelEn: 'Ordering at a Cafe',
    aiRole: 'Barista',
    userRole: 'Customer',
    setting: 'a cozy coffee shop',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'restaurant-order',
    categoryId: 'food',
    label: '음식 주문',
    labelEn: 'Ordering Food at a Restaurant',
    aiRole: 'Waiter',
    userRole: 'Customer',
    setting: 'a casual restaurant',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'restaurant-reservation',
    categoryId: 'food',
    label: '레스토랑 예약',
    labelEn: 'Making a Restaurant Reservation',
    aiRole: 'Host',
    userRole: 'Customer',
    setting: 'calling a restaurant to make a reservation',
    difficulty: 'intermediate',
  ),
  SituationData(
    id: 'food-recommendation',
    categoryId: 'food',
    label: '음식 추천 요청',
    labelEn: 'Asking for Food Recommendations',
    aiRole: 'Local Friend',
    userRole: 'Visitor',
    setting: 'asking a local friend for restaurant recommendations',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'takeout-delivery',
    categoryId: 'food',
    label: '포장/배달 주문',
    labelEn: 'Ordering Takeout or Delivery',
    aiRole: 'Staff',
    userRole: 'Customer',
    setting: 'ordering food for takeout or delivery',
    difficulty: 'intermediate',
  ),

  // shopping
  SituationData(
    id: 'clothing-store',
    categoryId: 'shopping',
    label: '옷 가게',
    labelEn: 'Shopping for Clothes',
    aiRole: 'Sales Associate',
    userRole: 'Shopper',
    setting: 'a clothing store',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'electronics-store',
    categoryId: 'shopping',
    label: '전자제품 매장',
    labelEn: 'Buying Electronics',
    aiRole: 'Sales Associate',
    userRole: 'Customer',
    setting: 'an electronics store',
    difficulty: 'intermediate',
  ),
  SituationData(
    id: 'return-exchange',
    categoryId: 'shopping',
    label: '환불/교환',
    labelEn: 'Returning or Exchanging an Item',
    aiRole: 'Customer Service Rep',
    userRole: 'Customer',
    setting: 'the return counter at a store',
    difficulty: 'intermediate',
  ),
  SituationData(
    id: 'gift-shopping',
    categoryId: 'shopping',
    label: '선물 고르기',
    labelEn: 'Shopping for a Gift',
    aiRole: 'Sales Associate',
    userRole: 'Shopper',
    setting: 'a gift shop',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'size-inquiry',
    categoryId: 'shopping',
    label: '사이즈 문의',
    labelEn: 'Asking About Sizes and Fit',
    aiRole: 'Sales Associate',
    userRole: 'Shopper',
    setting: 'a shoe or clothing store',
    difficulty: 'beginner',
  ),

  // travel
  SituationData(
    id: 'hotel-checkin',
    categoryId: 'travel',
    label: '호텔 체크인',
    labelEn: 'Checking Into a Hotel',
    aiRole: 'Front Desk Agent',
    userRole: 'Guest',
    setting: 'a hotel lobby',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'airport',
    categoryId: 'travel',
    label: '공항 수속',
    labelEn: 'At the Airport',
    aiRole: 'Check-in Agent',
    userRole: 'Traveler',
    setting: 'an airport check-in counter',
    difficulty: 'intermediate',
  ),
  SituationData(
    id: 'taxi',
    categoryId: 'travel',
    label: '택시 탑승',
    labelEn: 'Taking a Taxi',
    aiRole: 'Taxi Driver',
    userRole: 'Passenger',
    setting: 'inside a taxi',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'immigration',
    categoryId: 'travel',
    label: '입국 심사',
    labelEn: 'Going Through Immigration',
    aiRole: 'Immigration Officer',
    userRole: 'Traveler',
    setting: 'an immigration checkpoint at an airport',
    difficulty: 'intermediate',
  ),
  SituationData(
    id: 'tourist-info',
    categoryId: 'travel',
    label: '관광 정보',
    labelEn: 'Asking for Tourist Information',
    aiRole: 'Information Desk Staff',
    userRole: 'Tourist',
    setting: 'a tourist information center',
    difficulty: 'beginner',
  ),

  // daily
  SituationData(
    id: 'neighbor-chat',
    categoryId: 'daily',
    label: '이웃 대화',
    labelEn: 'Chatting with a Neighbor',
    aiRole: 'Neighbor',
    userRole: 'Resident',
    setting: 'running into a neighbor in the hallway',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'weather-talk',
    categoryId: 'daily',
    label: '날씨 이야기',
    labelEn: 'Talking About the Weather',
    aiRole: 'Coworker',
    userRole: 'Coworker',
    setting: 'a casual chat about the weather',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'weekend-plans',
    categoryId: 'daily',
    label: '주말 계획',
    labelEn: 'Discussing Weekend Plans',
    aiRole: 'Friend',
    userRole: 'Friend',
    setting: 'chatting about weekend plans over coffee',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'asking-directions',
    categoryId: 'daily',
    label: '길 물어보기',
    labelEn: 'Asking for Directions',
    aiRole: 'Passerby',
    userRole: 'Traveler',
    setting: 'a street corner in an unfamiliar area',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'package-delivery',
    categoryId: 'daily',
    label: '택배 수령',
    labelEn: 'Receiving a Package',
    aiRole: 'Delivery Person',
    userRole: 'Resident',
    setting: 'receiving a package at the front door',
    difficulty: 'beginner',
  ),

  // work
  SituationData(
    id: 'self-introduction',
    categoryId: 'work',
    label: '자기소개',
    labelEn: 'Introducing Yourself at Work',
    aiRole: 'New Colleague',
    userRole: 'Employee',
    setting: 'the first day at a new job',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'job-interview',
    categoryId: 'work',
    label: '영어 면접',
    labelEn: 'Job Interview in English',
    aiRole: 'Interviewer',
    userRole: 'Candidate',
    setting: 'a job interview room',
    difficulty: 'advanced',
  ),
  SituationData(
    id: 'meeting',
    categoryId: 'work',
    label: '회의 참여',
    labelEn: 'Participating in a Meeting',
    aiRole: 'Team Lead',
    userRole: 'Team Member',
    setting: 'a team meeting',
    difficulty: 'intermediate',
  ),
  SituationData(
    id: 'colleague-chat',
    categoryId: 'work',
    label: '동료와 대화',
    labelEn: 'Chatting with a Colleague',
    aiRole: 'Colleague',
    userRole: 'Colleague',
    setting: 'the office break room',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'presentation',
    categoryId: 'work',
    label: '프레젠테이션',
    labelEn: 'Giving a Presentation',
    aiRole: 'Audience Member',
    userRole: 'Presenter',
    setting: 'a conference room during a presentation',
    difficulty: 'advanced',
  ),

  // social
  SituationData(
    id: 'making-friends',
    categoryId: 'social',
    label: '친구 사귀기',
    labelEn: 'Making New Friends',
    aiRole: 'New Acquaintance',
    userRole: 'Person',
    setting: 'a social gathering or party',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'catching-up',
    categoryId: 'social',
    label: '근황 나누기',
    labelEn: 'Catching Up with a Friend',
    aiRole: 'Old Friend',
    userRole: 'Friend',
    setting: 'meeting an old friend after a long time',
    difficulty: 'intermediate',
  ),
  SituationData(
    id: 'party-invite',
    categoryId: 'social',
    label: '파티 초대',
    labelEn: 'Inviting Someone to a Party',
    aiRole: 'Friend',
    userRole: 'Host',
    setting: 'inviting a friend to a house party',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'hobby-talk',
    categoryId: 'social',
    label: '취미 이야기',
    labelEn: 'Talking About Hobbies',
    aiRole: 'New Friend',
    userRole: 'Person',
    setting: 'a casual conversation about hobbies and interests',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'complimenting',
    categoryId: 'social',
    label: '칭찬하기',
    labelEn: 'Giving and Receiving Compliments',
    aiRole: 'Friend',
    userRole: 'Friend',
    setting: 'complimenting a friend on their achievement',
    difficulty: 'beginner',
  ),

  // health
  SituationData(
    id: 'describe-symptoms',
    categoryId: 'health',
    label: '증상 설명',
    labelEn: 'Describing Symptoms to a Doctor',
    aiRole: 'Doctor',
    userRole: 'Patient',
    setting: "a doctor's office",
    difficulty: 'intermediate',
  ),
  SituationData(
    id: 'pharmacy',
    categoryId: 'health',
    label: '약국 방문',
    labelEn: 'Visiting a Pharmacy',
    aiRole: 'Pharmacist',
    userRole: 'Customer',
    setting: 'a pharmacy counter',
    difficulty: 'intermediate',
  ),
  SituationData(
    id: 'hospital-appointment',
    categoryId: 'health',
    label: '병원 예약',
    labelEn: 'Making a Hospital Appointment',
    aiRole: 'Receptionist',
    userRole: 'Patient',
    setting: 'calling a hospital to book an appointment',
    difficulty: 'intermediate',
  ),
  SituationData(
    id: 'dentist',
    categoryId: 'health',
    label: '치과 방문',
    labelEn: 'Visiting the Dentist',
    aiRole: 'Dentist',
    userRole: 'Patient',
    setting: "a dentist's office",
    difficulty: 'intermediate',
  ),
  SituationData(
    id: 'emergency',
    categoryId: 'health',
    label: '응급 상황',
    labelEn: 'Emergency Situation',
    aiRole: '911 Operator',
    userRole: 'Caller',
    setting: 'calling emergency services',
    difficulty: 'advanced',
  ),

  // services
  SituationData(
    id: 'bank',
    categoryId: 'services',
    label: '은행 업무',
    labelEn: 'Banking',
    aiRole: 'Bank Teller',
    userRole: 'Customer',
    setting: 'a bank counter',
    difficulty: 'intermediate',
  ),
  SituationData(
    id: 'hair-salon',
    categoryId: 'services',
    label: '미용실',
    labelEn: 'At the Hair Salon',
    aiRole: 'Hairstylist',
    userRole: 'Customer',
    setting: 'a hair salon',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'post-office',
    categoryId: 'services',
    label: '우체국',
    labelEn: 'At the Post Office',
    aiRole: 'Postal Clerk',
    userRole: 'Customer',
    setting: 'a post office counter',
    difficulty: 'intermediate',
  ),
  SituationData(
    id: 'library',
    categoryId: 'services',
    label: '도서관',
    labelEn: 'At the Library',
    aiRole: 'Librarian',
    userRole: 'Visitor',
    setting: 'a public library',
    difficulty: 'beginner',
  ),
  SituationData(
    id: 'customer-service',
    categoryId: 'services',
    label: '고객센터',
    labelEn: 'Calling Customer Service',
    aiRole: 'Customer Service Agent',
    userRole: 'Customer',
    setting: 'a phone call with customer service',
    difficulty: 'advanced',
  ),
];

// ---------------------------------------------------------------------------
// Difficulty helpers
// ---------------------------------------------------------------------------

const Map<String, String> _difficultyLabels = {
  'all': '전체',
  'beginner': '초급',
  'intermediate': '중급',
  'advanced': '고급',
};

Color _difficultyBgColor(String difficulty) {
  switch (difficulty) {
    case 'beginner':
      return AppColors.difficultyBeginnerBg;
    case 'intermediate':
      return AppColors.difficultyIntermediateBg;
    case 'advanced':
      return AppColors.difficultyAdvancedBg;
    default:
      return AppColors.border;
  }
}

Color _difficultyTextColor(String difficulty) {
  switch (difficulty) {
    case 'beginner':
      return AppColors.difficultyBeginnerText;
    case 'intermediate':
      return AppColors.difficultyIntermediateText;
    case 'advanced':
      return AppColors.difficultyAdvancedText;
    default:
      return AppColors.textSecondary;
  }
}

// ---------------------------------------------------------------------------
// Widget
// ---------------------------------------------------------------------------

class SituationPicker extends StatefulWidget {
  const SituationPicker({
    super.key,
    required this.onSituationSelected,
    this.onCustomInput,
    this.onClose,
  });

  final ValueChanged<SituationData> onSituationSelected;
  final VoidCallback? onCustomInput;
  final VoidCallback? onClose;

  @override
  State<SituationPicker> createState() => _SituationPickerState();
}

class _SituationPickerState extends State<SituationPicker> {
  String? _selectedCategoryId;
  String _difficultyFilter = 'all';

  List<SituationData> get _filteredPresets {
    if (_selectedCategoryId == null) return [];
    return _presets.where((p) {
      if (p.categoryId != _selectedCategoryId) return false;
      if (_difficultyFilter != 'all' && p.difficulty != _difficultyFilter) {
        return false;
      }
      return true;
    }).toList();
  }

  void _goBack() {
    setState(() {
      _selectedCategoryId = null;
      _difficultyFilter = 'all';
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 250),
      switchInCurve: Curves.easeOut,
      switchOutCurve: Curves.easeIn,
      transitionBuilder: (child, animation) {
        final isStep2 = child.key == const ValueKey('step2');
        final offset = isStep2 ? const Offset(1, 0) : const Offset(-1, 0);
        return SlideTransition(
          position: Tween<Offset>(
            begin: offset,
            end: Offset.zero,
          ).animate(animation),
          child: child,
        );
      },
      child: _selectedCategoryId == null
          ? _CategoryGrid(
              key: const ValueKey('step1'),
              onCategorySelected: (id) =>
                  setState(() => _selectedCategoryId = id),
              onCustomInput: widget.onCustomInput,
              onClose: widget.onClose,
            )
          : _SituationList(
              key: const ValueKey('step2'),
              category: _categories.firstWhere(
                (c) => c.id == _selectedCategoryId,
              ),
              filteredPresets: _filteredPresets,
              difficultyFilter: _difficultyFilter,
              onDifficultyChanged: (d) => setState(() => _difficultyFilter = d),
              onBack: _goBack,
              onSelect: widget.onSituationSelected,
              onCustomInput: widget.onCustomInput,
            ),
    );
  }
}

// ---------------------------------------------------------------------------
// Step 1 - Category grid
// ---------------------------------------------------------------------------

class _CategoryGrid extends StatelessWidget {
  const _CategoryGrid({
    super.key,
    required this.onCategorySelected,
    this.onCustomInput,
    this.onClose,
  });

  final ValueChanged<String> onCategorySelected;
  final VoidCallback? onCustomInput;
  final VoidCallback? onClose;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        children: [
          // Close button row
          if (onClose != null)
            Align(
              alignment: Alignment.centerRight,
              child: GestureDetector(
                onTap: onClose,
                child: const Padding(
                  padding: EdgeInsets.all(6),
                  child: Icon(
                    Icons.close_rounded,
                    size: 20,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ),

          const SizedBox(height: 4),

          // Title
          Text(
            '어떤 상황을 연습할까요?',
            style: AppTypography.heading3.copyWith(fontWeight: FontWeight.w300),
          ),
          const SizedBox(height: 4),
          Text('카테고리를 선택하세요', style: AppTypography.bodySmall),

          const SizedBox(height: 20),

          // 2-column grid
          Expanded(
            child: GridView.builder(
              padding: EdgeInsets.zero,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 2.6,
              ),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                return _CategoryCard(
                  category: cat,
                  onTap: () => onCategorySelected(cat.id),
                );
              },
            ),
          ),

          // Custom input link
          if (onCustomInput != null) ...[
            const SizedBox(height: 12),
            GestureDetector(
              onTap: onCustomInput,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Text(
                  '직접 입력하기',
                  style: AppTypography.bodySmall.copyWith(
                    decoration: TextDecoration.underline,
                    decorationColor: AppColors.textSecondary,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
          ],
        ],
      ),
    );
  }
}

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({required this.category, required this.onTap});

  final _SituationCategory category;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return TapScale(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
          border: Border.all(color: AppColors.border),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0A000000),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(category.icon, size: 20, color: AppColors.primary),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                category.label,
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textPrimary,
                  fontSize: 14,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Step 2 - Situation list
// ---------------------------------------------------------------------------

class _SituationList extends StatelessWidget {
  const _SituationList({
    super.key,
    required this.category,
    required this.filteredPresets,
    required this.difficultyFilter,
    required this.onDifficultyChanged,
    required this.onBack,
    required this.onSelect,
    this.onCustomInput,
  });

  final _SituationCategory category;
  final List<SituationData> filteredPresets;
  final String difficultyFilter;
  final ValueChanged<String> onDifficultyChanged;
  final VoidCallback onBack;
  final ValueChanged<SituationData> onSelect;
  final VoidCallback? onCustomInput;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with back button
          Row(
            children: [
              GestureDetector(
                onTap: onBack,
                child: const Padding(
                  padding: EdgeInsets.all(6),
                  child: Icon(
                    Icons.chevron_left_rounded,
                    size: 20,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
              const SizedBox(width: 4),
              Icon(category.icon, size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                category.label,
                style: AppTypography.bodyMedium.copyWith(fontSize: 16),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Difficulty filter chips
          SizedBox(
            height: 32,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _difficultyLabels.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final key = _difficultyLabels.keys.elementAt(index);
                final label = _difficultyLabels[key]!;
                final isActive = difficultyFilter == key;

                return GestureDetector(
                  onTap: () => onDifficultyChanged(key),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: isActive ? AppColors.primary : AppColors.surface,
                      borderRadius: BorderRadius.circular(
                        AppSpacing.radiusFull,
                      ),
                      border: Border.all(
                        color: isActive ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    child: Text(
                      label,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: isActive
                            ? Colors.white
                            : AppColors.textSecondary,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 12),

          // Situation cards
          Expanded(
            child: filteredPresets.isEmpty
                ? Center(
                    child: Text(
                      '해당 난이도의 상황이 없습니다',
                      style: AppTypography.bodySmall,
                    ),
                  )
                : ListView.separated(
                    itemCount:
                        filteredPresets.length +
                        (onCustomInput != null ? 1 : 0),
                    separatorBuilder: (_, _) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      // Custom input card at the bottom
                      if (index == filteredPresets.length) {
                        return _CustomInputCard(onTap: onCustomInput!);
                      }
                      final preset = filteredPresets[index];
                      return _SituationCard(
                        preset: preset,
                        onTap: () => onSelect(preset),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Situation card
// ---------------------------------------------------------------------------

class _SituationCard extends StatelessWidget {
  const _SituationCard({required this.preset, required this.onTap});

  final SituationData preset;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return TapScale(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
          border: Border.all(color: AppColors.border),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0A000000),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title row with difficulty badge
            Row(
              children: [
                Expanded(
                  child: Text(preset.label, style: AppTypography.bodyMedium14),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: _difficultyBgColor(preset.difficulty),
                    borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
                  ),
                  child: Text(
                    _difficultyLabels[preset.difficulty] ?? '',
                    style: AppTypography.badge.copyWith(
                      color: _difficultyTextColor(preset.difficulty),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),

            // English label
            Text(
              preset.labelEn,
              style: AppTypography.caption.copyWith(fontSize: 12),
            ),

            const SizedBox(height: 4),

            // Roles
            Text(
              '${preset.aiRole} / ${preset.userRole}',
              style: AppTypography.caption.copyWith(
                fontSize: 12,
                color: const Color(0xFFB0B0B0),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Custom input card (dashed border)
// ---------------------------------------------------------------------------

class _CustomInputCard extends StatelessWidget {
  const _CustomInputCard({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return TapScale(
      onTap: onTap,
      child: CustomPaint(
        painter: _DashedBorderPainter(
          color: AppColors.primary.withValues(alpha: 0.4),
          borderRadius: AppSpacing.radiusXl,
          dashWidth: 6,
          dashGap: 4,
          strokeWidth: 1.5,
        ),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.edit_rounded, size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                '직접 입력하기',
                style: AppTypography.bodyMedium14.copyWith(
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Dashed border painter
// ---------------------------------------------------------------------------

class _DashedBorderPainter extends CustomPainter {
  _DashedBorderPainter({
    required this.color,
    required this.borderRadius,
    this.dashWidth = 6,
    this.dashGap = 4,
    this.strokeWidth = 1.5,
  });

  final Color color;
  final double borderRadius;
  final double dashWidth;
  final double dashGap;
  final double strokeWidth;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    final rrect = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, size.width, size.height),
      Radius.circular(borderRadius),
    );

    final path = Path()..addRRect(rrect);
    final metrics = path.computeMetrics();

    for (final metric in metrics) {
      double distance = 0;
      while (distance < metric.length) {
        final segmentLength =
            (distance + dashWidth).clamp(0, metric.length) - distance;
        final extracted = metric.extractPath(
          distance,
          distance + segmentLength,
        );
        canvas.drawPath(extracted, paint);
        distance += dashWidth + dashGap;
      }
    }
  }

  @override
  bool shouldRepaint(covariant _DashedBorderPainter oldDelegate) {
    return color != oldDelegate.color ||
        borderRadius != oldDelegate.borderRadius ||
        dashWidth != oldDelegate.dashWidth ||
        dashGap != oldDelegate.dashGap ||
        strokeWidth != oldDelegate.strokeWidth;
  }
}
