import 'dart:typed_data';
import 'package:flu/core/errors/result.dart';
import '../../domain/repositories/speech_repository.dart';
import '../datasources/speech_remote_datasource.dart';
import '../models/tts_request_model.dart';
import '../models/stt_response_model.dart';

class SpeechRepositoryImpl implements SpeechRepository {
  final SpeechRemoteDataSource _remoteDataSource;

  SpeechRepositoryImpl(this._remoteDataSource);

  @override
  Future<Result<TtsResponseModel>> textToSpeech(TtsRequestModel request) async {
    return _remoteDataSource.textToSpeech(request);
  }

  @override
  Future<Result<SttResponseModel>> speechToText(Uint8List audioData) async {
    return _remoteDataSource.speechToText(audioData);
  }

  @override
  Future<Result<List<String>>> getAvailableVoices() async {
    return _remoteDataSource.getAvailableVoices();
  }
}
