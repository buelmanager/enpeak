import 'package:dio/dio.dart';

import '../config/env_config.dart';
import '../errors/failures.dart';
import '../errors/result.dart';
import 'api_interceptors.dart';

class ApiClient {
  late final Dio _dio;

  ApiClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: EnvConfig.apiUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 60),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.addAll([
      AuthInterceptor(),
      ErrorInterceptor(),
      RetryInterceptor(dio: _dio),
      LoggingInterceptor(),
    ]);
  }

  Future<Result<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic data)? parser,
  }) => _request(
    () => _dio.get(path, queryParameters: queryParameters),
    parser: parser,
  );

  Future<Result<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    T Function(dynamic data)? parser,
  }) => _request(
    () => _dio.post(path, data: data, queryParameters: queryParameters),
    parser: parser,
  );

  Future<Result<T>> delete<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic data)? parser,
  }) => _request(
    () => _dio.delete(path, queryParameters: queryParameters),
    parser: parser,
  );

  Future<Response> getRaw(
    String path, {
    Map<String, dynamic>? queryParameters,
    ResponseType? responseType,
  }) => _dio.get(
    path,
    queryParameters: queryParameters,
    options: Options(responseType: responseType),
  );

  Future<Result<T>> _request<T>(
    Future<Response> Function() request, {
    T Function(dynamic data)? parser,
  }) async {
    try {
      final response = await request();
      final parsed = parser != null
          ? parser(response.data)
          : response.data as T;
      return Ok(parsed);
    } on DioException catch (e) {
      return Err(_mapDioException(e));
    } on Exception catch (e) {
      return Err(UnknownFailure(e.toString()));
    }
  }

  Failure _mapDioException(DioException e) => switch (e.type) {
    DioExceptionType.connectionTimeout ||
    DioExceptionType.sendTimeout ||
    DioExceptionType.receiveTimeout => TimeoutFailure(
      e.message ?? 'Request timed out',
    ),
    DioExceptionType.connectionError => NetworkFailure(
      e.message ?? 'Network connection failed',
    ),
    DioExceptionType.badResponse => ServerFailure(
      e.message ?? 'Server error',
      statusCode: e.response?.statusCode,
    ),
    _ => UnknownFailure(e.message ?? 'Unknown error'),
  };
}
