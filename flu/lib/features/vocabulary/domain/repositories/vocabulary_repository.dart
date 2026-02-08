import 'package:flu/core/errors/result.dart';
import '../../data/models/word_model.dart';
import '../../data/models/word_expansion_model.dart';

abstract class VocabularyRepository {
  Future<Result<List<WordModel>>> getWords({String? level});
  Future<Result<WordModel>> addWord(String word);
  Future<Result<void>> removeWord(String word);
  Future<Result<WordExpansionModel>> expandWord(String word);
  Future<Result<List<WordModel>>> searchWords(String query);
  Future<Result<List<WordModel>>> getSavedWords();
  Future<Result<void>> saveWord(WordModel word);
  Future<Result<void>> removeSavedWord(String word);
}
