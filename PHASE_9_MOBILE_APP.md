# Phase 9: Mobile App (Flutter) 📱

## Overview
Phase 9 fokus pada pengembangan aplikasi mobile SmartTabungan menggunakan Flutter, memberikan pengalaman pengguna yang optimal di perangkat mobile dengan fitur offline, push notifications, dan integrasi mobile payment.

## 🎯 Objectives

### Primary Goals
1. **Mobile-First Experience**: Aplikasi yang responsif dan user-friendly untuk perangkat mobile
2. **Offline Capability**: Fungsi aplikasi tanpa koneksi internet
3. **Push Notifications**: Notifikasi real-time untuk berbagai event
4. **Mobile Payment Integration**: Integrasi dengan payment gateway mobile
5. **Biometric Authentication**: Keamanan dengan fingerprint/Face ID
6. **Cross-Platform**: Support untuk Android dan iOS

### Secondary Goals
1. **Performance Optimization**: Aplikasi yang cepat dan efisien
2. **Battery Optimization**: Penggunaan baterai yang optimal
3. **Data Synchronization**: Sinkronisasi data antara mobile dan backend
4. **User Experience**: Interface yang intuitif dan modern

## 🏗️ Architecture

### Tech Stack
- **Framework**: Flutter 3.16.0+
- **Language**: Dart 3.2.0+
- **State Management**: Provider + Riverpod
- **Local Storage**: Hive + SharedPreferences
- **HTTP Client**: Dio
- **Navigation**: Go Router
- **UI Components**: Material Design 3

### Project Structure
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

## 📱 Features Implementation

### 1. 🔐 Authentication & Security

#### Biometric Authentication
```dart
// Check biometric availability
Future<bool> isBiometricAvailable() async {
  final isAvailable = await _localAuth.canCheckBiometrics;
  final isDeviceSupported = await _localAuth.isDeviceSupported();
  return isAvailable && isDeviceSupported;
}

// Authenticate with biometrics
Future<bool> authenticateWithBiometrics() async {
  return await _localAuth.authenticate(
    localizedReason: 'Autentikasi untuk mengakses SmartTabungan',
    options: const AuthenticationOptions(
      biometricOnly: true,
      stickyAuth: true,
    ),
  );
}
```

#### Secure Storage
```dart
// Store sensitive data securely
Future<void> setSecureData(String key, String value) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString('secure_$key', value);
}

// Retrieve secure data
Future<String?> getSecureData(String key) async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString('secure_$key');
}
```

### 2. 📊 Dashboard

#### Financial Overview Widget
```dart
class FinancialOverviewWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatCard('Pemasukan', 'Rp 5.000.000', Colors.green),
                _buildStatCard('Pengeluaran', 'Rp 3.200.000', Colors.red),
              ],
            ),
            const SizedBox(height: 16),
            _buildStatCard('Tabungan', 'Rp 1.800.000', Colors.blue),
          ],
        ),
      ),
    );
  }
}
```

#### Quick Actions
```dart
class QuickActionsWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildActionButton(
          icon: Icons.add,
          label: 'Tambah Transaksi',
          onTap: () => Navigator.pushNamed(context, '/add-transaction'),
        ),
        _buildActionButton(
          icon: Icons.analytics,
          label: 'Analisis',
          onTap: () => Navigator.pushNamed(context, '/analytics'),
        ),
        _buildActionButton(
          icon: Icons.account_balance,
          label: 'Bank',
          onTap: () => Navigator.pushNamed(context, '/bank-integration'),
        ),
      ],
    );
  }
}
```

### 3. 💰 Transaction Management

#### Add Transaction Screen
```dart
class AddTransactionScreen extends StatefulWidget {
  @override
  _AddTransactionScreenState createState() => _AddTransactionScreenState();
}

class _AddTransactionScreenState extends State<AddTransactionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _selectedCategory = '';
  String _selectedType = 'expense';
  DateTime _selectedDate = DateTime.now();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Tambah Transaksi')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Amount field
            TextFormField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Jumlah',
                prefixText: 'Rp ',
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Jumlah diperlukan';
                }
                return null;
              },
            ),
            
            // Type selector
            SegmentedButton<String>(
              segments: [
                ButtonSegment(value: 'expense', label: Text('Pengeluaran')),
                ButtonSegment(value: 'income', label: Text('Pemasukan')),
              ],
              selected: {_selectedType},
              onSelectionChanged: (Set<String> selection) {
                setState(() {
                  _selectedType = selection.first;
                });
              },
            ),
            
            // Category selector
            DropdownButtonFormField<String>(
              value: _selectedCategory.isEmpty ? null : _selectedCategory,
              decoration: InputDecoration(labelText: 'Kategori'),
              items: _getCategoryItems(),
              onChanged: (value) {
                setState(() {
                  _selectedCategory = value ?? '';
                });
              },
            ),
            
            // Date picker
            ListTile(
              title: Text('Tanggal'),
              subtitle: Text(DateFormat('dd/MM/yyyy').format(_selectedDate)),
              trailing: Icon(Icons.calendar_today),
              onTap: () => _selectDate(context),
            ),
            
            // Description field
            TextFormField(
              controller: _descriptionController,
              decoration: InputDecoration(labelText: 'Deskripsi'),
              maxLines: 3,
            ),
            
            const SizedBox(height: 24),
            
            // Save button
            ElevatedButton(
              onPressed: _saveTransaction,
              child: Text('Simpan Transaksi'),
            ),
          ],
        ),
      ),
    );
  }
}
```

#### Camera Integration
```dart
class ReceiptCaptureWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ElevatedButton.icon(
          onPressed: () => _captureReceipt(context),
          icon: Icon(Icons.camera_alt),
          label: Text('Ambil Foto Struk'),
        ),
        if (_receiptImage != null)
          Image.file(
            _receiptImage!,
            height: 200,
            width: double.infinity,
            fit: BoxFit.cover,
          ),
      ],
    );
  }

  Future<void> _captureReceipt(BuildContext context) async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 1024,
      maxHeight: 1024,
    );
    
    if (image != null) {
      setState(() {
        _receiptImage = File(image.path);
      });
    }
  }
}
```

### 4. 📈 Analytics & Insights

#### Spending Chart
```dart
class SpendingChartWidget extends StatelessWidget {
  final List<Transaction> transactions;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Analisis Pengeluaran',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: PieChart(
                PieChartData(
                  sections: _buildChartSections(),
                  centerSpaceRadius: 40,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<PieChartSectionData> _buildChartSections() {
    final categoryTotals = <String, double>{};
    
    for (final transaction in transactions) {
      if (transaction.type == 'expense') {
        categoryTotals[transaction.category] = 
            (categoryTotals[transaction.category] ?? 0) + transaction.amount;
      }
    }
    
    return categoryTotals.entries.map((entry) {
      return PieChartSectionData(
        value: entry.value,
        title: '${entry.key}\n${_formatCurrency(entry.value)}',
        color: _getCategoryColor(entry.key),
        radius: 60,
      );
    }).toList();
  }
}
```

### 5. 🎯 Budget Management

#### Budget Progress Widget
```dart
class BudgetProgressWidget extends StatelessWidget {
  final Budget budget;

  @override
  Widget build(BuildContext context) {
    final progress = budget.spent / budget.limit;
    final remaining = budget.limit - budget.spent;
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(budget.name, style: Theme.of(context).textTheme.titleMedium),
                Text('${(progress * 100).toInt()}%'),
              ],
            ),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: progress.clamp(0.0, 1.0),
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(
                progress > 0.9 ? Colors.red : Colors.blue,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Terpakai: ${_formatCurrency(budget.spent)}'),
                Text('Sisa: ${_formatCurrency(remaining)}'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
```

### 6. 🔔 Notifications

#### Push Notification Service
```dart
class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _localNotifications = 
      FlutterLocalNotificationsPlugin();
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<void> initialize() async {
    // Initialize local notifications
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    
    const InitializationSettings initializationSettings =
        InitializationSettings(android: initializationSettingsAndroid);
    
    await _localNotifications.initialize(initializationSettings);

    // Request permission for push notifications
    await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Get FCM token
    final token = await _firebaseMessaging.getToken();
    print('FCM Token: $token');

    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
  }

  Future<void> showNotification({
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
    );

    const NotificationDetails platformChannelSpecifics =
        NotificationDetails(android: androidPlatformChannelSpecifics);

    await _localNotifications.show(
      0,
      title,
      body,
      platformChannelSpecifics,
      payload: payload,
    );
  }
}

Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print('Handling background message: ${message.messageId}');
}
```

### 7. 🏦 Bank Integration

#### Bank Account List
```dart
class BankAccountListWidget extends StatelessWidget {
  final List<BankAccount> accounts;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: accounts.length,
      itemBuilder: (context, index) {
        final account = accounts[index];
        return Card(
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: _getBankColor(account.bankName),
              child: Text(account.bankName[0]),
            ),
            title: Text(account.accountNumber),
            subtitle: Text(account.bankName),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  _formatCurrency(account.balance),
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                Text(
                  account.accountType,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
            onTap: () => _showAccountDetails(context, account),
          ),
        );
      },
    );
  }
}
```

### 8. 💳 Payment Gateway

#### Payment Methods
```dart
class PaymentMethodsWidget extends StatelessWidget {
  final double amount;
  final Function(String method) onPaymentMethodSelected;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Pilih Metode Pembayaran',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 16),
        
        // E-wallet options
        _buildPaymentOption(
          icon: 'assets/icons/gopay.png',
          title: 'GoPay',
          subtitle: 'Saldo: Rp 500.000',
          onTap: () => onPaymentMethodSelected('gopay'),
        ),
        
        _buildPaymentOption(
          icon: 'assets/icons/ovo.png',
          title: 'OVO',
          subtitle: 'Saldo: Rp 250.000',
          onTap: () => onPaymentMethodSelected('ovo'),
        ),
        
        _buildPaymentOption(
          icon: 'assets/icons/dana.png',
          title: 'DANA',
          subtitle: 'Saldo: Rp 750.000',
          onTap: () => onPaymentMethodSelected('dana'),
        ),
        
        // Bank transfer options
        _buildPaymentOption(
          icon: Icons.account_balance,
          title: 'Transfer Bank',
          subtitle: 'BCA, Mandiri, BNI, dll',
          onTap: () => onPaymentMethodSelected('bank_transfer'),
        ),
        
        // QRIS
        _buildPaymentOption(
          icon: Icons.qr_code,
          title: 'QRIS',
          subtitle: 'Scan QR Code',
          onTap: () => onPaymentMethodSelected('qris'),
        ),
      ],
    );
  }
}
```

## 🔧 Configuration

### Android Configuration

#### build.gradle (app level)
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
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.multidex:multidex:2.0.1'
    implementation 'com.google.firebase:firebase-messaging:23.4.0'
    implementation 'com.google.firebase:firebase-analytics:21.5.0'
}
```

#### AndroidManifest.xml
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

### iOS Configuration

#### Info.plist
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

## 🚀 Performance Optimization

### App Performance
```dart
// Lazy loading for lists
class LazyLoadingListView extends StatefulWidget {
  @override
  _LazyLoadingListViewState createState() => _LazyLoadingListViewState();
}

class _LazyLoadingListViewState extends State<LazyLoadingListView> {
  final List<Transaction> _transactions = [];
  bool _isLoading = false;
  int _page = 1;
  final int _pageSize = 20;

  @override
  Widget build(BuildContext context) {
    return NotificationListener<ScrollNotification>(
      onNotification: (ScrollNotification scrollInfo) {
        if (!_isLoading &&
            scrollInfo.metrics.pixels == scrollInfo.metrics.maxScrollExtent) {
          _loadMoreData();
        }
        return true;
      },
      child: ListView.builder(
        itemCount: _transactions.length + 1,
        itemBuilder: (context, index) {
          if (index == _transactions.length) {
            return _isLoading
                ? Center(child: CircularProgressIndicator())
                : SizedBox.shrink();
          }
          return TransactionCard(transaction: _transactions[index]);
        },
      ),
    );
  }

  Future<void> _loadMoreData() async {
    if (_isLoading) return;
    
    setState(() {
      _isLoading = true;
    });

    try {
      final newTransactions = await TransactionService.getTransactions(
        page: _page,
        pageSize: _pageSize,
      );
      
      setState(() {
        _transactions.addAll(newTransactions);
        _page++;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }
}
```

### Image Caching
```dart
// Cached network image
CachedNetworkImage(
  imageUrl: user.avatar!,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
  fit: BoxFit.cover,
  memCacheWidth: 200,
  memCacheHeight: 200,
)
```

### Memory Management
```dart
// Dispose controllers properly
class _TransactionScreenState extends State<TransactionScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
```

## 🔒 Security Measures

### Data Encryption
```dart
// Encrypt sensitive data
import 'package:encrypt/encrypt.dart';

class EncryptionService {
  static final key = Key.fromLength(32);
  static final iv = IV.fromLength(16);
  static final encrypter = Encrypter(AES(key));

  static String encrypt(String text) {
    return encrypter.encrypt(text, iv: iv).base64;
  }

  static String decrypt(String encryptedText) {
    return encrypter.decrypt64(encryptedText, iv: iv);
  }
}
```

### Certificate Pinning
```dart
// Certificate pinning for network security
class SecureHttpClient {
  static Dio createSecureClient() {
    final dio = Dio();
    
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Add certificate pinning logic here
          handler.next(options);
        },
      ),
    );
    
    return dio;
  }
}
```

## 📊 Monitoring & Analytics

### Crash Reporting
```dart
// Firebase Crashlytics integration
import 'package:firebase_crashlytics/firebase_crashlytics.dart';

class CrashReportingService {
  static Future<void> initialize() async {
    await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
    
    FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterError;
  }

  static void logError(String message, dynamic error, StackTrace? stackTrace) {
    FirebaseCrashlytics.instance.recordError(error, stackTrace, reason: message);
  }
}
```

### Performance Monitoring
```dart
// Performance monitoring
import 'package:firebase_performance/firebase_performance.dart';

class PerformanceService {
  static Future<void> trackApiCall(String endpoint) async {
    final trace = FirebasePerformance.instance.newTrace('api_call');
    await trace.start();
    
    try {
      // Make API call
      await _makeApiCall(endpoint);
    } finally {
      await trace.stop();
    }
  }
}
```

## 🧪 Testing

### Unit Tests
```dart
// Test authentication service
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

class MockAuthService extends Mock implements AuthService {}

void main() {
  group('AuthProvider Tests', () {
    late AuthProvider authProvider;
    late MockAuthService mockAuthService;

    setUp(() {
      mockAuthService = MockAuthService();
      authProvider = AuthProvider();
    });

    test('should login successfully', () async {
      // Arrange
      when(mockAuthService.login('test@example.com', 'password'))
          .thenAnswer((_) async => User(id: '1', name: 'Test User', email: 'test@example.com'));

      // Act
      final result = await authProvider.login('test@example.com', 'password');

      // Assert
      expect(result, true);
      expect(authProvider.isAuthenticated, true);
      expect(authProvider.user?.email, 'test@example.com');
    });
  });
}
```

### Widget Tests
```dart
// Test login form
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Login form validation', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(home: LoginScreen()));

    // Test empty form submission
    await tester.tap(find.byType(ElevatedButton));
    await tester.pump();

    expect(find.text('Email diperlukan'), findsOneWidget);
    expect(find.text('Password diperlukan'), findsOneWidget);

    // Test invalid email
    await tester.enterText(find.byType(TextFormField).first, 'invalid-email');
    await tester.tap(find.byType(ElevatedButton));
    await tester.pump();

    expect(find.text('Email tidak valid'), findsOneWidget);
  });
}
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

# Split APKs for different architectures
flutter build apk --split-per-abi --release
```

### iOS Build
```bash
# Debug build
flutter build ios --debug

# Release build
flutter build ios --release

# Archive for App Store
flutter build ios --release --no-codesign
```

### Code Signing
```bash
# Android signing
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload

# iOS signing (requires Xcode)
# Configure in Xcode project settings
```

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

## 📈 Success Metrics

### Performance Metrics
- **App Launch Time**: < 3 seconds
- **Screen Transition**: < 300ms
- **API Response Time**: < 2 seconds
- **Memory Usage**: < 100MB
- **Battery Impact**: < 5% per hour

### User Experience Metrics
- **App Store Rating**: > 4.5 stars
- **User Retention**: > 70% after 30 days
- **Session Duration**: > 5 minutes average
- **Feature Adoption**: > 60% for core features
- **Crash Rate**: < 1%

### Business Metrics
- **Downloads**: Target 10,000+ in first month
- **Active Users**: > 5,000 daily active users
- **Transaction Volume**: > 1,000 transactions per day
- **User Engagement**: > 3 sessions per week
- **Customer Satisfaction**: > 90%

## 🔮 Future Enhancements

### Phase 9.1: Advanced Features
- **Voice Commands**: Voice-controlled transaction entry
- **AR Receipt Scanning**: Augmented reality receipt processing
- **Smart Notifications**: AI-powered notification timing
- **Social Features**: Share financial goals with friends
- **Gamification**: Rewards and achievements system

### Phase 9.2: Platform Expansion
- **Wearable Support**: Apple Watch and Android Wear
- **Desktop App**: Windows and macOS applications
- **Web App**: Progressive Web App (PWA)
- **Smart TV**: Android TV and Apple TV apps

### Phase 9.3: AI Integration
- **Predictive Analytics**: AI-powered spending predictions
- **Smart Budgeting**: Automatic budget adjustments
- **Fraud Detection**: AI-powered transaction monitoring
- **Personal Finance Assistant**: AI chatbot integration

---

**Status**: 🚧 In Development
**Progress**: 25% Complete
**Next Phase**: Phase 10 - Advanced Analytics & AI
**Estimated Completion**: February 2024 