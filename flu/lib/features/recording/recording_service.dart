import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import '../../core/constants.dart';

class RecordingResult {
  final String? base64;
  final String mimeType;
  final int durationMs;
  final bool tooLong;

  RecordingResult({
    this.base64,
    this.mimeType = 'audio/aac',
    this.durationMs = 0,
    this.tooLong = false,
  });
}

class RecordingService {
  final AudioRecorder _recorder = AudioRecorder();
  Timer? _maxDurationTimer;
  DateTime? _recordingStartTime;
  String? _currentFilePath;
  bool _isRecording = false;
  bool _exceededMaxDuration = false;

  bool get isRecording => _isRecording;

  Future<void> startRecording() async {
    if (_isRecording) {
      await _stopRecorderSilently();
    }

    _exceededMaxDuration = false;
    _recordingStartTime = DateTime.now();

    final dir = await getTemporaryDirectory();
    _currentFilePath =
        '${dir.path}/enpeak_recording_${DateTime.now().millisecondsSinceEpoch}.aac';

    await _recorder.start(
      const RecordConfig(
        encoder: AudioEncoder.aacLc,
        sampleRate: 16000,
        numChannels: 1,
        bitRate: 64000,
      ),
      path: _currentFilePath!,
    );

    _isRecording = true;

    _maxDurationTimer = Timer(
      Duration(seconds: AppConstants.recordingMaxSeconds),
      () {
        _exceededMaxDuration = true;
        _stopRecorderSilently();
      },
    );
  }

  Future<RecordingResult> stopAndEncode() async {
    _maxDurationTimer?.cancel();
    _maxDurationTimer = null;

    if (!_isRecording) {
      return RecordingResult(tooLong: _exceededMaxDuration);
    }

    final durationMs = _recordingStartTime != null
        ? DateTime.now().difference(_recordingStartTime!).inMilliseconds
        : 0;

    final path = await _recorder.stop();
    _isRecording = false;

    if (_exceededMaxDuration) {
      _cleanupFile(path);
      return RecordingResult(tooLong: true, durationMs: durationMs);
    }

    if (path == null) {
      return RecordingResult(durationMs: durationMs);
    }

    try {
      final file = File(path);
      if (!await file.exists()) {
        return RecordingResult(durationMs: durationMs);
      }

      final bytes = await file.readAsBytes();

      // Check size limit
      final base64Str = base64Encode(bytes);
      if (base64Str.length > AppConstants.maxBase64SizeBytes) {
        _cleanupFile(path);
        return RecordingResult(
          tooLong: true,
          durationMs: durationMs,
        );
      }

      _cleanupFile(path);

      return RecordingResult(
        base64: base64Str,
        durationMs: durationMs,
      );
    } catch (e) {
      debugPrint('[Recording] Encode error: $e');
      _cleanupFile(path);
      return RecordingResult(durationMs: durationMs);
    }
  }

  Future<void> _stopRecorderSilently() async {
    try {
      if (_isRecording) {
        await _recorder.stop();
        _isRecording = false;
      }
    } catch (_) {}
  }

  void _cleanupFile(String? path) {
    if (path == null) return;
    try {
      final file = File(path);
      if (file.existsSync()) {
        file.deleteSync();
      }
    } catch (_) {}
  }

  Future<void> cleanupOldFiles() async {
    try {
      final dir = await getTemporaryDirectory();
      final files = dir.listSync();
      for (final file in files) {
        if (file is File && file.path.contains('enpeak_recording_')) {
          file.deleteSync();
        }
      }
    } catch (_) {}
  }

  void dispose() {
    _maxDurationTimer?.cancel();
    _recorder.dispose();
  }
}
