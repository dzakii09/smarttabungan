import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../../core/services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  
  User? _user;
  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _error;

  // Getters
  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get error => _error;
  bool get hasError => _error != null;

  // Initialize provider
  Future<void> initialize() async {
    await _authService.initialize();
    await checkAuthStatus();
  }

  // Check authentication status
  Future<void> checkAuthStatus() async {
    _setLoading(true);
    _clearError();
    
    try {
      _isAuthenticated = _authService.isAuthenticated;
      _user = _authService.currentUser;
    } catch (e) {
      _setError('Terjadi kesalahan saat memeriksa status autentikasi');
    } finally {
      _setLoading(false);
    }
  }

  // Login
  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _clearError();
    
    try {
      final user = await _authService.login(email, password);
      _user = user;
      _isAuthenticated = true;
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Register
  Future<bool> register(String name, String email, String password) async {
    _setLoading(true);
    _clearError();
    
    try {
      final user = await _authService.register(name, email, password);
      _user = user;
      _isAuthenticated = true;
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Logout
  Future<void> logout() async {
    _setLoading(true);
    _clearError();
    
    try {
      await _authService.logout();
      _user = null;
      _isAuthenticated = false;
      notifyListeners();
    } catch (e) {
      _setError('Terjadi kesalahan saat logout');
    } finally {
      _setLoading(false);
    }
  }

  // Refresh token
  Future<void> refreshToken() async {
    try {
      await _authService.refreshToken();
      _user = _authService.currentUser;
      _isAuthenticated = _authService.isAuthenticated;
      notifyListeners();
    } catch (e) {
      // Token refresh failed, logout user
      await logout();
    }
  }

  // Update user profile
  Future<bool> updateProfile(String name, String email) async {
    _setLoading(true);
    _clearError();
    
    try {
      final updatedUser = await _authService.updateProfile(name, email);
      _user = updatedUser;
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Change password
  Future<bool> changePassword(String currentPassword, String newPassword) async {
    _setLoading(true);
    _clearError();
    
    try {
      await _authService.changePassword(currentPassword, newPassword);
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Forgot password
  Future<bool> forgotPassword(String email) async {
    _setLoading(true);
    _clearError();
    
    try {
      await _authService.forgotPassword(email);
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Reset password
  Future<bool> resetPassword(String token, String newPassword) async {
    _setLoading(true);
    _clearError();
    
    try {
      await _authService.resetPassword(token, newPassword);
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Delete account
  Future<bool> deleteAccount(String password) async {
    _setLoading(true);
    _clearError();
    
    try {
      await _authService.deleteAccount(password);
      _user = null;
      _isAuthenticated = false;
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Biometric authentication
  Future<bool> isBiometricAvailable() async {
    return await _authService.isBiometricAvailable();
  }

  Future<List<dynamic>> getAvailableBiometrics() async {
    return await _authService.getAvailableBiometrics();
  }

  Future<bool> authenticateWithBiometrics() async {
    return await _authService.authenticateWithBiometrics();
  }

  Future<void> enableBiometric() async {
    await _authService.enableBiometric();
  }

  Future<void> disableBiometric() async {
    await _authService.disableBiometric();
  }

  Future<bool> isBiometricEnabled() async {
    return await _authService.isBiometricEnabled();
  }

  // Validation methods
  bool isValidEmail(String email) {
    return _authService.isValidEmail(email);
  }

  bool isStrongPassword(String password) {
    return _authService.isStrongPassword(password);
  }

  // Update user preferences
  void updateUserPreferences(String key, dynamic value) {
    if (_user != null) {
      _user = _user!.setPreference(key, value);
      notifyListeners();
    }
  }

  // Get user preference
  dynamic getUserPreference(String key, {dynamic defaultValue}) {
    return _user?.getPreference(key, defaultValue: defaultValue);
  }

  // Check if user has specific preference
  bool hasUserPreference(String key) {
    return _user?.userPreferences.containsKey(key) ?? false;
  }

  // Clear user preference
  void clearUserPreference(String key) {
    if (_user != null) {
      _user = _user!.removePreference(key);
      notifyListeners();
    }
  }

  // Private methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }

  // Clear all data (for testing or reset)
  void clear() {
    _user = null;
    _isAuthenticated = false;
    _isLoading = false;
    _error = null;
    notifyListeners();
  }
} 