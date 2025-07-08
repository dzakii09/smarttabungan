# Mobile App Setup Guide 📱

## Overview
Panduan lengkap untuk setup dan konfigurasi aplikasi mobile SmartTabungan menggunakan Flutter.

## 🚀 Prerequisites

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, atau Ubuntu 18.04+
- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: Minimum 10GB free space
- **Processor**: Multi-core processor

### Required Software
1. **Flutter SDK** (3.16.0+)
2. **Dart SDK** (3.2.0+)
3. **Android Studio** / **VS Code**
4. **Android SDK** (API level 21+)
5. **iOS SDK** (untuk development iOS - macOS only)
6. **Git**

## 📋 Installation Steps

### 1. Install Flutter SDK

#### Windows
```bash
# Download Flutter SDK dari https://flutter.dev/docs/get-started/install/windows
# Extract ke folder yang diinginkan (e.g., C:\flutter)
# Tambahkan Flutter ke PATH environment variable

# Verifikasi instalasi
flutter doctor
```

#### macOS
```bash
# Install menggunakan Homebrew
brew install flutter

# Atau download manual dari https://flutter.dev/docs/get-started/install/macos
# Extract ke folder yang diinginkan (e.g., ~/flutter)
# Tambahkan ke PATH di ~/.zshrc atau ~/.bash_profile

# Verifikasi instalasi
flutter doctor
```

#### Linux
```bash
# Download Flutter SDK
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.16.0-stable.tar.xz
tar xf flutter_linux_3.16.0-stable.tar.xz

# Tambahkan ke PATH di ~/.bashrc
export PATH="$PATH:`pwd`/flutter/bin"

# Verifikasi instalasi
flutter doctor
```

### 2. Install Android Studio

#### Download & Install
1. Download Android Studio dari https://developer.android.com/studio
2. Install dengan default settings
3. Buka Android Studio dan complete setup wizard
4. Install Android SDK (API level 21+)

#### Configure Android SDK
```bash
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS/Linux
set ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk  # Windows

# Tambahkan platform-tools ke PATH
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 3. Install VS Code (Optional but Recommended)

#### Download & Install
1. Download VS Code dari https://code.visualstudio.com/
2. Install dengan default settings
3. Install Flutter extension
4. Install Dart extension

#### VS Code Extensions
```json
{
  "recommendations": [
    "Dart-Code.flutter",
    "Dart-Code.dart-code",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### 4. Install iOS Development Tools (macOS only)

#### Install Xcode
1. Download Xcode dari App Store
2. Install Command Line Tools
```bash
xcode-select --install
```

#### Configure iOS Simulator
```bash
# List available simulators
xcrun simctl list devices

# Create new simulator
xcrun simctl create "iPhone 15" "iPhone 15" "iOS17.0"

# Boot simulator
xcrun simctl boot "iPhone 15"
```

## 🔧 Project Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd smarttabungan_mobile
```

### 2. Install Dependencies
```bash
flutter pub get
```

### 3. Setup Environment Variables
```bash
# Copy environment example
cp env.example .env

# Edit .env file dengan konfigurasi yang sesuai
nano .env
```

#### Environment Configuration
```env
# Backend API
API_BASE_URL=http://localhost:5000/api

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Push Notifications
FCM_SERVER_KEY=your-fcm-server-key-here
FIREBASE_PROJECT_ID=your-firebase-project-id

# Payment Gateway
MIDTRANS_CLIENT_KEY=your-midtrans-client-key-here
```

### 4. Configure Firebase (Optional)

#### Create Firebase Project
1. Buka https://console.firebase.google.com/
2. Create new project
3. Add Android app
4. Download `google-services.json`
5. Place di `android/app/google-services.json`

#### Add iOS App (macOS only)
1. Add iOS app di Firebase console
2. Download `GoogleService-Info.plist`
3. Place di `ios/Runner/GoogleService-Info.plist`

### 5. Configure Android

#### Update android/app/build.gradle
```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.smarttabungan.app"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
        multiDexEnabled true
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.multidex:multidex:2.0.1'
    implementation 'com.google.firebase:firebase-messaging:23.4.0'
    implementation 'com.google.firebase:firebase-analytics:21.5.0'
}
```

#### Update android/app/src/main/AndroidManifest.xml
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    
    <application
        android:label="SmartTabungan"
        android:icon="@mipmap/ic_launcher"
        android:allowBackup="true"
        android:fullBackupContent="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            
            <meta-data
                android:name="io.flutter.embedding.android.NormalTheme"
                android:resource="@style/NormalTheme" />
            
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
            
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="smarttabungan_channel" />
    </application>
</manifest>
```

### 6. Configure iOS (macOS only)

#### Update ios/Runner/Info.plist
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>SmartTabungan</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>smarttabungan_mobile</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>$(FLUTTER_BUILD_NAME)</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleVersion</key>
    <string>$(FLUTTER_BUILD_NUMBER)</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    
    <!-- Camera Permission -->
    <key>NSCameraUsageDescription</key>
    <string>This app needs camera access to take photos of receipts</string>
    
    <!-- Photo Library Permission -->
    <key>NSPhotoLibraryUsageDescription</key>
    <string>This app needs photo library access to select receipt images</string>
    
    <!-- Location Permission -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>This app needs location access to track spending patterns</string>
    
    <!-- Face ID Permission -->
    <key>NSFaceIDUsageDescription</key>
    <string>This app uses Face ID for secure authentication</string>
    
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIMainStoryboardFile</key>
    <string>Main</string>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
    <key>CADisableMinimumFrameDurationOnPhone</key>
    <true/>
    <key>UIApplicationSupportsIndirectInputEvents</key>
    <true/>
</dict>
</plist>
```

## 🚀 Running the App

### 1. Check Flutter Setup
```bash
flutter doctor
```

### 2. List Available Devices
```bash
flutter devices
```

### 3. Run on Android
```bash
# Debug mode
flutter run

# Release mode
flutter run --release

# Specific device
flutter run -d <device-id>
```

### 4. Run on iOS (macOS only)
```bash
# Debug mode
flutter run

# Release mode
flutter run --release

# Specific device
flutter run -d <device-id>
```

### 5. Run on Web
```bash
flutter run -d chrome
```

## 🧪 Testing

### 1. Unit Tests
```bash
flutter test
```

### 2. Widget Tests
```bash
flutter test test/widget_test.dart
```

### 3. Integration Tests
```bash
flutter drive --target=test_driver/app.dart
```

### 4. Test Coverage
```bash
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
```

## 📱 Building for Production

### 1. Android Build

#### Debug APK
```bash
flutter build apk --debug
```

#### Release APK
```bash
flutter build apk --release
```

#### App Bundle (Play Store)
```bash
flutter build appbundle --release
```

#### Split APKs
```bash
flutter build apk --split-per-abi --release
```

### 2. iOS Build (macOS only)

#### Debug Build
```bash
flutter build ios --debug
```

#### Release Build
```bash
flutter build ios --release
```

#### Archive for App Store
```bash
flutter build ios --release --no-codesign
# Then archive using Xcode
```

### 3. Code Signing

#### Android Signing
```bash
# Generate keystore
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload

# Configure signing in android/app/build.gradle
android {
    signingConfigs {
        release {
            keyAlias 'upload'
            keyPassword 'your-key-password'
            storeFile file('~/upload-keystore.jks')
            storePassword 'your-store-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

#### iOS Signing
1. Open project in Xcode
2. Configure signing in project settings
3. Select development team
4. Configure provisioning profiles

## 🔧 Development Workflow

### 1. Hot Reload
```bash
# Start app in debug mode
flutter run

# Press 'r' for hot reload
# Press 'R' for hot restart
# Press 'q' to quit
```

### 2. Debug Mode
```bash
# Run with debug information
flutter run --debug

# Enable verbose logging
flutter run --verbose
```

### 3. Profile Mode
```bash
# Run with profiling
flutter run --profile
```

### 4. Release Mode
```bash
# Run optimized version
flutter run --release
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Flutter command not found"
**Solution**: 
- Install Flutter SDK
- Add Flutter to PATH environment variable
- Restart terminal/command prompt

#### 2. "Android SDK not found"
**Solution**:
- Install Android Studio
- Configure ANDROID_HOME environment variable
- Install Android SDK (API level 21+)

#### 3. "iOS development not available"
**Solution**:
- Install Xcode (macOS only)
- Install Command Line Tools
- Accept Xcode license agreement

#### 4. "Dependencies not found"
**Solution**:
- Run `flutter pub get`
- Check `pubspec.yaml` for correct dependencies
- Clear cache with `flutter clean`

#### 5. "Build failed"
**Solution**:
- Check Android SDK installation
- Verify iOS development setup
- Check for missing permissions
- Review build logs

#### 6. "Device not found"
**Solution**:
- Enable USB debugging on Android device
- Trust computer on iOS device
- Check device connection
- Run `flutter devices` to list available devices

#### 7. "Permission denied"
**Solution**:
- Grant necessary permissions in app settings
- Check AndroidManifest.xml for required permissions
- Check Info.plist for iOS permissions

### Debug Commands
```bash
# Check Flutter installation
flutter doctor -v

# Clean project
flutter clean

# Get dependencies
flutter pub get

# Analyze code
flutter analyze

# Format code
flutter format .

# Check for issues
flutter doctor --android-licenses
```

## 📊 Performance Optimization

### 1. App Performance
- Use `const` constructors where possible
- Implement lazy loading for lists
- Optimize image loading and caching
- Minimize widget rebuilds

### 2. Memory Management
- Dispose controllers properly
- Use weak references where appropriate
- Monitor memory usage with DevTools
- Implement proper state management

### 3. Network Optimization
- Implement request caching
- Use compression for API calls
- Implement retry logic
- Monitor network performance

### 4. Battery Optimization
- Minimize background processing
- Optimize location services usage
- Implement efficient push notifications
- Monitor battery usage

## 🔒 Security Best Practices

### 1. Data Protection
- Encrypt sensitive data
- Use secure storage APIs
- Implement certificate pinning
- Validate all user inputs

### 2. Authentication
- Implement biometric authentication
- Secure token management
- Proper session handling
- Secure logout process

### 3. Network Security
- Use HTTPS for all API calls
- Implement certificate pinning
- Validate server certificates
- Secure API key storage

## 📈 Monitoring & Analytics

### 1. Crash Reporting
- Configure Firebase Crashlytics
- Implement error tracking
- Monitor app performance
- Track user behavior

### 2. Performance Monitoring
- Use Firebase Performance
- Monitor app startup time
- Track API response times
- Monitor memory usage

### 3. User Analytics
- Implement Firebase Analytics
- Track user interactions
- Monitor feature usage
- Analyze user behavior

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Performance testing completed
- [ ] Security audit passed
- [ ] UI/UX review completed
- [ ] Accessibility testing done
- [ ] Offline functionality tested
- [ ] Push notifications working
- [ ] Payment integration tested
- [ ] Biometric authentication tested

### Store Preparation
- [ ] App icons created (multiple sizes)
- [ ] Screenshots prepared
- [ ] App description written
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Store listing metadata prepared
- [ ] Release notes written

### Deployment
- [ ] Version number updated
- [ ] Build configuration verified
- [ ] Code signing configured
- [ ] Store listing submitted
- [ ] Beta testing completed
- [ ] Production release approved

## 📞 Support

### Documentation
- [Flutter Documentation](https://flutter.dev/docs)
- [Dart Documentation](https://dart.dev/guides)
- [SmartTabungan API Documentation](backend)

### Contact
- Technical Support: support@smarttabungan.com
- Mobile App Issues: mobile@smarttabungan.com
- General Inquiries: info@smarttabungan.com

---

**Status**: 🚧 In Development
**Version**: 1.0.0-alpha
**Flutter Version**: 3.16.0+
**Last Updated**: January 2024 