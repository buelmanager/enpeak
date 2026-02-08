import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_constants.dart';
import 'package:flu/features/my/presentation/providers/my_provider.dart';
import 'package:flu/features/my/presentation/widgets/voice_settings_sheet.dart';
import 'package:flu/features/login/presentation/providers/auth_provider.dart';

// Release notes data
const _releaseNotes = <String, List<String>>{
  'v1.0.0': [
    'AI 자유 회화 (Free Chat)',
    '표현 연습 (Expression Practice)',
    '롤플레이 시나리오 (6종)',
    'A1-C2 단어 카드 학습',
    'HD 음성 (Edge TTS) 지원',
    '주간 학습 통계',
    '커뮤니티 시나리오',
  ],
};

class MyScreen extends ConsumerStatefulWidget {
  const MyScreen({super.key});

  @override
  ConsumerState<MyScreen> createState() => _MyScreenState();
}

class _MyScreenState extends ConsumerState<MyScreen>
    with SingleTickerProviderStateMixin {
  bool _showReleaseNotes = false;
  bool _isUpdating = false;
  String? _updateResult;

  late final AnimationController _chevronController;
  late final Animation<double> _chevronRotation;

  @override
  void initState() {
    super.initState();
    _chevronController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _chevronRotation = Tween<double>(begin: 0, end: 0.5).animate(
      CurvedAnimation(parent: _chevronController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _chevronController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final myState = ref.watch(myProvider);
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(
            left: 16,
            right: 16,
            top: 16,
            bottom: 120,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.only(left: 4, bottom: 16),
                child: Text(
                  'My',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              _buildProfileSection(authState, myState),
              const SizedBox(height: 16),
              _buildSettingsSection(),
              const SizedBox(height: 16),
              _buildFeedbackSection(),
              const SizedBox(height: 16),
              _buildAppInfoSection(),
              if (authState.isAuthenticated) ...[
                const SizedBox(height: 16),
                _buildLogoutButton(myState),
              ],
            ],
          ),
        ),
      ),
    );
  }

  // -- Profile Section --

  Widget _buildProfileSection(AuthState authState, MyState myState) {
    if (myState.isLoading) {
      return _buildProfileShimmer();
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: authState.isAuthenticated
          ? _buildLoggedInProfile(authState)
          : _buildLoggedOutProfile(),
    );
  }

  Widget _buildLoggedInProfile(AuthState authState) {
    final user = authState.user;
    final name = user?.displayName ?? 'Guest';
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'G';

    return Row(
      children: [
        CircleAvatar(
          radius: 28,
          backgroundColor: AppColors.primary,
          child: Text(
            initial,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: AppColors.surface,
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
              if (user?.email != null) ...[
                const SizedBox(height: 2),
                Text(
                  user!.email!,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLoggedOutProfile() {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, '/login'),
      behavior: HitTestBehavior.opaque,
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: const Color(0xFFF5F5F5),
            child: Icon(
              Icons.person_outline_rounded,
              size: 28,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '로그인하기',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  '로그인하면 학습 데이터가 저장됩니다',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const Icon(
            Icons.chevron_right_rounded,
            color: AppColors.textSecondary,
          ),
        ],
      ),
    );
  }

  Widget _buildProfileShimmer() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: const BoxDecoration(
              color: AppColors.shimmerBase,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 120,
                height: 18,
                decoration: BoxDecoration(
                  color: AppColors.shimmerBase,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(height: 8),
              Container(
                width: 180,
                height: 14,
                decoration: BoxDecoration(
                  color: AppColors.shimmerBase,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // -- Settings Section --

  Widget _buildSettingsSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '설정',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 12),
          _buildSettingItem(
            icon: Icons.volume_up_rounded,
            title: '음성 설정',
            subtitle: 'HD 음성, 속도 설정',
            onTap: () => VoiceSettingsSheet.show(context),
          ),
          const Padding(
            padding: EdgeInsets.only(left: 56),
            child: Divider(height: 1, thickness: 1, color: AppColors.border),
          ),
          _buildSettingItem(
            icon: Icons.download_rounded,
            title: '앱 설치 / 홈에 추가',
            subtitle: '홈 화면에서 빠르게 접근',
            onTap: () {},
          ),
          const Padding(
            padding: EdgeInsets.only(left: 56),
            child: Divider(height: 1, thickness: 1, color: AppColors.border),
          ),
          _buildUpdateItem(),
        ],
      ),
    );
  }

  Widget _buildSettingItem({
    required IconData icon,
    required String title,
    required String subtitle,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: const BoxDecoration(
                color: Color(0xFFF5F5F5),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 20, color: AppColors.textPrimary),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            trailing ??
                const Icon(
                  Icons.chevron_right_rounded,
                  size: 20,
                  color: AppColors.textSecondary,
                ),
          ],
        ),
      ),
    );
  }

  Widget _buildUpdateItem() {
    String title;
    String subtitle;
    Widget? trailing;

    if (_isUpdating) {
      title = '업데이트 확인';
      subtitle = '확인 중...';
      trailing = const SizedBox(
        width: 20,
        height: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          color: AppColors.primary,
        ),
      );
    } else if (_updateResult == 'latest') {
      title = '최신 버전입니다';
      subtitle = 'v${AppConstants.appVersion}';
      trailing = const Icon(
        Icons.check_circle_rounded,
        size: 20,
        color: AppColors.success,
      );
    } else if (_updateResult == 'available') {
      title = '업데이트 적용하기';
      subtitle = '새 버전이 있습니다';
      trailing = const Icon(
        Icons.chevron_right_rounded,
        size: 20,
        color: AppColors.primary,
      );
    } else {
      title = '업데이트 확인';
      subtitle = '최신 버전인지 확인합니다';
      trailing = null;
    }

    return _buildSettingItem(
      icon: Icons.refresh_rounded,
      title: title,
      subtitle: subtitle,
      trailing: trailing,
      onTap: _isUpdating ? null : _checkForUpdate,
    );
  }

  Future<void> _checkForUpdate() async {
    setState(() {
      _isUpdating = true;
      _updateResult = null;
    });

    await Future<void>.delayed(const Duration(milliseconds: 1500));

    if (!mounted) return;

    setState(() {
      _isUpdating = false;
      _updateResult = 'latest';
    });
  }

  // -- Feedback Section --

  Widget _buildFeedbackSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '피드백',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 12),
          _buildSettingItem(
            icon: Icons.chat_bubble_outline_rounded,
            title: '기능 요청',
            subtitle: '원하는 기능을 요청하고 투표하세요',
            onTap: () => Navigator.pushNamed(context, '/feedback'),
          ),
        ],
      ),
    );
  }

  // -- App Info Section --

  Widget _buildAppInfoSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '앱 정보',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 12),
          _buildInfoRow('현재 버전', 'v${AppConstants.appVersion}'),
          const SizedBox(height: 8),
          _buildInfoRow('빌드 날짜', AppConstants.buildDate),
          const SizedBox(height: 12),
          _buildReleaseNotesToggle(),
          if (_showReleaseNotes) _buildReleaseNotesContent(),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        Text(
          value,
          style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
        ),
      ],
    );
  }

  Widget _buildReleaseNotesToggle() {
    return GestureDetector(
      onTap: () {
        setState(() {
          _showReleaseNotes = !_showReleaseNotes;
        });
        if (_showReleaseNotes) {
          _chevronController.forward();
        } else {
          _chevronController.reverse();
        }
      },
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            const Text(
              '주요 기능',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
            ),
            const Spacer(),
            RotationTransition(
              turns: _chevronRotation,
              child: const Icon(
                Icons.keyboard_arrow_down_rounded,
                size: 20,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReleaseNotesContent() {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: _releaseNotes.entries.map((entry) {
          final version = entry.key;
          final features = entry.value;
          final isCurrent = version == 'v${AppConstants.appVersion}';

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    version,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  if (isCurrent) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        '현재',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 8),
              ...features.map(
                (feature) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '- ',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      Expanded(
                        child: Text(
                          feature,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  // -- Logout Button --

  Widget _buildLogoutButton(MyState myState) {
    return GestureDetector(
      onTap: myState.isLoading ? null : _confirmSignOut,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Center(
          child: myState.isLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppColors.error,
                  ),
                )
              : const Text(
                  '로그아웃',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: AppColors.error,
                  ),
                ),
        ),
      ),
    );
  }

  Future<void> _confirmSignOut() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('로그아웃'),
        content: const Text('로그아웃 하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('로그아웃'),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      ref.read(myProvider.notifier).signOut();
    }
  }
}
