import 'dart:convert';
import 'dart:io';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:get_it/get_it.dart';
import 'package:path_provider/path_provider.dart';

import '../../data/models/tts_request_model.dart';
import '../../domain/repositories/speech_repository.dart';
import 'tts_state.dart';

class TtsNotifier extends StateNotifier<TtsState> {
  final FlutterTts _flutterTts;
  final AudioPlayer _audioPlayer;
  final SpeechRepository _speechRepository;

  TtsNotifier({
    required FlutterTts flutterTts,
    required AudioPlayer audioPlayer,
    required SpeechRepository speechRepository,
  }) : _flutterTts = flutterTts,
       _audioPlayer = audioPlayer,
       _speechRepository = speechRepository,
       super(const TtsState()) {
    _initFlutterTts();
    _initAudioPlayer();
  }

  void _initFlutterTts() {
    _flutterTts.setStartHandler(() {
      if (state.mode == TtsMode.device) {
        state = state.copyWith(isSpeaking: true);
      }
    });
    _flutterTts.setCompletionHandler(() {
      if (state.mode == TtsMode.device) {
        state = state.copyWith(isSpeaking: false);
      }
    });
    _flutterTts.setErrorHandler((msg) {
      state = state.copyWith(
        isSpeaking: false,
        isLoading: false,
        error: msg.toString(),
      );
    });
    _flutterTts.setCancelHandler(() {
      state = state.copyWith(isSpeaking: false);
    });
  }

  void _initAudioPlayer() {
    _audioPlayer.onPlayerStateChanged.listen((playerState) {
      if (state.mode == TtsMode.hd) {
        final playing = playerState == PlayerState.playing;
        final stopped =
            playerState == PlayerState.stopped ||
            playerState == PlayerState.completed;
        if (playing) {
          state = state.copyWith(isSpeaking: true, isLoading: false);
        } else if (stopped) {
          state = state.copyWith(isSpeaking: false, isLoading: false);
        }
      }
    });
  }

  Future<void> speak(String text, {String language = 'en'}) async {
    if (text.isEmpty) return;

    await stop();

    switch (state.mode) {
      case TtsMode.device:
        await _speakDevice(text, language: language);
      case TtsMode.hd:
        await _speakHd(text, language: language);
    }
  }

  Future<void> _speakDevice(String text, {String language = 'en'}) async {
    await _flutterTts.setLanguage(language == 'ko' ? 'ko-KR' : 'en-US');
    await _flutterTts.setSpeechRate(state.speed);
    await _flutterTts.speak(text);
  }

  Future<void> _speakHd(String text, {String language = 'en'}) async {
    state = state.copyWith(isLoading: true, error: null);

    final request = TtsRequestModel(
      text: text,
      language: language,
      speed: state.speed,
      voice: state.currentVoice,
    );

    final result = await _speechRepository.textToSpeech(request);
    result.when(
      ok: (response) async {
        try {
          final bytes = base64Decode(response.audioBase64);
          final tempDir = await getTemporaryDirectory();
          final file = File('${tempDir.path}/tts_audio.mp3');
          await file.writeAsBytes(bytes);
          await _audioPlayer.play(DeviceFileSource(file.path));
        } on Exception catch (e) {
          state = state.copyWith(
            isLoading: false,
            isSpeaking: false,
            error: e.toString(),
          );
        }
      },
      err: (failure) {
        state = state.copyWith(
          isLoading: false,
          isSpeaking: false,
          error: failure.message,
        );
      },
    );
  }

  Future<void> stop() async {
    switch (state.mode) {
      case TtsMode.device:
        await _flutterTts.stop();
      case TtsMode.hd:
        await _audioPlayer.stop();
    }
    state = state.copyWith(isSpeaking: false, isLoading: false);
  }

  void setMode(TtsMode mode) {
    if (state.isSpeaking) stop();
    state = state.copyWith(mode: mode);
  }

  void setVoice(String voice) {
    state = state.copyWith(currentVoice: voice);
  }

  void setSpeed(double speed) {
    final clamped = speed.clamp(0.5, 2.0);
    state = state.copyWith(speed: clamped);
  }

  @override
  void dispose() {
    _flutterTts.stop();
    _audioPlayer.dispose();
    super.dispose();
  }
}

final speechRepositoryProvider = Provider<SpeechRepository>((ref) {
  return GetIt.instance<SpeechRepository>();
});

final ttsProvider = StateNotifierProvider<TtsNotifier, TtsState>((ref) {
  return TtsNotifier(
    flutterTts: FlutterTts(),
    audioPlayer: AudioPlayer(),
    speechRepository: ref.read(speechRepositoryProvider),
  );
});
