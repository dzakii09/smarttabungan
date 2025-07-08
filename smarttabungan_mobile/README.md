# SmartTabungan Mobile App 📱

## Overview
SmartTabungan Mobile adalah aplikasi Flutter yang memberikan pengalaman manajemen keuangan yang optimal di perangkat mobile, dengan fitur offline, push notifications, dan integrasi mobile payment.

## 🚀 Getting Started

### Prerequisites
- Flutter SDK (3.16.0 atau lebih baru)
- Dart SDK (3.2.0 atau lebih baru)
- Android Studio / VS Code
- Android SDK (API level 21+)
- iOS SDK (untuk development iOS)

### Installation

#### 1. Install Flutter
```bash
# Download Flutter SDK dari https://flutter.dev/docs/get-started/install
# Extract ke folder yang diinginkan
# Tambahkan Flutter ke PATH environment variable
```

#### 2. Clone Repository
```bash
git clone <repository-url>
cd smarttabungan_mobile
```

#### 3. Install Dependencies
```bash
flutter pub get
```

#### 4. Setup Environment
Buat file `.env` di root project:
```env
# Backend API
API_BASE_URL=http://localhost:5000/api

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key

# Push Notifications
FCM_SERVER_KEY=your-fcm-server-key

# Payment Gateway
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
```

#### 5. Run App
```bash
# Development
flutter run

# Production build
flutter build apk --release
flutter build ios --release
```

## 📁 Project Structure

```
smarttabungan_mobile/
├── lib/
│   ├── main.dart                 # App entry point
│   ├── app.dart                  # App configuration
│   ├── core/
│   │   ├── constants/            # App constants
│   │   ├── utils/                # Utility functions
│   │   ├── services/             # Core services
│   │   └── widgets/              # Shared widgets
│   ├── features/
│   │   ├── auth/                 # Authentication
│   │   ├── dashboard/            # Dashboard
│   │   ├── transactions/         # Transaction management
│   │   ├── budgets/              # Budget management
│   │   ├── goals/                # Financial goals
│   │   ├── analytics/            # Financial analytics
│   │   ├── notifications/        # Push notifications
│   │   ├── bank_integration/     # Bank integration
│   │   ├── payment_gateway/      # Payment processing
│   │   └── external_services/    # External APIs
│   ├── shared/
│   │   ├── models/               # Data models
│   │   ├── providers/            # State management
│   │   └── widgets/              # Shared UI components
│   └── assets/
│       ├── images/               # App images
│       ├── icons/                # App icons
│       └── fonts/                # Custom fonts
├── android/                      # Android configuration
├── ios/                          # iOS configuration
├── test/                         # Unit tests
└── pubspec.yaml                  # Dependencies
```

## 🛠️ Dependencies

### Core Dependencies
```yaml
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2
  
  # State Management
  provider: ^6.0.5
  riverpod: ^2.4.9
  
  # HTTP Client
  dio: ^5.3.2
  
  # Local Storage
  shared_preferences: ^2.2.2
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  
  # UI Components
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  
  # Charts
  fl_chart: ^0.65.0
  
  # Notifications
  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.0
  
  # Biometric
  local_auth: ^2.1.7
  
  # Camera & File
  image_picker: ^1.0.4
  file_picker: ^6.1.1
  
  # QR Code
  qr_code_scanner: ^1.0.1
  qr_flutter: ^4.1.0
  
  # Location
  geolocator: ^10.1.0
  
  # Utils
  intl: ^0.18.1
  uuid: ^4.2.1
  permission_handler: ^11.1.0
```

### Dev Dependencies
```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  
  # Testing
  mockito: ^5.4.4
  build_runner: ^2.4.7
  
  # Code Generation
  hive_generator: ^2.0.1
  json_annotation: ^4.8.1
  json_serializable: ^6.7.1
```

## 🎨 Features

### 1. 🔐 Authentication & Security
- **Biometric Authentication**: Fingerprint/Face ID
- **Secure Login**: JWT token management
- **Auto-login**: Remember user session
- **Logout**: Secure logout process

### 2. 📊 Dashboard
- **Financial Overview**: Income, expenses, savings
- **Quick Actions**: Add transaction, view analytics
- **Recent Transactions**: Latest financial activities
- **Budget Status**: Current budget progress

### 3. 💰 Transaction Management
- **Add Transaction**: Quick transaction entry
- **Camera Integration**: Photo receipt capture
- **Auto-categorization**: AI-powered categorization
- **Transaction History**: Complete transaction list
- **Search & Filter**: Find specific transactions

### 4. 📈 Analytics & Insights
- **Spending Analysis**: Category-wise breakdown
- **Income Analysis**: Income source tracking
- **Trend Charts**: Visual financial trends
- **AI Insights**: Personalized financial advice

### 5. 🎯 Budget Management
- **Create Budget**: Set spending limits
- **Budget Tracking**: Real-time budget monitoring
- **Budget Alerts**: Notifications for overspending
- **Budget Suggestions**: AI-powered recommendations

### 6. 🏆 Financial Goals
- **Goal Setting**: Create financial objectives
- **Progress Tracking**: Visual goal progress
- **Goal Reminders**: Push notifications
- **Goal Completion**: Celebration achievements

### 7. 🔔 Notifications
- **Push Notifications**: Real-time alerts
- **Budget Alerts**: Overspending warnings
- **Goal Reminders**: Goal deadline notifications
- **Transaction Alerts**: Large transaction notifications

### 8. 🏦 Bank Integration
- **Multi-bank Support**: Connect multiple accounts
- **Real-time Sync**: Automatic transaction sync
- **Balance Check**: Real-time account balance
- **Transaction Import**: Import bank transactions

### 9. 💳 Payment Gateway
- **Multiple Payment Methods**: E-wallet, bank transfer, QRIS
- **Payment Processing**: Secure payment handling
- **Payment History**: Complete payment records
- **Recurring Payments**: Automated payments

### 10. 🌐 External Services
- **Currency Exchange**: Real-time exchange rates
- **Stock Market**: Stock price tracking
- **Weather Data**: Location-based weather
- **Financial News**: Latest financial updates

## 🔧 Configuration

### Android Configuration
```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.smarttabungan.app"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### iOS Configuration
```swift
// Info.plist
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to take photos of receipts</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to track spending patterns</string>
<key>NSFaceIDUsageDescription</key>
<string>This app uses Face ID for secure authentication</string>
```

## 🧪 Testing

### Unit Tests
```bash
flutter test
```

### Widget Tests
```bash
flutter test test/widget_test.dart
```

### Integration Tests
```bash
flutter drive --target=test_driver/app.dart
```

## 📱 Build & Deploy

### Android Build
```bash
# Debug build
flutter build apk --debug

# Release build
flutter build apk --release

# App bundle for Play Store
flutter build appbundle --release
```

### iOS Build
```bash
# Debug build
flutter build ios --debug

# Release build
flutter build ios --release
```

## 🚀 Performance Optimization

### App Performance
- **Lazy Loading**: Load data on demand
- **Image Caching**: Cache images locally
- **Memory Management**: Optimize memory usage
- **Background Processing**: Handle background tasks efficiently

### Network Optimization
- **API Caching**: Cache API responses
- **Request Batching**: Batch multiple requests
- **Compression**: Compress data transfer
- **Retry Logic**: Handle network failures

### Battery Optimization
- **Background Sync**: Optimize sync frequency
- **Location Services**: Minimize location updates
- **Push Notifications**: Efficient notification handling
- **Wake Locks**: Minimize wake lock usage

## 🔒 Security Measures

### Data Protection
- **Encryption**: Encrypt sensitive data
- **Secure Storage**: Use secure storage APIs
- **Network Security**: HTTPS and certificate pinning
- **Input Validation**: Validate all user inputs

### Authentication
- **Biometric Auth**: Fingerprint/Face ID support
- **Token Management**: Secure token storage
- **Session Management**: Proper session handling
- **Logout**: Secure logout process

## 📊 Monitoring & Analytics

### Crash Reporting
- **Firebase Crashlytics**: Crash reporting
- **Error Tracking**: Track app errors
- **Performance Monitoring**: Monitor app performance

### User Analytics
- **User Behavior**: Track user interactions
- **Feature Usage**: Monitor feature usage
- **Performance Metrics**: Track app performance
- **Conversion Tracking**: Track user conversions

## 🐛 Troubleshooting

### Common Issues

#### 1. "Flutter command not found"
**Solution**: 
- Install Flutter SDK
- Add Flutter to PATH environment variable
- Restart terminal/command prompt

#### 2. "Dependencies not found"
**Solution**:
- Run `flutter pub get`
- Check `pubspec.yaml` for correct dependencies
- Clear cache with `flutter clean`

#### 3. "Build failed"
**Solution**:
- Check Android SDK installation
- Verify iOS development setup
- Check for missing permissions
- Review build logs

### Debug Mode
```bash
flutter run --debug
```

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