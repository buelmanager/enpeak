sealed class Failure {
  final String message;
  final int? statusCode;

  const Failure(this.message, {this.statusCode});

  @override
  String toString() => '$runtimeType: $message';
}

final class ServerFailure extends Failure {
  const ServerFailure(super.message, {super.statusCode});
}

final class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'Network connection failed']);
}

final class CacheFailure extends Failure {
  const CacheFailure([super.message = 'Cache operation failed']);
}

final class ValidationFailure extends Failure {
  final Map<String, String>? fieldErrors;

  const ValidationFailure(super.message, {this.fieldErrors});
}

final class TimeoutFailure extends Failure {
  const TimeoutFailure([super.message = 'Request timed out']);
}

final class UnknownFailure extends Failure {
  const UnknownFailure([super.message = 'An unknown error occurred']);
}
