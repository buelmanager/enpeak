import 'dart:typed_data';
import 'package:flu/core/errors/result.dart';
import '../../data/models/tts_request_model.dart';
import '../../data/models/stt_response_model.dart';

abstract class SpeechRepository {
  Future<Result<TtsResponseModel>> textToSpeech(TtsRequestModel request);
  Future<Result<SttResponseModel>> speechToText(Uint8List audioData);
  Future<Result<List<String>>> getAvailableVoices();
}
