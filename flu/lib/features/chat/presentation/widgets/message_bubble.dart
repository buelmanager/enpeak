import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../domain/entities/message.dart';
import 'better_expression_card.dart';
import 'learning_tip_card.dart';

/// A single chat message bubble matching the original Next.js MessageBubble.
///
/// User messages are right-aligned with primary (teal) background.
/// AI messages are left-aligned with white background, bordered, and include
/// action buttons (TTS, translate, pronunciation, bookmark), translation
/// display, suggestion chips, and learning tip cards.
class MessageBubble extends ConsumerWidget {
  final Message message;
  final bool? _isUser;
  final VoidCallback? onSpeak;
  final VoidCallback? onTranslate;
  final VoidCallback? onPronunciation;
  final VoidCallback? onBookmark;
  final void Function(String suggestion)? onSuggestionTap;
  final bool isSpeaking;
  final bool isTranslated;
  final bool isBookmarked;
  final String? translation;

  const MessageBubble({
    super.key,
    required this.message,
    bool? isUser,
    this.onSpeak,
    this.onTranslate,
    this.onPronunciation,
    this.onBookmark,
    this.onSuggestionTap,
    this.isSpeaking = false,
    this.isTranslated = false,
    this.isBookmarked = false,
    this.translation,
  }) : _isUser = isUser;

  bool get isUser => _isUser ?? message.role == 'user';

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Column(
        crossAxisAlignment: isUser
            ? CrossAxisAlignment.end
            : CrossAxisAlignment.start,
        children: [
          // -- Main bubble --
          ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.85,
            ),
            child: _buildBubble(),
          ),

          // -- Action buttons row for AI messages (outside bubble, below) --
          if (!isUser) _buildActionButtons(),

          // -- Translation display --
          if (!isUser && isTranslated && translation != null)
            _buildTranslation(),

          // -- Learning tip (below AI bubble) --
          if (!isUser && message.learningTip != null)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: LearningTipCard(tip: message.learningTip!),
            ),

          // -- Suggestions (below AI bubble) --
          if (!isUser &&
              message.suggestions != null &&
              message.suggestions!.isNotEmpty)
            _buildSuggestions(),

          // -- Better expressions (below user bubble) --
          if (isUser &&
              message.betterExpressions != null &&
              message.betterExpressions!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: BetterExpressionCard(
                expressions: message.betterExpressions!,
              ),
            ),
        ],
      ),
    );
  }

  /// The message bubble container with text content.
  Widget _buildBubble() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: isUser ? AppColors.primary : AppColors.surface,
        borderRadius: BorderRadius.only(
          topLeft: const Radius.circular(20),
          topRight: const Radius.circular(20),
          bottomRight: Radius.circular(isUser ? 4 : 20),
          bottomLeft: Radius.circular(isUser ? 20 : 4),
        ),
        border: isUser ? null : Border.all(color: const Color(0xFFE5E5E5)),
      ),
      child: Text(
        message.content,
        style: AppTypography.bodyMessage.copyWith(
          color: isUser ? Colors.white : AppColors.textPrimary,
        ),
      ),
    );
  }

  /// Action buttons row displayed below AI messages.
  /// Icons: TTS play, translate, pronunciation, bookmark.
  Widget _buildActionButtons() {
    return Padding(
      padding: const EdgeInsets.only(top: 4, left: 4),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // TTS play / stop
          _ActionIconButton(
            icon: isSpeaking ? Icons.stop : Icons.volume_up,
            isActive: isSpeaking,
            onTap: onSpeak,
          ),
          const SizedBox(width: 4),

          // Translate toggle
          _ActionIconButton(
            icon: Icons.translate,
            isActive: isTranslated,
            onTap: onTranslate,
          ),
          const SizedBox(width: 4),

          // Pronunciation practice
          _ActionIconButton(
            icon: Icons.mic,
            isActive: false,
            onTap: onPronunciation,
          ),
          const SizedBox(width: 4),

          // Bookmark toggle
          _ActionIconButton(
            icon: isBookmarked ? Icons.bookmark : Icons.bookmark_border,
            isActive: isBookmarked,
            onTap: onBookmark,
          ),
        ],
      ),
    );
  }

  /// Korean translation display shown when translate is toggled ON.
  Widget _buildTranslation() {
    return Padding(
      padding: const EdgeInsets.only(top: 6, left: 4),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.primaryTint,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          translation!,
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.textSecondary,
            height: 1.5,
          ),
        ),
      ),
    );
  }

  /// Suggestion chips displayed below AI messages.
  /// Max 2, rounded-full, primaryTint bg, primary text.
  Widget _buildSuggestions() {
    final displaySuggestions = message.suggestions!.take(2).toList();
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: displaySuggestions.map((suggestion) {
          return GestureDetector(
            onTap: () => onSuggestionTap?.call(suggestion),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.primaryTint,
                borderRadius: BorderRadius.circular(9999),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.2),
                ),
              ),
              child: Text(
                suggestion,
                style: const TextStyle(fontSize: 13, color: AppColors.primary),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

/// Small icon button used in the AI message action row.
/// 18px icon, textSecondary color by default, primary when active.
class _ActionIconButton extends StatelessWidget {
  final IconData icon;
  final bool isActive;
  final VoidCallback? onTap;

  const _ActionIconButton({
    required this.icon,
    required this.isActive,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 32,
      height: 32,
      child: IconButton(
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
        iconSize: 18,
        icon: Icon(
          icon,
          color: isActive ? AppColors.primary : AppColors.textSecondary,
        ),
        onPressed: onTap,
      ),
    );
  }
}
