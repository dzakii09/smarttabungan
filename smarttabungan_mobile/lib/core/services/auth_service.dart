import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:local_auth/local_auth.dart';
import 'package:crypto/crypto.dart';

import '../../app.dart';
import '../../shared/models/user.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final Dio _dio = Dio();
  final LocalAuthentication _localAuth = LocalAuthentication();
  
  User? _currentUser;
  String? _token;

  // Getters
  User? get currentUser => _currentUser;
  String? get token => _token;
  bool get isAuthenticated => _token != null && _currentUser != null;

  // Initialize service
  Future<void> initialize() async {
    _dio.options.baseUrl = AppConfig.apiBaseUrl;
    _dio.options.connectTimeout = AppConfig.connectionTimeout;
    _dio.options.receiveTimeout = AppConfig.receiveTimeout;
    
    // Load stored token and user
    await _loadStoredAuth();
    
    // Setup interceptors
    _setupInterceptors();
  }

  // Setup Dio interceptors
  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (_token != null) {
            options.headers['Authorization'] = 'Bearer $_token';
          }
          handler.next(options);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            // Token expired or invalid
            logout();
          }
          handler.next(error);
        },
      ),
    );
  }

  // Load stored authentication data
  Future<void> _loadStoredAuth() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    
    final userJson = prefs.getString('auth_user');
    if (userJson != null) {
      try {
        _currentUser = User.fromJson(jsonDecode(userJson));
      } catch (e) {
        // Invalid user data, clear it
        await prefs.remove('auth_user');
      }
    }
  }

  // Store authentication data
  Future<void> _storeAuth(String token, User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    await prefs.setString('auth_user', jsonEncode(user.toJson()));
    
    _token = token;
    _currentUser = user;
  }

  // Clear stored authentication data
  Future<void> _clearStoredAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('auth_user');
    
    _token = null;
    _currentUser = null;
  }

  // Login with email and password
  Future<User> login(String email, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = response.data;
        final token = data['token'];
        final user = User.fromJson(data['user']);
        
        await _storeAuth(token, user);
        return user;
      } else {
        throw Exception('Login failed');
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        throw Exception('Email atau password salah');
      } else if (e.type == DioExceptionType.connectionTimeout) {
        throw Exception('Koneksi timeout');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception('Tidak dapat terhubung ke server');
      } else {
        throw Exception('Terjadi kesalahan saat login');
      }
    } catch (e) {
      throw Exception('Terjadi kesalahan yang tidak diketahui');
    }
  }

  // Register new user
  Future<User> register(String name, String email, String password) async {
    try {
      final response = await _dio.post('/auth/register', data: {
        'name': name,
        'email': email,
        'password': password,
      });

      if (response.statusCode == 201) {
        final data = response.data;
        final token = data['token'];
        final user = User.fromJson(data['user']);
        
        await _storeAuth(token, user);
        return user;
      } else {
        throw Exception('Registration failed');
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 409) {
        throw Exception('Email sudah terdaftar');
      } else if (e.response?.statusCode == 400) {
        throw Exception('Data tidak valid');
      } else if (e.type == DioExceptionType.connectionTimeout) {
        throw Exception('Koneksi timeout');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception('Tidak dapat terhubung ke server');
      } else {
        throw Exception('Terjadi kesalahan saat registrasi');
      }
    } catch (e) {
      throw Exception('Terjadi kesalahan yang tidak diketahui');
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      if (_token != null) {
        await _dio.post('/auth/logout');
      }
    } catch (e) {
      // Ignore logout errors
    } finally {
      await _clearStoredAuth();
    }
  }

  // Refresh token
  Future<void> refreshToken() async {
    try {
      final response = await _dio.post('/auth/refresh');
      
      if (response.statusCode == 200) {
        final data = response.data;
        final token = data['token'];
        final user = User.fromJson(data['user']);
        
        await _storeAuth(token, user);
      }
    } catch (e) {
      // Token refresh failed, logout user
      await logout();
      throw Exception('Session expired');
    }
  }

  // Check if biometric authentication is available
  Future<bool> isBiometricAvailable() async {
    try {
      final isAvailable = await _localAuth.canCheckBiometrics;
      final isDeviceSupported = await _localAuth.isDeviceSupported();
      return isAvailable && isDeviceSupported;
    } catch (e) {
      return false;
    }
  }

  // Get available biometric types
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _localAuth.getAvailableBiometrics();
    } catch (e) {
      return [];
    }
  }

  // Authenticate with biometrics
  Future<bool> authenticateWithBiometrics() async {
    try {
      return await _localAuth.authenticate(
        localizedReason: 'Autentikasi untuk mengakses SmartTabungan',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );
    } catch (e) {
      return false;
    }
  }

  // Enable biometric authentication
  Future<void> enableBiometric() async {
    if (await isBiometricAvailable()) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('biometric_enabled', true);
    }
  }

  // Disable biometric authentication
  Future<void> disableBiometric() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('biometric_enabled', false);
  }

  // Check if biometric is enabled
  Future<bool> isBiometricEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('biometric_enabled') ?? false;
  }

  // Change password
  Future<void> changePassword(String currentPassword, String newPassword) async {
    try {
      await _dio.put('/auth/change-password', data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });
    } on DioException catch (e) {
      if (e.response?.statusCode == 400) {
        throw Exception('Password saat ini salah');
      } else {
        throw Exception('Terjadi kesalahan saat mengubah password');
      }
    }
  }

  // Forgot password
  Future<void> forgotPassword(String email) async {
    try {
      await _dio.post('/auth/forgot-password', data: {
        'email': email,
      });
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw Exception('Email tidak ditemukan');
      } else {
        throw Exception('Terjadi kesalahan saat mengirim email reset password');
      }
    }
  }

  // Reset password
  Future<void> resetPassword(String token, String newPassword) async {
    try {
      await _dio.post('/auth/reset-password', data: {
        'token': token,
        'newPassword': newPassword,
      });
    } on DioException catch (e) {
      if (e.response?.statusCode == 400) {
        throw Exception('Token tidak valid atau sudah kadaluarsa');
      } else {
        throw Exception('Terjadi kesalahan saat reset password');
      }
    }
  }

  // Update user profile
  Future<User> updateProfile(String name, String email) async {
    try {
      final response = await _dio.put('/auth/profile', data: {
        'name': name,
        'email': email,
      });

      if (response.statusCode == 200) {
        final user = User.fromJson(response.data);
        _currentUser = user;
        
        // Update stored user data
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_user', jsonEncode(user.toJson()));
        
        return user;
      } else {
        throw Exception('Update profile failed');
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 409) {
        throw Exception('Email sudah digunakan');
      } else {
        throw Exception('Terjadi kesalahan saat update profile');
      }
    }
  }

  // Delete account
  Future<void> deleteAccount(String password) async {
    try {
      await _dio.delete('/auth/account', data: {
        'password': password,
      });
      
      await logout();
    } on DioException catch (e) {
      if (e.response?.statusCode == 400) {
        throw Exception('Password salah');
      } else {
        throw Exception('Terjadi kesalahan saat menghapus akun');
      }
    }
  }

  // Hash password for local storage (if needed)
  String hashPassword(String password) {
    final bytes = utf8.encode(password);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  // Validate email format
  bool isValidEmail(String email) {
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return emailRegex.hasMatch(email);
  }

  // Validate password strength
  bool isStrongPassword(String password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    final passwordRegex = RegExp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$');
    return passwordRegex.hasMatch(password);
  }
} 