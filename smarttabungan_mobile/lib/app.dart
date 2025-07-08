import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static const String appName = 'SmartTabungan';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'Kelola Keuangan dengan Cerdas';
  
  // API Configuration
  static String get apiBaseUrl => dotenv.env['API_BASE_URL'] ?? 'http://localhost:5000/api';
  static String get geminiApiKey => dotenv.env['GEMINI_API_KEY'] ?? '';
  static String get fcmServerKey => dotenv.env['FCM_SERVER_KEY'] ?? '';
  static String get midtransClientKey => dotenv.env['MIDTRANS_CLIENT_KEY'] ?? '';
  
  // App Colors
  static const Color primaryColor = Color(0xFF2563EB);
  static const Color secondaryColor = Color(0xFF3B82F6);
  static const Color accentColor = Color(0xFF10B981);
  static const Color errorColor = Color(0xFFEF4444);
  static const Color warningColor = Color(0xFFF59E0B);
  static const Color successColor = Color(0xFF10B981);
  
  // App Theme
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        brightness: Brightness.light,
      ),
      fontFamily: 'Inter',
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: Colors.black,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
        iconTheme: IconThemeData(color: Colors.black),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        filled: true,
        fillColor: Colors.grey[50],
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
  
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        brightness: Brightness.dark,
      ),
      fontFamily: 'Inter',
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
        iconTheme: IconThemeData(color: Colors.white),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        filled: true,
        fillColor: Colors.grey[800],
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
  
  // App Routes
  static const String splashRoute = '/';
  static const String authRoute = '/auth';
  static const String dashboardRoute = '/dashboard';
  static const String transactionsRoute = '/transactions';
  static const String budgetsRoute = '/budgets';
  static const String goalsRoute = '/goals';
  static const String analyticsRoute = '/analytics';
  static const String notificationsRoute = '/notifications';
  static const String settingsRoute = '/settings';
  static const String profileRoute = '/profile';
  
  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);
  
  // API Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // Cache Durations
  static const Duration shortCache = Duration(minutes: 5);
  static const Duration mediumCache = Duration(hours: 1);
  static const Duration longCache = Duration(hours: 24);
  
  // Validation Rules
  static const int minPasswordLength = 6;
  static const int maxPasswordLength = 50;
  static const int minNameLength = 2;
  static const int maxNameLength = 50;
  
  // File Upload Limits
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Currency
  static const String defaultCurrency = 'IDR';
  static const String defaultCurrencySymbol = 'Rp';
  
  // Date Formats
  static const String dateFormat = 'dd/MM/yyyy';
  static const String timeFormat = 'HH:mm';
  static const String dateTimeFormat = 'dd/MM/yyyy HH:mm';
  
  // Error Messages
  static const String networkErrorMessage = 'Koneksi internet tidak tersedia';
  static const String serverErrorMessage = 'Terjadi kesalahan pada server';
  static const String unknownErrorMessage = 'Terjadi kesalahan yang tidak diketahui';
  static const String timeoutErrorMessage = 'Permintaan timeout';
  
  // Success Messages
  static const String loginSuccessMessage = 'Login berhasil';
  static const String registerSuccessMessage = 'Registrasi berhasil';
  static const String logoutSuccessMessage = 'Logout berhasil';
  static const String saveSuccessMessage = 'Data berhasil disimpan';
  static const String deleteSuccessMessage = 'Data berhasil dihapus';
  
  // Confirmation Messages
  static const String deleteConfirmationMessage = 'Apakah Anda yakin ingin menghapus data ini?';
  static const String logoutConfirmationMessage = 'Apakah Anda yakin ingin logout?';
  
  // Loading Messages
  static const String loadingMessage = 'Memuat...';
  static const String savingMessage = 'Menyimpan...';
  static const String deletingMessage = 'Menghapus...';
  static const String syncingMessage = 'Sinkronisasi...';
  
  // Feature Flags
  static const bool enableBiometricAuth = true;
  static const bool enablePushNotifications = true;
  static const bool enableOfflineMode = true;
  static const bool enableAnalytics = true;
  static const bool enableCrashReporting = true;
  
  // Debug Configuration
  static const bool enableDebugLogs = true;
  static const bool enableNetworkLogs = true;
  static const bool enablePerformanceLogs = true;
  
  // Development Configuration
  static const bool isDevelopment = true;
  static const bool enableHotReload = true;
  static const bool enableDevTools = true;
} 