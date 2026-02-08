import 'package:flutter/material.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_shadows.dart';
import 'package:flu/core/constants/app_spacing.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/core/widgets/section_header.dart';

class VocabWord {
  final String word;
  final String level;

  const VocabWord({required this.word, required this.level});
}

class VocabPreview extends StatelessWidget {
  final List<VocabWord>? words;

  const VocabPreview({super.key, this.words});

  static const _defaultWords = [
    VocabWord(word: 'elaborate', level: 'B2'),
    VocabWord(word: 'serendipity', level: 'C1'),
    VocabWord(word: 'ambiguous', level: 'B2'),
    VocabWord(word: 'resilient', level: 'C1'),
    VocabWord(word: 'pragmatic', level: 'C2'),
    VocabWord(word: 'subtle', level: 'B1'),
  ];

  @override
  Widget build(BuildContext context) {
    final items = words ?? _defaultWords;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: SectionHeader(label: '\ub2e8\uc5b4 \ubbf8\ub9ac\ubcf4\uae30'),
        ),
        SizedBox(
          height: 100,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return Padding(
                padding: EdgeInsets.only(
                  right: index < items.length - 1 ? 10 : 0,
                ),
                child: _buildCard(item),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildCard(VocabWord item) {
    final levelColor = AppColors.levelColor(item.level);

    return Container(
      width: 120,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
        border: Border.all(color: AppColors.borderCard),
        boxShadow: AppShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            item.word,
            style: AppTypography.titleMedium.copyWith(fontSize: 17),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: levelColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            ),
            child: Text(
              item.level,
              style: AppTypography.badge.copyWith(color: levelColor),
            ),
          ),
        ],
      ),
    );
  }
}
