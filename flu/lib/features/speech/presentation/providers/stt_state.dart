class SttState {
  final bool isListening;
  final String recognizedText;
  final double confidence;
  final bool isAvailable;
  final bool isInitialized;
  final String? error;

  const SttState({
    this.isListening = false,
    this.recognizedText = '',
    this.confidence = 0.0,
    this.isAvailable = false,
    this.isInitialized = false,
    this.error,
  });

  SttState copyWith({
    bool? isListening,
    String? recognizedText,
    double? confidence,
    bool? isAvailable,
    bool? isInitialized,
    String? error,
  }) {
    return SttState(
      isListening: isListening ?? this.isListening,
      recognizedText: recognizedText ?? this.recognizedText,
      confidence: confidence ?? this.confidence,
      isAvailable: isAvailable ?? this.isAvailable,
      isInitialized: isInitialized ?? this.isInitialized,
      error: error,
    );
  }
}
