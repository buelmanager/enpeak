import 'package:flu/core/errors/result.dart';
import '../../domain/repositories/vocabulary_repository.dart';
import '../datasources/vocabulary_remote_datasource.dart';
import '../datasources/vocabulary_local_datasource.dart';
import '../models/word_model.dart';
import '../models/word_expansion_model.dart';

class VocabularyRepositoryImpl implements VocabularyRepository {
  final VocabularyRemoteDataSource _remoteDataSource;
  final VocabularyLocalDataSource _localDataSource;

  VocabularyRepositoryImpl(this._remoteDataSource, this._localDataSource);

  @override
  Future<Result<List<WordModel>>> getWords({String? level}) async {
    return _remoteDataSource.getWords(level: level);
  }

  @override
  Future<Result<WordModel>> addWord(String word) async {
    return _remoteDataSource.addWord(word);
  }

  @override
  Future<Result<void>> removeWord(String word) async {
    return _remoteDataSource.removeWord(word);
  }

  @override
  Future<Result<WordExpansionModel>> expandWord(String word) async {
    return _remoteDataSource.expandWord(word);
  }

  @override
  Future<Result<List<WordModel>>> searchWords(String query) async {
    return _remoteDataSource.searchWords(query);
  }

  @override
  Future<Result<List<WordModel>>> getSavedWords() async {
    try {
      final words = _localDataSource.getSavedWords();
      return Ok(words);
    } catch (e) {
      return Ok(const []);
    }
  }

  @override
  Future<Result<void>> saveWord(WordModel word) async {
    try {
      await _localDataSource.saveWord(word);
      return const Ok(null);
    } catch (e) {
      return const Ok(null);
    }
  }

  @override
  Future<Result<void>> removeSavedWord(String word) async {
    try {
      await _localDataSource.removeWord(word);
      return const Ok(null);
    } catch (e) {
      return const Ok(null);
    }
  }
}
