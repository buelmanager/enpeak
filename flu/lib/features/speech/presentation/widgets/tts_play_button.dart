import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../providers/tts_provider.dart';
import '../providers/tts_state.dart';

/// Play button for TTS audio playback.
///
/// Integrates with [TtsNotifier] via Riverpod.
/// Shows a loading spinner while generating audio, play/stop icons based on
/// playback state, and displays a snackbar when TTS errors occur.
class TtsPlayButton extends ConsumerWidget {
  final String text;
  final String language;
  final double size;

  const TtsPlayButton({
    super.key,
    required this.text,
    this.language = 'en',
    this.size = 32,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Listen for error state changes and show snackbar
    ref.listen<TtsState>(ttsProvider, (previous, next) {
      final newError = next.error;
      if (newError != null && newError != previous?.error) {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(
            SnackBar(
              content: Text(newError),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 3),
              action: SnackBarAction(
                label: 'OK',
                textColor: AppColors.surface,
                onPressed: () {
                  ScaffoldMessenger.of(context).hideCurrentSnackBar();
                },
              ),
            ),
          );
      }
    });

    final ttsState = ref.watch(ttsProvider);

    return SizedBox(
      width: size,
      height: size,
      child: IconButton(
        padding: EdgeInsets.zero,
        iconSize: size * 0.6,
        onPressed: ttsState.isLoading ? null : () => _onPressed(ref, ttsState),
        icon: _buildIcon(ttsState),
      ),
    );
  }

  void _onPressed(WidgetRef ref, TtsState ttsState) {
    final notifier = ref.read(ttsProvider.notifier);
    if (ttsState.isSpeaking) {
      notifier.stop();
    } else {
      notifier.speak(text, language: language);
    }
  }

  Widget _buildIcon(TtsState ttsState) {
    if (ttsState.isLoading) {
      return SizedBox(
        width: size * 0.5,
        height: size * 0.5,
        child: const CircularProgressIndicator(
          strokeWidth: 2,
          color: AppColors.primary,
        ),
      );
    }

    if (ttsState.isSpeaking) {
      return Icon(
        Icons.stop_circle_outlined,
        color: AppColors.error,
        size: size * 0.6,
      );
    }

    return Icon(Icons.volume_up, color: AppColors.primary, size: size * 0.6);
  }
}
