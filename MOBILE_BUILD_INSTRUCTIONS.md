# FIMS Mobile App Build Instructions

Your website has been successfully converted to work as a mobile application for both Android and iOS. The exact same codebase now runs on web, Android, and iOS.

## Prerequisites

### For Android Development:
- Install [Android Studio](https://developer.android.com/studio)
- Install Java Development Kit (JDK) 17 or higher
- Set up Android SDK through Android Studio

### For iOS Development (macOS only):
- Install [Xcode](https://apps.apple.com/app/xcode/id497799835) from the Mac App Store
- Install Xcode Command Line Tools: `xcode-select --install`
- Install CocoaPods: `sudo gem install cocoapods`

## Building the Apps

### Step 1: Build Your Web App
First, build your web application:
```bash
npm run build
```

### Step 2: Sync with Native Platforms
Sync the built web app with the native platforms:
```bash
npm run sync
```

Or sync and open specific platforms:

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

## Developing on Android

1. Run `npm run android` to open Android Studio
2. Wait for Gradle sync to complete
3. Connect an Android device via USB (with USB debugging enabled) or start an Android emulator
4. Click the "Run" button (green play icon) in Android Studio
5. Your app will install and launch on the device/emulator

### Creating an APK for Testing:
1. In Android Studio, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Once built, find the APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Creating a Release APK/AAB for Google Play:
1. In Android Studio, go to **Build > Generate Signed Bundle / APK**
2. Select "Android App Bundle" for Google Play or "APK" for direct distribution
3. Follow the wizard to create/use a keystore
4. Choose "release" build variant
5. The signed AAB/APK will be in `android/app/release/`

## Developing on iOS

1. Run `npm run ios` to open Xcode
2. Select a simulator or connect an iOS device
3. Click the "Play" button in Xcode to build and run
4. Your app will install and launch on the simulator/device

### Running on a Physical iOS Device:
1. Connect your iPhone/iPad via USB
2. In Xcode, select your device from the device dropdown
3. You may need to:
   - Sign in with your Apple ID (Xcode > Preferences > Accounts)
   - Select your team in the project settings under "Signing & Capabilities"
   - Trust the developer certificate on your device (Settings > General > Device Management)

### Creating an IPA for TestFlight/App Store:
1. In Xcode, select **Product > Archive**
2. Once archived, the Organizer window will open
3. Select your archive and click "Distribute App"
4. Choose distribution method:
   - **TestFlight & App Store**: for submitting to Apple
   - **Ad Hoc**: for testing on specific devices
   - **Development**: for development testing
5. Follow the wizard to sign and export your app

## Publishing to App Stores

### Google Play Store (Android):
1. Create a Google Play Developer account ($25 one-time fee)
2. Go to [Google Play Console](https://play.google.com/console)
3. Create a new app
4. Upload your signed AAB file
5. Fill in all required store listing information
6. Submit for review

### Apple App Store (iOS):
1. Enroll in the Apple Developer Program ($99/year)
2. Go to [App Store Connect](https://appstoreconnect.apple.com)
3. Create a new app
4. Use Xcode to upload your build (via Archive > Distribute App)
5. Fill in all required app information
6. Submit for review

## Important Notes

- The app will work exactly like your website
- All Supabase functionality remains the same
- Make sure your `.env` file is properly configured
- Environment variables are bundled during build time
- For production, ensure your Supabase database has proper CORS settings
- Test thoroughly on both platforms before publishing

## Updating the Mobile Apps

Whenever you make changes to your website:

1. Make your changes to the React code
2. Run `npm run build` to build the web app
3. Run `npm run sync` to update native platforms
4. Open Android Studio or Xcode to rebuild and test

## Troubleshooting

### Android Issues:
- If Gradle sync fails, open Android Studio and let it download necessary components
- Clear build cache: In Android Studio, go to **File > Invalidate Caches / Restart**
- Check that Java JDK is properly installed: `java -version`

### iOS Issues:
- If CocoaPods fails, run: `cd ios/App && pod install && cd ../..`
- Clear derived data: In Xcode, go to **Product > Clean Build Folder**
- Check that Xcode Command Line Tools are installed: `xcode-select -p`

## Getting Help

For more information about Capacitor:
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Development Guide](https://capacitorjs.com/docs/android)
- [iOS Development Guide](https://capacitorjs.com/docs/ios)
