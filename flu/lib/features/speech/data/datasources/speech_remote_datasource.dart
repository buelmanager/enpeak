import 'dart:convert';
import 'dart:typed_data';
import 'package:flu/core/network/api_client.dart';
import 'package:flu/core/constants/api_endpoints.dart';
import 'package:flu/core/errors/result.dart';
import '../models/tts_request_model.dart';
import '../models/stt_response_model.dart';

class SpeechRemoteDataSource {
  final ApiClient _apiClient;

  SpeechRemoteDataSource(this._apiClient);

  Future<Result<TtsResponseModel>> textToSpeech(TtsRequestModel request) async {
    final result = await _apiClient.post(
      ApiEndpoints.speechTts,
      data: request.toJson(),
    );
    return result.when(
      ok: (data) => Ok(TtsResponseModel.fromJson(data)),
      err: (failure) => Err(failure),
    );
  }

  Future<Result<SttResponseModel>> speechToText(Uint8List audioData) async {
    final base64Audio = base64Encode(audioData);
    final result = await _apiClient.post(
      ApiEndpoints.speechStt,
      data: {'audio': base64Audio},
    );
    return result.when(
      ok: (data) => Ok(SttResponseModel.fromJson(data)),
      err: (failure) => Err(failure),
    );
  }

  Future<Result<List<String>>> getAvailableVoices() async {
    final result = await _apiClient.get(ApiEndpoints.speechVoices);
    return result.when(
      ok: (data) {
        final voices = (data['voices'] as List<dynamic>? ?? [])
            .map((e) => e as String)
            .toList();
        return Ok(voices);
      },
      err: (failure) => Err(failure),
    );
  }
}
