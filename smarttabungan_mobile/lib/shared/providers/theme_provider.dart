import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../app.dart';

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;
  bool _isDarkMode = false;

  // Getters
  ThemeMode get themeMode => _themeMode;
  bool get isDarkMode => _isDarkMode;
  ThemeData get lightTheme => AppConfig.lightTheme;
  ThemeData get darkTheme => AppConfig.darkTheme;

  // Initialize provider
  Future<void> initialize() async {
    await _loadThemePreference();
  }

  // Load theme preference from storage
  Future<void> _loadThemePreference() async {
    final prefs = await SharedPreferences.getInstance();
    final themeString = prefs.getString('theme_mode') ?? 'system';
    
    switch (themeString) {
      case 'light':
        _themeMode = ThemeMode.light;
        _isDarkMode = false;
        break;
      case 'dark':
        _themeMode = ThemeMode.dark;
        _isDarkMode = true;
        break;
      case 'system':
      default:
        _themeMode = ThemeMode.system;
        _isDarkMode = _isSystemDarkMode();
        break;
    }
    
    notifyListeners();
  }

  // Save theme preference to storage
  Future<void> _saveThemePreference() async {
    final prefs = await SharedPreferences.getInstance();
    String themeString;
    
    switch (_themeMode) {
      case ThemeMode.light:
        themeString = 'light';
        break;
      case ThemeMode.dark:
        themeString = 'dark';
        break;
      case ThemeMode.system:
      default:
        themeString = 'system';
        break;
    }
    
    await prefs.setString('theme_mode', themeString);
  }

  // Check if system is in dark mode
  bool _isSystemDarkMode() {
    final brightness = WidgetsBinding.instance.platformDispatcher.platformBrightness;
    return brightness == Brightness.dark;
  }

  // Set theme mode
  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    
    switch (mode) {
      case ThemeMode.light:
        _isDarkMode = false;
        break;
      case ThemeMode.dark:
        _isDarkMode = true;
        break;
      case ThemeMode.system:
        _isDarkMode = _isSystemDarkMode();
        break;
    }
    
    await _saveThemePreference();
    notifyListeners();
  }

  // Toggle between light and dark mode
  Future<void> toggleTheme() async {
    if (_themeMode == ThemeMode.system) {
      // If system mode, switch to light
      await setThemeMode(ThemeMode.light);
    } else if (_themeMode == ThemeMode.light) {
      // If light mode, switch to dark
      await setThemeMode(ThemeMode.dark);
    } else {
      // If dark mode, switch to light
      await setThemeMode(ThemeMode.light);
    }
  }

  // Set light theme
  Future<void> setLightTheme() async {
    await setThemeMode(ThemeMode.light);
  }

  // Set dark theme
  Future<void> setDarkTheme() async {
    await setThemeMode(ThemeMode.dark);
  }

  // Set system theme
  Future<void> setSystemTheme() async {
    await setThemeMode(ThemeMode.system);
  }

  // Get current theme data
  ThemeData get currentTheme {
    switch (_themeMode) {
      case ThemeMode.light:
        return lightTheme;
      case ThemeMode.dark:
        return darkTheme;
      case ThemeMode.system:
        return _isDarkMode ? darkTheme : lightTheme;
    }
  }

  // Get current color scheme
  ColorScheme get currentColorScheme {
    return currentTheme.colorScheme;
  }

  // Get primary color
  Color get primaryColor {
    return currentColorScheme.primary;
  }

  // Get secondary color
  Color get secondaryColor {
    return currentColorScheme.secondary;
  }

  // Get background color
  Color get backgroundColor {
    return currentColorScheme.background;
  }

  // Get surface color
  Color get surfaceColor {
    return currentColorScheme.surface;
  }

  // Get on primary color
  Color get onPrimaryColor {
    return currentColorScheme.onPrimary;
  }

  // Get on secondary color
  Color get onSecondaryColor {
    return currentColorScheme.onSecondary;
  }

  // Get on background color
  Color get onBackgroundColor {
    return currentColorScheme.onBackground;
  }

  // Get on surface color
  Color get onSurfaceColor {
    return currentColorScheme.onSurface;
  }

  // Get error color
  Color get errorColor {
    return currentColorScheme.error;
  }

  // Get on error color
  Color get onErrorColor {
    return currentColorScheme.onError;
  }

  // Get outline color
  Color get outlineColor {
    return currentColorScheme.outline;
  }

  // Get outline variant color
  Color get outlineVariantColor {
    return currentColorScheme.outlineVariant;
  }

  // Get shadow color
  Color get shadowColor {
    return currentColorScheme.shadow;
  }

  // Get scrim color
  Color get scrimColor {
    return currentColorScheme.scrim;
  }

  // Get inverse primary color
  Color get inversePrimaryColor {
    return currentColorScheme.inversePrimary;
  }

  // Get inverse surface color
  Color get inverseSurfaceColor {
    return currentColorScheme.inverseSurface;
  }

  // Get on inverse surface color
  Color get onInverseSurfaceColor {
    return currentColorScheme.onInverseSurface;
  }

  // Get surface tint color
  Color get surfaceTintColor {
    return currentColorScheme.surfaceTint;
  }

  // Get surface variant color
  Color get surfaceVariantColor {
    return currentColorScheme.surfaceVariant;
  }

  // Get on surface variant color
  Color get onSurfaceVariantColor {
    return currentColorScheme.onSurfaceVariant;
  }

  // Get tertiary color
  Color get tertiaryColor {
    return currentColorScheme.tertiary;
  }

  // Get on tertiary color
  Color get onTertiaryColor {
    return currentColorScheme.onTertiary;
  }

  // Get tertiary container color
  Color get tertiaryContainerColor {
    return currentColorScheme.tertiaryContainer;
  }

  // Get on tertiary container color
  Color get onTertiaryContainerColor {
    return currentColorScheme.onTertiaryContainer;
  }

  // Get secondary container color
  Color get secondaryContainerColor {
    return currentColorScheme.secondaryContainer;
  }

  // Get on secondary container color
  Color get onSecondaryContainerColor {
    return currentColorScheme.onSecondaryContainer;
  }

  // Get primary container color
  Color get primaryContainerColor {
    return currentColorScheme.primaryContainer;
  }

  // Get on primary container color
  Color get onPrimaryContainerColor {
    return currentColorScheme.onPrimaryContainer;
  }

  // Get error container color
  Color get errorContainerColor {
    return currentColorScheme.errorContainer;
  }

  // Get on error container color
  Color get onErrorContainerColor {
    return currentColorScheme.onErrorContainer;
  }

  // Check if current theme is dark
  bool get isCurrentThemeDark {
    return _isDarkMode;
  }

  // Check if current theme is light
  bool get isCurrentThemeLight {
    return !_isDarkMode;
  }

  // Check if using system theme
  bool get isUsingSystemTheme {
    return _themeMode == ThemeMode.system;
  }

  // Check if using custom theme
  bool get isUsingCustomTheme {
    return _themeMode != ThemeMode.system;
  }

  // Get theme mode string
  String get themeModeString {
    switch (_themeMode) {
      case ThemeMode.light:
        return 'light';
      case ThemeMode.dark:
        return 'dark';
      case ThemeMode.system:
        return 'system';
    }
  }

  // Get theme mode display name
  String get themeModeDisplayName {
    switch (_themeMode) {
      case ThemeMode.light:
        return 'Light';
      case ThemeMode.dark:
        return 'Dark';
      case ThemeMode.system:
        return 'System';
    }
  }

  // Get available theme modes
  List<ThemeMode> get availableThemeModes {
    return [ThemeMode.light, ThemeMode.dark, ThemeMode.system];
  }

  // Get theme mode options for UI
  List<Map<String, dynamic>> get themeModeOptions {
    return [
      {
        'mode': ThemeMode.light,
        'name': 'Light',
        'description': 'Always use light theme',
        'icon': Icons.light_mode,
      },
      {
        'mode': ThemeMode.dark,
        'name': 'Dark',
        'description': 'Always use dark theme',
        'icon': Icons.dark_mode,
      },
      {
        'mode': ThemeMode.system,
        'name': 'System',
        'description': 'Follow system theme',
        'icon': Icons.settings_system_daydream,
      },
    ];
  }

  // Reset to default theme
  Future<void> resetToDefault() async {
    await setThemeMode(ThemeMode.system);
  }

  // Clear theme preference
  Future<void> clearThemePreference() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('theme_mode');
    await _loadThemePreference();
  }
} 