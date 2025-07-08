import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:hive_flutter/hive_flutter.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  late Box _settingsBox;
  late Box _cacheBox;
  late Box _userDataBox;

  // Initialize storage
  static Future<void> initialize() async {
    final instance = StorageService();
    await instance._initialize();
  }

  Future<void> _initialize() async {
    // Initialize Hive boxes
    _settingsBox = await Hive.openBox('settings');
    _cacheBox = await Hive.openBox('cache');
    _userDataBox = await Hive.openBox('user_data');
  }

  // Settings storage
  Future<void> setSetting(String key, dynamic value) async {
    await _settingsBox.put(key, value);
  }

  dynamic getSetting(String key, {dynamic defaultValue}) {
    return _settingsBox.get(key, defaultValue: defaultValue);
  }

  Future<void> removeSetting(String key) async {
    await _settingsBox.delete(key);
  }

  Future<void> clearSettings() async {
    await _settingsBox.clear();
  }

  // Cache storage
  Future<void> setCache(String key, dynamic value, {Duration? expiry}) async {
    final cacheData = {
      'data': value,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'expiry': expiry?.inMilliseconds,
    };
    await _cacheBox.put(key, jsonEncode(cacheData));
  }

  dynamic getCache(String key) {
    final cacheJson = _cacheBox.get(key);
    if (cacheJson == null) return null;

    try {
      final cacheData = jsonDecode(cacheJson);
      final timestamp = cacheData['timestamp'] as int;
      final expiry = cacheData['expiry'] as int?;
      
      // Check if cache is expired
      if (expiry != null) {
        final expiryTime = timestamp + expiry;
        if (DateTime.now().millisecondsSinceEpoch > expiryTime) {
          _cacheBox.delete(key);
          return null;
        }
      }
      
      return cacheData['data'];
    } catch (e) {
      // Invalid cache data, remove it
      _cacheBox.delete(key);
      return null;
    }
  }

  Future<void> removeCache(String key) async {
    await _cacheBox.delete(key);
  }

  Future<void> clearCache() async {
    await _cacheBox.clear();
  }

  Future<void> clearExpiredCache() async {
    final keys = _cacheBox.keys.toList();
    for (final key in keys) {
      getCache(key); // This will automatically remove expired cache
    }
  }

  // User data storage
  Future<void> setUserData(String key, dynamic value) async {
    await _userDataBox.put(key, value);
  }

  dynamic getUserData(String key, {dynamic defaultValue}) {
    return _userDataBox.get(key, defaultValue: defaultValue);
  }

  Future<void> removeUserData(String key) async {
    await _userDataBox.delete(key);
  }

  Future<void> clearUserData() async {
    await _userDataBox.clear();
  }

  // Secure storage (for sensitive data)
  Future<void> setSecureData(String key, String value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('secure_$key', value);
  }

  Future<String?> getSecureData(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('secure_$key');
  }

  Future<void> removeSecureData(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('secure_$key');
  }

  // App preferences
  Future<void> setThemeMode(String mode) async {
    await setSetting('theme_mode', mode);
  }

  String getThemeMode() {
    return getSetting('theme_mode', defaultValue: 'system');
  }

  Future<void> setLanguage(String language) async {
    await setSetting('language', language);
  }

  String getLanguage() {
    return getSetting('language', defaultValue: 'id');
  }

  Future<void> setCurrency(String currency) async {
    await setSetting('currency', currency);
  }

  String getCurrency() {
    return getSetting('currency', defaultValue: 'IDR');
  }

  Future<void> setBiometricEnabled(bool enabled) async {
    await setSetting('biometric_enabled', enabled);
  }

  bool isBiometricEnabled() {
    return getSetting('biometric_enabled', defaultValue: false);
  }

  Future<void> setNotificationsEnabled(bool enabled) async {
    await setSetting('notifications_enabled', enabled);
  }

  bool areNotificationsEnabled() {
    return getSetting('notifications_enabled', defaultValue: true);
  }

  Future<void> setOfflineModeEnabled(bool enabled) async {
    await setSetting('offline_mode_enabled', enabled);
  }

  bool isOfflineModeEnabled() {
    return getSetting('offline_mode_enabled', defaultValue: true);
  }

  // Data synchronization
  Future<void> setLastSyncTime(DateTime time) async {
    await setSetting('last_sync_time', time.millisecondsSinceEpoch);
  }

  DateTime? getLastSyncTime() {
    final timestamp = getSetting('last_sync_time');
    if (timestamp != null) {
      return DateTime.fromMillisecondsSinceEpoch(timestamp);
    }
    return null;
  }

  Future<void> setSyncStatus(String status) async {
    await setSetting('sync_status', status);
  }

  String getSyncStatus() {
    return getSetting('sync_status', defaultValue: 'idle');
  }

  // Offline data management
  Future<void> storeOfflineData(String key, Map<String, dynamic> data) async {
    await setUserData('offline_$key', jsonEncode(data));
  }

  Map<String, dynamic>? getOfflineData(String key) {
    final data = getUserData('offline_$key');
    if (data != null) {
      try {
        return jsonDecode(data);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  Future<void> removeOfflineData(String key) async {
    await removeUserData('offline_$key');
  }

  // Storage statistics
  Future<Map<String, int>> getStorageStats() async {
    final settingsSize = _settingsBox.length;
    final cacheSize = _cacheBox.length;
    final userDataSize = _userDataBox.length;
    
    return {
      'settings': settingsSize,
      'cache': cacheSize,
      'user_data': userDataSize,
      'total': settingsSize + cacheSize + userDataSize,
    };
  }

  // Clean up storage
  Future<void> cleanup() async {
    // Clear expired cache
    await clearExpiredCache();
    
    // Clear old cache (older than 7 days)
    final keys = _cacheBox.keys.toList();
    final weekAgo = DateTime.now().subtract(const Duration(days: 7)).millisecondsSinceEpoch;
    
    for (final key in keys) {
      final cacheJson = _cacheBox.get(key);
      if (cacheJson != null) {
        try {
          final cacheData = jsonDecode(cacheJson);
          final timestamp = cacheData['timestamp'] as int;
          if (timestamp < weekAgo) {
            await _cacheBox.delete(key);
          }
        } catch (e) {
          await _cacheBox.delete(key);
        }
      }
    }
  }

  // Export data
  Future<Map<String, dynamic>> exportData() async {
    final settings = <String, dynamic>{};
    final cache = <String, dynamic>{};
    final userData = <String, dynamic>{};

    // Export settings
    for (final key in _settingsBox.keys) {
      settings[key.toString()] = _settingsBox.get(key);
    }

    // Export cache
    for (final key in _cacheBox.keys) {
      cache[key.toString()] = _cacheBox.get(key);
    }

    // Export user data
    for (final key in _userDataBox.keys) {
      userData[key.toString()] = _userDataBox.get(key);
    }

    return {
      'settings': settings,
      'cache': cache,
      'user_data': userData,
      'exported_at': DateTime.now().toIso8601String(),
    };
  }

  // Import data
  Future<void> importData(Map<String, dynamic> data) async {
    // Import settings
    if (data['settings'] != null) {
      final settings = data['settings'] as Map<String, dynamic>;
      for (final entry in settings.entries) {
        await _settingsBox.put(entry.key, entry.value);
      }
    }

    // Import cache
    if (data['cache'] != null) {
      final cache = data['cache'] as Map<String, dynamic>;
      for (final entry in cache.entries) {
        await _cacheBox.put(entry.key, entry.value);
      }
    }

    // Import user data
    if (data['user_data'] != null) {
      final userData = data['user_data'] as Map<String, dynamic>;
      for (final entry in userData.entries) {
        await _userDataBox.put(entry.key, entry.value);
      }
    }
  }

  // Clear all data
  Future<void> clearAllData() async {
    await clearSettings();
    await clearCache();
    await clearUserData();
  }

  // Close storage
  Future<void> close() async {
    await _settingsBox.close();
    await _cacheBox.close();
    await _userDataBox.close();
  }
} 