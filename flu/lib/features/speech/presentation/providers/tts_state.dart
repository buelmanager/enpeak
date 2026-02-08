enum TtsMode { device, hd }

class TtsState {
  final TtsMode mode;
  final String currentVoice;
  final double speed;
  final bool isSpeaking;
  final bool isLoading;
  final String? error;

  const TtsState({
    this.mode = TtsMode.device,
    this.currentVoice = 'en-US-AriaNeural',
    this.speed = 1.0,
    this.isSpeaking = false,
    this.isLoading = false,
    this.error,
  });

  TtsState copyWith({
    TtsMode? mode,
    String? currentVoice,
    double? speed,
    bool? isSpeaking,
    bool? isLoading,
    String? error,
  }) {
    return TtsState(
      mode: mode ?? this.mode,
      currentVoice: currentVoice ?? this.currentVoice,
      speed: speed ?? this.speed,
      isSpeaking: isSpeaking ?? this.isSpeaking,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}
