import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:speech_to_text/speech_recognition_error.dart';
import 'package:speech_to_text/speech_recognition_result.dart';
import 'package:speech_to_text/speech_to_text.dart';

import 'stt_state.dart';

class SttNotifier extends StateNotifier<SttState> {
  final SpeechToText _speechToText;

  SttNotifier({SpeechToText? speechToText})
    : _speechToText = speechToText ?? SpeechToText(),
      super(const SttState());

  Future<void> initialize() async {
    if (state.isInitialized) return;

    try {
      final available = await _speechToText.initialize(
        onError: _onError,
        onStatus: _onStatus,
      );
      state = state.copyWith(
        isAvailable: available,
        isInitialized: true,
        error: available ? null : 'Speech recognition not available',
      );
    } on Exception catch (e) {
      state = state.copyWith(
        isAvailable: false,
        isInitialized: false,
        error: e.toString(),
      );
    }
  }

  Future<void> startListening({
    String localeId = 'en_US',
    void Function(String text)? onResult,
  }) async {
    if (!state.isInitialized) await initialize();
    if (!state.isAvailable) return;
    if (state.isListening) return;

    state = state.copyWith(
      isListening: true,
      recognizedText: '',
      confidence: 0.0,
      error: null,
    );

    await _speechToText.listen(
      onResult: (result) => _onResult(result, onResult),
      localeId: localeId,
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 3),
      listenOptions: SpeechListenOptions(
        listenMode: ListenMode.dictation,
        partialResults: true,
        cancelOnError: false,
      ),
    );
  }

  Future<void> stopListening() async {
    if (!state.isListening) return;
    await _speechToText.stop();
    state = state.copyWith(isListening: false);
  }

  Future<void> cancelListening() async {
    await _speechToText.cancel();
    state = state.copyWith(
      isListening: false,
      recognizedText: '',
      confidence: 0.0,
    );
  }

  void _onResult(
    SpeechRecognitionResult result,
    void Function(String text)? onResult,
  ) {
    state = state.copyWith(
      recognizedText: result.recognizedWords,
      confidence: result.confidence,
      isListening: !result.finalResult ? state.isListening : false,
    );
    if (result.finalResult && onResult != null) {
      onResult(result.recognizedWords);
    }
  }

  void _onError(SpeechRecognitionError error) {
    state = state.copyWith(isListening: false, error: error.errorMsg);
  }

  void _onStatus(String status) {
    if (status == 'done' || status == 'notListening') {
      state = state.copyWith(isListening: false);
    }
  }

  void clearText() {
    state = state.copyWith(recognizedText: '', confidence: 0.0);
  }

  @override
  void dispose() {
    _speechToText.stop();
    super.dispose();
  }
}

final sttProvider = StateNotifierProvider<SttNotifier, SttState>((ref) {
  return SttNotifier();
});
