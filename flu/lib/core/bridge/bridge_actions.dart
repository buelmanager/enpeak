enum BridgeAction {
  recordStart,
  recordStopAndGetBase64,
  getToken,
  getPlatformInfo,
  signInGoogle,
  signInEmail,
  signUpEmail,
  signOut;

  static BridgeAction? fromString(String value) {
    switch (value) {
      case 'RECORD_START':
        return BridgeAction.recordStart;
      case 'RECORD_STOP_AND_GET_BASE64':
        return BridgeAction.recordStopAndGetBase64;
      case 'GET_TOKEN':
        return BridgeAction.getToken;
      case 'GET_PLATFORM_INFO':
        return BridgeAction.getPlatformInfo;
      case 'SIGN_IN_GOOGLE':
        return BridgeAction.signInGoogle;
      case 'SIGN_IN_EMAIL':
        return BridgeAction.signInEmail;
      case 'SIGN_UP_EMAIL':
        return BridgeAction.signUpEmail;
      case 'SIGN_OUT':
        return BridgeAction.signOut;
      default:
        return null;
    }
  }
}
