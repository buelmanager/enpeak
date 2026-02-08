import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/features/home/presentation/pages/home_screen.dart';
import 'package:flu/features/stats/presentation/pages/stats_screen.dart';

class NavigationShell extends StatefulWidget {
  const NavigationShell({super.key});

  @override
  State<NavigationShell> createState() => _NavigationShellState();
}

class _NavigationShellState extends State<NavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [HomeScreen(), StatsScreen()];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: _buildBottomNav(context),
      floatingActionButton: _buildTalkButton(context),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    return BottomAppBar(
      height: 64 + bottomPadding,
      padding: EdgeInsets.zero,
      color: AppColors.background,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      notchMargin: 8,
      shape: const CircularNotchedRectangle(),
      child: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: Color(0xFFF0F0F0), width: 1)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(icon: Icons.home_rounded, label: '홈', index: 0),
            const SizedBox(width: 72),
            _buildNavItem(icon: Icons.bar_chart_rounded, label: '통계', index: 1),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required int index,
  }) {
    final isActive = _currentIndex == index;
    final color = isActive ? AppColors.primary : AppColors.textSecondary;

    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _currentIndex = index),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 26),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTalkButton(BuildContext context) {
    return SizedBox(
      width: 72,
      height: 72,
      child: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, '/talk'),
        elevation: 0,
        backgroundColor: AppColors.primary,
        shape: const CircleBorder(),
        child: const Icon(
          Icons.chat_bubble_rounded,
          color: Colors.white,
          size: 30,
        ),
      ),
    );
  }
}
