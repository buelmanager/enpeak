import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shimmer/shimmer.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/roleplay/domain/entities/scenario.dart';
import 'scenario_card.dart';

enum ScenarioCategory { all, daily, travel, business }

class ScenarioPicker extends ConsumerStatefulWidget {
  final List<Scenario>? scenarios;
  final bool isLoading;
  final ValueChanged<Scenario> onScenarioSelected;

  const ScenarioPicker({
    super.key,
    this.scenarios,
    this.isLoading = false,
    required this.onScenarioSelected,
  });

  @override
  ConsumerState<ScenarioPicker> createState() => _ScenarioPickerState();
}

class _ScenarioPickerState extends ConsumerState<ScenarioPicker> {
  ScenarioCategory _selectedCategory = ScenarioCategory.all;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Scenario> get _filteredScenarios {
    if (widget.scenarios == null) return [];

    var filtered = widget.scenarios!;

    if (_selectedCategory != ScenarioCategory.all) {
      filtered = filtered.where((s) {
        return s.category.toLowerCase() == _selectedCategory.name.toLowerCase();
      }).toList();
    }

    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      filtered = filtered.where((s) {
        return s.title.toLowerCase().contains(query) ||
            s.titleKo.contains(query);
      }).toList();
    }

    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSearchBar(),
        const SizedBox(height: 12),
        _buildCategoryTabs(),
        const SizedBox(height: 16),
        Expanded(
          child: widget.isLoading ? _buildShimmerGrid() : _buildScenarioGrid(),
        ),
      ],
    );
  }

  Widget _buildSearchBar() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (value) => setState(() => _searchQuery = value),
        style: AppTypography.body.copyWith(fontSize: 15),
        decoration: InputDecoration(
          hintText: 'Search scenarios...',
          hintStyle: AppTypography.bodySmall.copyWith(
            color: AppColors.textSecondary.withValues(alpha: 0.6),
          ),
          prefixIcon: Icon(
            Icons.search_rounded,
            color: AppColors.textSecondary.withValues(alpha: 0.5),
            size: 20,
          ),
          suffixIcon: _searchQuery.isNotEmpty
              ? GestureDetector(
                  onTap: () {
                    _searchController.clear();
                    setState(() => _searchQuery = '');
                  },
                  child: Icon(
                    Icons.close_rounded,
                    color: AppColors.textSecondary.withValues(alpha: 0.5),
                    size: 18,
                  ),
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 12,
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryTabs() {
    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: ScenarioCategory.values.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final category = ScenarioCategory.values[index];
          final isActive = category == _selectedCategory;

          return GestureDetector(
            onTap: () => setState(() => _selectedCategory = category),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: isActive ? AppColors.primary : AppColors.surface,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: isActive ? AppColors.primary : AppColors.border,
                ),
              ),
              alignment: Alignment.center,
              child: Text(
                _categoryLabel(category),
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isActive ? Colors.white : AppColors.textSecondary,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildScenarioGrid() {
    final scenarios = _filteredScenarios;

    if (scenarios.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.search_off_rounded,
              size: 48,
              color: AppColors.textSecondary.withValues(alpha: 0.4),
            ),
            const SizedBox(height: 12),
            Text('No scenarios found', style: AppTypography.bodySmall),
          ],
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.85,
      ),
      itemCount: scenarios.length,
      itemBuilder: (context, index) {
        final scenario = scenarios[index];
        return ScenarioCard(
          scenario: scenario,
          onTap: () => widget.onScenarioSelected(scenario),
        );
      },
    );
  }

  Widget _buildShimmerGrid() {
    return Shimmer.fromColors(
      baseColor: AppColors.shimmerBase,
      highlightColor: AppColors.shimmerHighlight,
      child: GridView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.85,
        ),
        itemCount: 6,
        itemBuilder: (context, index) {
          return Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
            ),
          );
        },
      ),
    );
  }

  static String _categoryLabel(ScenarioCategory category) {
    return switch (category) {
      ScenarioCategory.all => 'All',
      ScenarioCategory.daily => 'Daily',
      ScenarioCategory.travel => 'Travel',
      ScenarioCategory.business => 'Business',
    };
  }
}
