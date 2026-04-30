# 🌿 MyAfiyah - Your Health Companion

A mobile-first Android application designed to help the general public learn basic first aid knowledge and quickly find nearby hospitals during emergencies in Malaysia.

## ✨ Features

### 🩹 First Aid Tools
- Comprehensive library of first aid tools and supplies
- Detailed usage guides for each tool
- Quick search and categorization

### 📖 Treatment Guides
- Step-by-step treatment instructions for common injuries
- Video tutorial support (with placeholders for real videos)
- Clear, easy-to-follow emergency procedures

### 🆘 Emergency Help
- Quick access to emergency contacts
- One-tap calling functionality
- Important emergency numbers readily available
- Malaysian emergency hotlines (999, 112, Talian Kasih, and more)

### 🔐 Account & Backend (Supabase)
- Email/password login and account creation
- Logout and in-app password change
- Forgot-password email reset flow
- User-specific progress tracking for tools and treatment guides
- User-specific emergency contact management
- Offline cache fallback for progress and emergency contacts when Supabase is unavailable
- Admin moderation dashboard for user-submitted content reports

### 🏥 Nearby Hospitals Finder
- **Real GPS location integration**
- Automatic distance calculation
- Sorted by nearest facilities first
- Map view and list view options (Leaflet + OpenStreetMap tiles, no API key required)
- Direct calling and navigation to hospitals
- Shows 24/7 availability and facility type

## 🚀 Getting Started

### For Development (Web Browser)
```bash
npm install
npm run dev
```

### Supabase Setup
1. Create a Supabase project.
2. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
3. Open Supabase SQL Editor and run `SUPABASE_SETUP.sql`.
4. In Supabase Auth settings, configure allowed redirect URLs if needed.
5. Promote your admin account after signup:

```sql
update public.profiles
set role = 'admin'
where id = 'YOUR_AUTH_USER_UUID';
```

### For Android Export
See **[QUICK_START.md](./QUICK_START.md)** for simple step-by-step instructions.

## 📱 Export to Android Studio

This app is ready to be exported as a native Android application using Capacitor.

### Quick Export (5 steps):
1. Install Capacitor packages
2. Build the web app
3. Add Android platform
4. Configure permissions in AndroidManifest.xml
5. Open in Android Studio

**Full guide:** [ANDROID_EXPORT_GUIDE.md](./ANDROID_EXPORT_GUIDE.md)

## 📍 Location Services

The app includes **real GPS location functionality** for the Nearby Hospitals feature.

- ✅ Automatically requests location permission
- ✅ Calculates real distances to hospitals
- ✅ Sorts facilities by proximity
- ✅ Graceful fallback if permission denied

**Setup guide:** [LOCATION_SETUP_GUIDE.md](./LOCATION_SETUP_GUIDE.md)

## 🛠️ Technology Stack

- **Framework:** React 18 with TypeScript
- **Routing:** React Router
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Mobile:** Capacitor (for native Android)
- **Location:** @capacitor/geolocation
- **Build Tool:** Vite
- **Backend & Auth:** Supabase

## 📂 Project Structure

```
src/
  app/
    auth/             # Route guards and auth provider
    components/       # React components for each screen
    data/             # Hospital, tools, and guide data
    hooks/            # Reusable app hooks
    lib/              # App utilities
    App.tsx           # Main app component
    routes.tsx        # Application routing
  main.tsx            # App entry point
lib/
  supabase.ts         # Supabase client setup
styles/               # Global CSS, fonts, Tailwind theme
supabase/
  config.toml         # Local Supabase config
```

## 📦 GitHub Repository Notes

This project is now prepared for a clean GitHub upload:

- `.env` stays local and is **not committed**
- generated folders like `dist/`, `node_modules/`, and Android build caches are ignored
- line endings and basic editor rules are standardized for smoother collaboration

### First Push Commands
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

> If Git is not installed on your machine yet, install it first or use GitHub Desktop.

## 🎨 Design System

- **Color Palette:** Medical-friendly (blue, green, red, orange)
- **Max Width:** 448px (mobile-optimized)
- **Navigation:** Bottom navigation bar
- **Touch Targets:** Large, stress-friendly buttons
- **Accessibility:** High contrast, clear typography

## 📋 Core Screens

1. **Splash Screen** - App introduction
2. **Onboarding** - Feature walkthrough
3. **Home** - Dashboard with quick access
4. **First Aid Tools** - Tool library and details
5. **Treatment Guides** - Emergency procedures
6. **Emergency** - Quick emergency contacts
7. **Nearby Hospitals** - GPS-enabled hospital finder

## 🔐 Permissions Required

For full functionality on Android, the app requires:

- **Location (GPS)** - For finding nearby hospitals
- **Phone Calls** - For emergency calling feature

## 📖 Documentation

- [QUICK_START.md](./QUICK_START.md) - Fast Android export guide
- [ANDROID_EXPORT_GUIDE.md](./ANDROID_EXPORT_GUIDE.md) - Complete export instructions
- [LOCATION_SETUP_GUIDE.md](./LOCATION_SETUP_GUIDE.md) - GPS setup and configuration
- [SECURITY_AUDIT_INFO.md](./SECURITY_AUDIT_INFO.md) - Security audit information

## 🐛 Troubleshooting

### Build Issues
See [ANDROID_EXPORT_GUIDE.md](./ANDROID_EXPORT_GUIDE.md#troubleshooting)

### Location Not Working
See [LOCATION_SETUP_GUIDE.md](./LOCATION_SETUP_GUIDE.md#troubleshooting)

### Security Warnings
See [SECURITY_AUDIT_INFO.md](./SECURITY_AUDIT_INFO.md)

## 🚧 Future Enhancements

- [ ] Real hospital API integration
- [ ] Interactive map implementation
- [ ] Push notifications for emergency alerts
- [ ] Offline mode with cached content
- [ ] Multiple language support
- [ ] Dark mode
- [ ] User profiles and preferences
- [ ] Real video tutorials
- [ ] Emergency contact management

## 📝 Customization

### Update Hospital Data
Edit `/src/app/data/hospitals.ts` with real hospital coordinates for your area.

### Change App Branding
- App name: `capacitor.config.json` and `android/app/src/main/res/values/strings.xml`
- Package ID: `capacitor.config.json`
- Colors: `/src/styles/theme.css`
- Icons: `android/app/src/main/res/mipmap-*/`

### Add More Content
- First aid tools: `/src/app/data/firstAidTools.ts`
- Treatment guides: `/src/app/data/treatmentGuides.ts`

## 🎯 Production Checklist

Before publishing to Google Play Store:

- [ ] Update app icon
- [ ] Change package name (com.yourcompany.aidnow)
- [ ] Add real hospital data for your region
- [ ] Test all features on real device
- [ ] Add privacy policy
- [ ] Configure signing key
- [ ] Test location permissions
- [ ] Test phone calling
- [ ] Create app screenshots
- [ ] Write app description
- [ ] Build signed release APK/AAB

## 📄 License

This project is private and for educational/demonstration purposes.

## 🤝 Support

For issues or questions:
1. Check the documentation files
2. Review troubleshooting sections
3. Test on real Android device

---

**Built with ❤️ for emergency preparedness and public health education**

🚑 MyAfiyah - Your Health Companion
