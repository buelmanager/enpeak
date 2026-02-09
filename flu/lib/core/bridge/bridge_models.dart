enum BridgeStatus { success, error, tooLong }

class BridgeRequest {
  final String id;
  final String action;
  final Map<String, dynamic>? payload;

  BridgeRequest({
    required this.id,
    required this.action,
    this.payload,
  });

  factory BridgeRequest.fromMap(Map<String, dynamic> map) {
    return BridgeRequest(
      id: map['id'] as String? ?? '',
      action: map['action'] as String? ?? '',
      payload: map['payload'] as Map<String, dynamic>?,
    );
  }
}

class BridgeResponse {
  final String id;
  final BridgeStatus status;
  final dynamic data;
  final String? error;

  BridgeResponse({
    required this.id,
    required this.status,
    this.data,
    this.error,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'status': status.name.toUpperCase(),
      'data': data,
      if (error != null) 'error': error,
    };
  }

  factory BridgeResponse.success(String id, {dynamic data}) {
    return BridgeResponse(id: id, status: BridgeStatus.success, data: data);
  }

  factory BridgeResponse.error(String id, String message) {
    return BridgeResponse(
        id: id, status: BridgeStatus.error, error: message);
  }

  factory BridgeResponse.tooLong(String id) {
    return BridgeResponse(
        id: id,
        status: BridgeStatus.tooLong,
        error: 'Recording exceeded maximum duration');
  }
}
