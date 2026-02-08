import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_constants.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/my/presentation/providers/my_provider.dart';
import 'package:flu/features/speech/presentation/providers/tts_provider.dart';
import 'package:flu/features/speech/presentation/providers/tts_state.dart';

class VoiceSettingsSheet extends ConsumerWidget {
  const VoiceSettingsSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const VoiceSettingsSheet(),
    );
  }

  static const _voices = [
    'en-US-AriaNeural',
    'en-US-JennyNeural',
    'en-US-GuyNeural',
    'en-US-AnaNeural',
    'en-GB-SoniaNeural',
    'en-GB-RyanNeural',
    'en-AU-NatashaNeural',
  ];

  static const _voiceLabels = {
    'en-US-AriaNeural': 'Aria (US, 여성)',
    'en-US-JennyNeural': 'Jenny (US, 여성)',
    'en-US-GuyNeural': 'Guy (US, 남성)',
    'en-US-AnaNeural': 'Ana (US, 여성)',
    'en-GB-SoniaNeural': 'Sonia (UK, 여성)',
    'en-GB-RyanNeural': 'Ryan (UK, 남성)',
    'en-AU-NatashaNeural': 'Natasha (AU, 여성)',
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final myState = ref.watch(myProvider);

    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text('음성 설정', style: AppTypography.heading3),
          const SizedBox(height: 24),
          Text('TTS 모드', style: AppTypography.label),
          const SizedBox(height: 8),
          _buildModeToggle(ref, myState),
          const SizedBox(height: 20),
          if (myState.ttsMode == TtsMode.hd) ...[
            Text('음성 선택', style: AppTypography.label),
            const SizedBox(height: 8),
            _buildVoiceSelector(ref, myState),
            const SizedBox(height: 20),
          ],
          Text('속도', style: AppTypography.label),
          const SizedBox(height: 4),
          _buildSpeedSlider(ref, myState),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: OutlinedButton(
                    onPressed: () {
                      ref
                          .read(ttsProvider.notifier)
                          .speak('Hello! How are you today?');
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.primary),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(
                          AppConstants.buttonBorderRadius,
                        ),
                      ),
                    ),
                    child: const Text('미리 듣기'),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: AppColors.surface,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(
                          AppConstants.buttonBorderRadius,
                        ),
                      ),
                    ),
                    child: const Text('저장'),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildModeToggle(WidgetRef ref, MyState myState) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildModeButton(
              label: 'Device',
              isSelected: myState.ttsMode == TtsMode.device,
              onTap: () =>
                  ref.read(myProvider.notifier).updateTtsMode(TtsMode.device),
            ),
          ),
          Expanded(
            child: _buildModeButton(
              label: 'HD',
              isSelected: myState.ttsMode == TtsMode.hd,
              onTap: () =>
                  ref.read(myProvider.notifier).updateTtsMode(TtsMode.hd),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModeButton({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(11),
        ),
        child: Center(
          child: Text(
            label,
            style: AppTypography.bodyMedium.copyWith(
              color: isSelected ? AppColors.surface : AppColors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildVoiceSelector(WidgetRef ref, MyState myState) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _voices.contains(myState.selectedVoice)
              ? myState.selectedVoice
              : _voices.first,
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down_rounded),
          items: _voices.map((voice) {
            return DropdownMenuItem(
              value: voice,
              child: Text(
                _voiceLabels[voice] ?? voice,
                style: AppTypography.body,
              ),
            );
          }).toList(),
          onChanged: (value) {
            if (value != null) {
              ref.read(myProvider.notifier).updateVoice(value);
            }
          },
        ),
      ),
    );
  }

  Widget _buildSpeedSlider(WidgetRef ref, MyState myState) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('0.5x', style: AppTypography.caption),
            Text(
              '${myState.speechRate.toStringAsFixed(1)}x',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.primary,
              ),
            ),
            Text('2.0x', style: AppTypography.caption),
          ],
        ),
        SliderTheme(
          data: SliderThemeData(
            activeTrackColor: AppColors.primary,
            inactiveTrackColor: AppColors.border,
            thumbColor: AppColors.primary,
            overlayColor: AppColors.primary.withValues(alpha: 0.12),
            trackHeight: 4,
          ),
          child: Slider(
            value: myState.speechRate,
            min: 0.5,
            max: 2.0,
            divisions: 15,
            onChanged: (value) {
              ref.read(myProvider.notifier).updateSpeechRate(value);
            },
          ),
        ),
      ],
    );
  }
}
