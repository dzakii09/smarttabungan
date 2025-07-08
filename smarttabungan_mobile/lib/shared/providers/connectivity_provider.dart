import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityProvider extends ChangeNotifier {
  final Connectivity _connectivity = Connectivity();
  StreamSubscription<ConnectivityResult>? _connectivitySubscription;
  
  ConnectivityResult _connectivityResult = ConnectivityResult.none;
  bool _isConnected = false;
  bool _isInitialized = false;

  // Getters
  ConnectivityResult get connectivityResult => _connectivityResult;
  bool get isConnected => _isConnected;
  bool get isInitialized => _isInitialized;
  bool get isWifi => _connectivityResult == ConnectivityResult.wifi;
  bool get isMobile => _connectivityResult == ConnectivityResult.mobile;
  bool get isEthernet => _connectivityResult == ConnectivityResult.ethernet;
  bool get isBluetooth => _connectivityResult == ConnectivityResult.bluetooth;
  bool get isVpn => _connectivityResult == ConnectivityResult.vpn;
  bool get isOther => _connectivityResult == ConnectivityResult.other;
  bool get isNone => _connectivityResult == ConnectivityResult.none;

  // Initialize provider
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // Get initial connectivity status
      _connectivityResult = await _connectivity.checkConnectivity();
      _isConnected = _connectivityResult != ConnectivityResult.none;
      
      // Listen to connectivity changes
      _connectivitySubscription = _connectivity.onConnectivityChanged.listen(
        _onConnectivityChanged,
        onError: _onConnectivityError,
      );
      
      _isInitialized = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Error initializing connectivity provider: $e');
    }
  }

  // Handle connectivity changes
  void _onConnectivityChanged(ConnectivityResult result) {
    final wasConnected = _isConnected;
    _connectivityResult = result;
    _isConnected = result != ConnectivityResult.none;
    
    // Only notify if connection status actually changed
    if (wasConnected != _isConnected) {
      notifyListeners();
    }
  }

  // Handle connectivity errors
  void _onConnectivityError(dynamic error) {
    debugPrint('Connectivity error: $error');
    // Assume no connection on error
    _connectivityResult = ConnectivityResult.none;
    _isConnected = false;
    notifyListeners();
  }

  // Check connectivity manually
  Future<bool> checkConnectivity() async {
    try {
      final result = await _connectivity.checkConnectivity();
      _connectivityResult = result;
      _isConnected = result != ConnectivityResult.none;
      notifyListeners();
      return _isConnected;
    } catch (e) {
      debugPrint('Error checking connectivity: $e');
      return false;
    }
  }

  // Get connection type string
  String get connectionTypeString {
    switch (_connectivityResult) {
      case ConnectivityResult.wifi:
        return 'WiFi';
      case ConnectivityResult.mobile:
        return 'Mobile Data';
      case ConnectivityResult.ethernet:
        return 'Ethernet';
      case ConnectivityResult.bluetooth:
        return 'Bluetooth';
      case ConnectivityResult.vpn:
        return 'VPN';
      case ConnectivityResult.other:
        return 'Other';
      case ConnectivityResult.none:
        return 'No Connection';
    }
  }

  // Get connection type description
  String get connectionTypeDescription {
    switch (_connectivityResult) {
      case ConnectivityResult.wifi:
        return 'Connected via WiFi';
      case ConnectivityResult.mobile:
        return 'Connected via Mobile Data';
      case ConnectivityResult.ethernet:
        return 'Connected via Ethernet';
      case ConnectivityResult.bluetooth:
        return 'Connected via Bluetooth';
      case ConnectivityResult.vpn:
        return 'Connected via VPN';
      case ConnectivityResult.other:
        return 'Connected via Other';
      case ConnectivityResult.none:
        return 'No internet connection';
    }
  }

  // Get connection status icon
  String get connectionStatusIcon {
    switch (_connectivityResult) {
      case ConnectivityResult.wifi:
        return '📶';
      case ConnectivityResult.mobile:
        return '📱';
      case ConnectivityResult.ethernet:
        return '🔌';
      case ConnectivityResult.bluetooth:
        return '📡';
      case ConnectivityResult.vpn:
        return '🔒';
      case ConnectivityResult.other:
        return '🌐';
      case ConnectivityResult.none:
        return '❌';
    }
  }

  // Check if connection is stable (not VPN or other)
  bool get isStableConnection {
    return _isConnected && 
           (_connectivityResult == ConnectivityResult.wifi ||
            _connectivityResult == ConnectivityResult.mobile ||
            _connectivityResult == ConnectivityResult.ethernet);
  }

  // Check if connection is fast (WiFi or Ethernet)
  bool get isFastConnection {
    return _isConnected && 
           (_connectivityResult == ConnectivityResult.wifi ||
            _connectivityResult == ConnectivityResult.ethernet);
  }

  // Check if connection is mobile
  bool get isMobileConnection {
    return _isConnected && _connectivityResult == ConnectivityResult.mobile;
  }

  // Check if connection is secure (WiFi, Ethernet, or VPN)
  bool get isSecureConnection {
    return _isConnected && 
           (_connectivityResult == ConnectivityResult.wifi ||
            _connectivityResult == ConnectivityResult.ethernet ||
            _connectivityResult == ConnectivityResult.vpn);
  }

  // Get connection quality (1-5 scale)
  int get connectionQuality {
    if (!_isConnected) return 0;
    
    switch (_connectivityResult) {
      case ConnectivityResult.wifi:
        return 5; // Best
      case ConnectivityResult.ethernet:
        return 5; // Best
      case ConnectivityResult.mobile:
        return 3; // Medium
      case ConnectivityResult.vpn:
        return 4; // Good
      case ConnectivityResult.bluetooth:
        return 2; // Poor
      case ConnectivityResult.other:
        return 1; // Very poor
      case ConnectivityResult.none:
        return 0; // No connection
    }
  }

  // Get connection quality description
  String get connectionQualityDescription {
    final quality = connectionQuality;
    switch (quality) {
      case 0:
        return 'No Connection';
      case 1:
        return 'Very Poor';
      case 2:
        return 'Poor';
      case 3:
        return 'Fair';
      case 4:
        return 'Good';
      case 5:
        return 'Excellent';
      default:
        return 'Unknown';
    }
  }

  // Get connection quality color
  int get connectionQualityColor {
    final quality = connectionQuality;
    switch (quality) {
      case 0:
        return 0xFFE53E3E; // Red
      case 1:
        return 0xFFE53E3E; // Red
      case 2:
        return 0xFFF56565; // Light red
      case 3:
        return 0xFFECC94B; // Yellow
      case 4:
        return 0xFF48BB78; // Light green
      case 5:
        return 0xFF38A169; // Green
      default:
        return 0xFF718096; // Gray
    }
  }

  // Check if connection is suitable for data sync
  bool get isSuitableForDataSync {
    return isStableConnection && connectionQuality >= 3;
  }

  // Check if connection is suitable for file upload
  bool get isSuitableForFileUpload {
    return isFastConnection && connectionQuality >= 4;
  }

  // Check if connection is suitable for video streaming
  bool get isSuitableForVideoStreaming {
    return isFastConnection && connectionQuality >= 4;
  }

  // Check if connection is suitable for voice calls
  bool get isSuitableForVoiceCalls {
    return isStableConnection && connectionQuality >= 3;
  }

  // Get recommended actions based on connection
  List<String> get recommendedActions {
    final actions = <String>[];
    
    if (!_isConnected) {
      actions.add('Check your internet connection');
      actions.add('Try connecting to WiFi');
      actions.add('Enable mobile data');
    } else if (_connectivityResult == ConnectivityResult.mobile) {
      actions.add('Consider connecting to WiFi for better performance');
      actions.add('Monitor your data usage');
    } else if (_connectivityResult == ConnectivityResult.vpn) {
      actions.add('VPN may slow down your connection');
      actions.add('Consider disconnecting VPN if not needed');
    } else if (_connectivityResult == ConnectivityResult.bluetooth) {
      actions.add('Bluetooth connection may be slow');
      actions.add('Consider using WiFi or mobile data');
    }
    
    return actions;
  }

  // Get connection troubleshooting tips
  List<String> get troubleshootingTips {
    final tips = <String>[];
    
    if (!_isConnected) {
      tips.add('Restart your router/modem');
      tips.add('Check if other devices can connect');
      tips.add('Try turning WiFi off and on');
      tips.add('Check your internet service provider');
    } else if (connectionQuality < 3) {
      tips.add('Move closer to your WiFi router');
      tips.add('Check for interference from other devices');
      tips.add('Try a different WiFi channel');
      tips.add('Restart your router');
    }
    
    return tips;
  }

  // Get connection statistics
  Map<String, dynamic> get connectionStats {
    return {
      'isConnected': _isConnected,
      'connectionType': _connectivityResult.toString(),
      'connectionTypeString': connectionTypeString,
      'connectionQuality': connectionQuality,
      'connectionQualityDescription': connectionQualityDescription,
      'isStable': isStableConnection,
      'isFast': isFastConnection,
      'isSecure': isSecureConnection,
      'isMobile': isMobileConnection,
      'suitableForDataSync': isSuitableForDataSync,
      'suitableForFileUpload': isSuitableForFileUpload,
      'suitableForVideoStreaming': isSuitableForVideoStreaming,
      'suitableForVoiceCalls': isSuitableForVoiceCalls,
      'recommendedActions': recommendedActions,
      'troubleshootingTips': troubleshootingTips,
    };
  }

  // Wait for connection to be available
  Future<bool> waitForConnection({Duration timeout = const Duration(seconds: 30)}) async {
    if (_isConnected) return true;
    
    final completer = Completer<bool>();
    Timer? timeoutTimer;
    StreamSubscription<ConnectivityResult>? subscription;
    
    timeoutTimer = Timer(timeout, () {
      subscription?.cancel();
      if (!completer.isCompleted) {
        completer.complete(false);
      }
    });
    
    subscription = _connectivity.onConnectivityChanged.listen((result) {
      if (result != ConnectivityResult.none) {
        timeoutTimer?.cancel();
        subscription?.cancel();
        if (!completer.isCompleted) {
          completer.complete(true);
        }
      }
    });
    
    return completer.future;
  }

  // Wait for stable connection
  Future<bool> waitForStableConnection({Duration timeout = const Duration(seconds: 60)}) async {
    if (isStableConnection) return true;
    
    final completer = Completer<bool>();
    Timer? timeoutTimer;
    StreamSubscription<ConnectivityResult>? subscription;
    
    timeoutTimer = Timer(timeout, () {
      subscription?.cancel();
      if (!completer.isCompleted) {
        completer.complete(false);
      }
    });
    
    subscription = _connectivity.onConnectivityChanged.listen((result) {
      if (result == ConnectivityResult.wifi ||
          result == ConnectivityResult.mobile ||
          result == ConnectivityResult.ethernet) {
        timeoutTimer?.cancel();
        subscription?.cancel();
        if (!completer.isCompleted) {
          completer.complete(true);
        }
      }
    });
    
    return completer.future;
  }

  // Dispose resources
  @override
  void dispose() {
    _connectivitySubscription?.cancel();
    super.dispose();
  }
} 