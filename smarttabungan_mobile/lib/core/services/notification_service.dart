import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../app.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  
  String? _fcmToken;
  bool _isInitialized = false;
  bool _isPermissionGranted = false;

  // Getters
  String? get fcmToken => _fcmToken;
  bool get isInitialized => _isInitialized;
  bool get isPermissionGranted => _isPermissionGranted;

  // Initialize service
  static Future<void> initialize() async {
    final instance = NotificationService();
    await instance._initialize();
  }

  Future<void> _initialize() async {
    if (_isInitialized) return;

    try {
      // Initialize local notifications
      await _initializeLocalNotifications();
      
      // Request permission for push notifications
      await _requestPermission();
      
      // Get FCM token
      await _getFCMToken();
      
      // Setup message handlers
      await _setupMessageHandlers();
      
      _isInitialized = true;
      debugPrint('Notification service initialized successfully');
    } catch (e) {
      debugPrint('Error initializing notification service: $e');
    }
  }

  // Initialize local notifications
  Future<void> _initializeLocalNotifications() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    
    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const InitializationSettings initializationSettings =
        InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );
    
    await _localNotifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
  }

  // Request permission for push notifications
  Future<void> _requestPermission() async {
    try {
      final settings = await _firebaseMessaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );
      
      _isPermissionGranted = settings.authorizationStatus == AuthorizationStatus.authorized;
      
      debugPrint('Notification permission status: ${settings.authorizationStatus}');
    } catch (e) {
      debugPrint('Error requesting notification permission: $e');
      _isPermissionGranted = false;
    }
  }

  // Get FCM token
  Future<void> _getFCMToken() async {
    try {
      _fcmToken = await _firebaseMessaging.getToken();
      debugPrint('FCM Token: $_fcmToken');
      
      // Save token to local storage
      if (_fcmToken != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('fcm_token', _fcmToken!);
      }
    } catch (e) {
      debugPrint('Error getting FCM token: $e');
    }
  }

  // Setup message handlers
  Future<void> _setupMessageHandlers() async {
    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    
    // Handle notification taps when app is in background
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
    
    // Handle notification tap when app is terminated
    final initialMessage = await _firebaseMessaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationTap(initialMessage);
    }
  }

  // Handle foreground message
  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('Received foreground message: ${message.messageId}');
    
    // Show local notification
    _showLocalNotification(
      id: message.hashCode,
      title: message.notification?.title ?? 'SmartTabungan',
      body: message.notification?.body ?? '',
      payload: jsonEncode(message.data),
    );
  }

  // Handle notification tap
  void _handleNotificationTap(RemoteMessage message) {
    debugPrint('Notification tapped: ${message.messageId}');
    
    // Handle different notification types based on data
    final data = message.data;
    final type = data['type'];
    
    switch (type) {
      case 'transaction':
        _handleTransactionNotification(data);
        break;
      case 'budget':
        _handleBudgetNotification(data);
        break;
      case 'goal':
        _handleGoalNotification(data);
        break;
      case 'reminder':
        _handleReminderNotification(data);
        break;
      default:
        _handleGeneralNotification(data);
        break;
    }
  }

  // Handle local notification tap
  void _onNotificationTapped(NotificationResponse response) {
    debugPrint('Local notification tapped: ${response.payload}');
    
    if (response.payload != null) {
      try {
        final data = jsonDecode(response.payload!);
        _handleNotificationTap(RemoteMessage(data: data));
      } catch (e) {
        debugPrint('Error parsing notification payload: $e');
      }
    }
  }

  // Show local notification
  Future<void> _showLocalNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'smarttabungan_channel',
      'SmartTabungan Notifications',
      channelDescription: 'Notifications for SmartTabungan app',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: true,
      enableVibration: true,
      playSound: true,
    );

    const DarwinNotificationDetails iOSPlatformChannelSpecifics =
        DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const NotificationDetails platformChannelSpecifics =
        NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: iOSPlatformChannelSpecifics,
    );

    await _localNotifications.show(
      id,
      title,
      body,
      platformChannelSpecifics,
      payload: payload,
    );
  }

  // Handle transaction notification
  void _handleTransactionNotification(Map<String, dynamic> data) {
    // Navigate to transaction details
    debugPrint('Handling transaction notification: $data');
    // TODO: Implement navigation to transaction details
  }

  // Handle budget notification
  void _handleBudgetNotification(Map<String, dynamic> data) {
    // Navigate to budget details
    debugPrint('Handling budget notification: $data');
    // TODO: Implement navigation to budget details
  }

  // Handle goal notification
  void _handleGoalNotification(Map<String, dynamic> data) {
    // Navigate to goal details
    debugPrint('Handling goal notification: $data');
    // TODO: Implement navigation to goal details
  }

  // Handle reminder notification
  void _handleReminderNotification(Map<String, dynamic> data) {
    // Navigate to reminder details
    debugPrint('Handling reminder notification: $data');
    // TODO: Implement navigation to reminder details
  }

  // Handle general notification
  void _handleGeneralNotification(Map<String, dynamic> data) {
    // Navigate to general notification center
    debugPrint('Handling general notification: $data');
    // TODO: Implement navigation to notification center
  }

  // Show custom notification
  Future<void> showNotification({
    required String title,
    required String body,
    String? payload,
    int? id,
  }) async {
    final notificationId = id ?? DateTime.now().millisecondsSinceEpoch;
    
    await _showLocalNotification(
      id: notificationId,
      title: title,
      body: body,
      payload: payload,
    );
  }

  // Show transaction notification
  Future<void> showTransactionNotification({
    required String transactionId,
    required String amount,
    required String category,
    required String type,
  }) async {
    final title = type == 'expense' ? 'Pengeluaran Baru' : 'Pemasukan Baru';
    final body = '$type: $amount - $category';
    final payload = jsonEncode({
      'type': 'transaction',
      'transactionId': transactionId,
      'amount': amount,
      'category': category,
      'type': type,
    });

    await showNotification(
      title: title,
      body: body,
      payload: payload,
    );
  }

  // Show budget notification
  Future<void> showBudgetNotification({
    required String budgetId,
    required String budgetName,
    required double spent,
    required double limit,
  }) async {
    final percentage = (spent / limit * 100).toInt();
    String title, body;
    
    if (percentage >= 90) {
      title = 'Budget Hampir Habis!';
      body = '$budgetName: ${percentage}% terpakai';
    } else if (percentage >= 100) {
      title = 'Budget Melebihi Batas!';
      body = '$budgetName: ${percentage}% terpakai';
    } else {
      title = 'Update Budget';
      body = '$budgetName: ${percentage}% terpakai';
    }

    final payload = jsonEncode({
      'type': 'budget',
      'budgetId': budgetId,
      'budgetName': budgetName,
      'spent': spent,
      'limit': limit,
      'percentage': percentage,
    });

    await showNotification(
      title: title,
      body: body,
      payload: payload,
    );
  }

  // Show goal notification
  Future<void> showGoalNotification({
    required String goalId,
    required String goalName,
    required double current,
    required double target,
  }) async {
    final percentage = (current / target * 100).toInt();
    String title, body;
    
    if (percentage >= 100) {
      title = 'Selamat! Goal Tercapai!';
      body = '$goalName telah mencapai target!';
    } else if (percentage >= 80) {
      title = 'Goal Hampir Tercapai!';
      body = '$goalName: ${percentage}% tercapai';
    } else {
      title = 'Update Progress Goal';
      body = '$goalName: ${percentage}% tercapai';
    }

    final payload = jsonEncode({
      'type': 'goal',
      'goalId': goalId,
      'goalName': goalName,
      'current': current,
      'target': target,
      'percentage': percentage,
    });

    await showNotification(
      title: title,
      body: body,
      payload: payload,
    );
  }

  // Show reminder notification
  Future<void> showReminderNotification({
    required String reminderId,
    required String title,
    required String message,
    required DateTime dueDate,
  }) async {
    final body = message.isNotEmpty ? message : 'Jangan lupa untuk mengecek keuangan Anda';
    
    final payload = jsonEncode({
      'type': 'reminder',
      'reminderId': reminderId,
      'title': title,
      'message': message,
      'dueDate': dueDate.toIso8601String(),
    });

    await showNotification(
      title: title,
      body: body,
      payload: payload,
    );
  }

  // Schedule notification
  Future<void> scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
  }) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'smarttabungan_channel',
      'SmartTabungan Notifications',
      channelDescription: 'Notifications for SmartTabungan app',
      importance: Importance.max,
      priority: Priority.high,
    );

    const NotificationDetails platformChannelSpecifics =
        NotificationDetails(android: androidPlatformChannelSpecifics);

    await _localNotifications.zonedSchedule(
      id,
      title,
      body,
      scheduledDate,
      platformChannelSpecifics,
      androidAllowWhileIdle: true,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      payload: payload,
    );
  }

  // Cancel notification
  Future<void> cancelNotification(int id) async {
    await _localNotifications.cancel(id);
  }

  // Cancel all notifications
  Future<void> cancelAllNotifications() async {
    await _localNotifications.cancelAll();
  }

  // Get pending notifications
  Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    return await _localNotifications.pendingNotificationRequests();
  }

  // Subscribe to topic
  Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
    debugPrint('Subscribed to topic: $topic');
  }

  // Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic) async {
    await _firebaseMessaging.unsubscribeFromTopic(topic);
    debugPrint('Unsubscribed from topic: $topic');
  }

  // Get notification settings
  Future<NotificationSettings> getNotificationSettings() async {
    return await _firebaseMessaging.getNotificationSettings();
  }

  // Update FCM token on server
  Future<void> updateFCMTokenOnServer(String userId) async {
    if (_fcmToken == null) return;
    
    try {
      // TODO: Implement API call to update FCM token on server
      debugPrint('Updating FCM token on server for user: $userId');
    } catch (e) {
      debugPrint('Error updating FCM token on server: $e');
    }
  }

  // Clear notification badge (iOS)
  Future<void> clearBadge() async {
    await _firebaseMessaging.setApplicationIconBadgeNumber(0);
  }

  // Get notification statistics
  Map<String, dynamic> getNotificationStats() {
    return {
      'isInitialized': _isInitialized,
      'isPermissionGranted': _isPermissionGranted,
      'fcmToken': _fcmToken,
      'hasFCMToken': _fcmToken != null,
    };
  }
}

// Background message handler
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('Handling background message: ${message.messageId}');
  
  // Handle background message
  final data = message.data;
  final type = data['type'];
  
  switch (type) {
    case 'transaction':
      // Handle transaction background notification
      break;
    case 'budget':
      // Handle budget background notification
      break;
    case 'goal':
      // Handle goal background notification
      break;
    case 'reminder':
      // Handle reminder background notification
      break;
    default:
      // Handle general background notification
      break;
  }
} 