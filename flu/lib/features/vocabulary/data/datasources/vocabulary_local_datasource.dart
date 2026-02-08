import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/word_model.dart';

class VocabularyLocalDataSource {
  static const _savedWordsKey = 'saved_words';
  final SharedPreferences _prefs;

  VocabularyLocalDataSource(this._prefs);

  List<WordModel> getSavedWords() {
    final jsonString = _prefs.getString(_savedWordsKey);
    if (jsonString == null) return [];

    final List<dynamic> jsonList = json.decode(jsonString) as List<dynamic>;
    return jsonList
        .map((e) => WordModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> saveWord(WordModel word) async {
    final words = getSavedWords();
    final exists = words.any((w) => w.word == word.word);
    if (exists) return;

    words.add(word);
    final jsonString = json.encode(words.map((e) => e.toJson()).toList());
    await _prefs.setString(_savedWordsKey, jsonString);
  }

  Future<void> removeWord(String word) async {
    final words = getSavedWords();
    words.removeWhere((w) => w.word == word);
    final jsonString = json.encode(words.map((e) => e.toJson()).toList());
    await _prefs.setString(_savedWordsKey, jsonString);
  }
}
