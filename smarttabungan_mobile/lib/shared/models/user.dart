import 'dart:convert';

class User {
  final String id;
  final String name;
  final String email;
  final String? avatar;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic>? preferences;
  final bool isEmailVerified;
  final String? phoneNumber;
  final DateTime? lastLoginAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.avatar,
    required this.createdAt,
    required this.updatedAt,
    this.preferences,
    this.isEmailVerified = false,
    this.phoneNumber,
    this.lastLoginAt,
  });

  // Factory constructor from JSON
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      avatar: json['avatar'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      preferences: json['preferences'] != null 
          ? Map<String, dynamic>.from(json['preferences'])
          : null,
      isEmailVerified: json['isEmailVerified'] ?? false,
      phoneNumber: json['phoneNumber'],
      lastLoginAt: json['lastLoginAt'] != null 
          ? DateTime.parse(json['lastLoginAt'])
          : null,
    );
  }

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'avatar': avatar,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'preferences': preferences,
      'isEmailVerified': isEmailVerified,
      'phoneNumber': phoneNumber,
      'lastLoginAt': lastLoginAt?.toIso8601String(),
    };
  }

  // Create a copy with updated fields
  User copyWith({
    String? id,
    String? name,
    String? email,
    String? avatar,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? preferences,
    bool? isEmailVerified,
    String? phoneNumber,
    DateTime? lastLoginAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      avatar: avatar ?? this.avatar,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      preferences: preferences ?? this.preferences,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
    );
  }

  // Get user initials for avatar
  String get initials {
    final nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return '${nameParts[0][0]}${nameParts[1][0]}'.toUpperCase();
    }
    return name[0].toUpperCase();
  }

  // Get display name
  String get displayName {
    return name;
  }

  // Check if user has avatar
  bool get hasAvatar => avatar != null && avatar!.isNotEmpty;

  // Get user preferences
  Map<String, dynamic> get userPreferences => preferences ?? {};

  // Get specific preference
  dynamic getPreference(String key, {dynamic defaultValue}) {
    return preferences?[key] ?? defaultValue;
  }

  // Set preference (creates new user instance)
  User setPreference(String key, dynamic value) {
    final newPreferences = Map<String, dynamic>.from(preferences ?? {});
    newPreferences[key] = value;
    return copyWith(preferences: newPreferences);
  }

  // Remove preference
  User removePreference(String key) {
    if (preferences == null || !preferences!.containsKey(key)) {
      return this;
    }
    final newPreferences = Map<String, dynamic>.from(preferences!);
    newPreferences.remove(key);
    return copyWith(preferences: newPreferences);
  }

  // Check if user is active (logged in within last 30 days)
  bool get isActive {
    if (lastLoginAt == null) return false;
    final thirtyDaysAgo = DateTime.now().subtract(const Duration(days: 30));
    return lastLoginAt!.isAfter(thirtyDaysAgo);
  }

  // Get user age (if birth date is available in preferences)
  int? get age {
    final birthDate = getPreference('birthDate');
    if (birthDate == null) return null;
    
    try {
      final birth = DateTime.parse(birthDate);
      final now = DateTime.now();
      int age = now.year - birth.year;
      if (now.month < birth.month || (now.month == birth.month && now.day < birth.day)) {
        age--;
      }
      return age;
    } catch (e) {
      return null;
    }
  }

  // Get user location (if available in preferences)
  String? get location {
    return getPreference('location');
  }

  // Get user currency preference
  String get currency {
    return getPreference('currency', defaultValue: 'IDR');
  }

  // Get user language preference
  String get language {
    return getPreference('language', defaultValue: 'id');
  }

  // Get user theme preference
  String get theme {
    return getPreference('theme', defaultValue: 'system');
  }

  // Get user notification preferences
  Map<String, bool> get notificationPreferences {
    final prefs = getPreference('notifications', defaultValue: {});
    if (prefs is Map) {
      return Map<String, bool>.from(prefs);
    }
    return {
      'push': true,
      'email': true,
      'sms': false,
    };
  }

  // Check if specific notification type is enabled
  bool isNotificationEnabled(String type) {
    return notificationPreferences[type] ?? true;
  }

  // Get user security preferences
  Map<String, bool> get securityPreferences {
    final prefs = getPreference('security', defaultValue: {});
    if (prefs is Map) {
      return Map<String, bool>.from(prefs);
    }
    return {
      'biometric': false,
      'twoFactor': false,
      'sessionTimeout': true,
    };
  }

  // Check if specific security feature is enabled
  bool isSecurityEnabled(String feature) {
    return securityPreferences[feature] ?? false;
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is User && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'User(id: $id, name: $name, email: $email)';
  }
} 