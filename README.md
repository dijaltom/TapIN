# TapIN — Setup & Run Guide

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18 | JS runtime |
| Xcode | ≥ 15 | iOS build |
| CocoaPods | ≥ 1.14 | iOS dependency manager |
| Ruby | ≥ 3.0 | CocoaPods runtime |
| Apple Developer Account | Required | NFC entitlements + signing |

---

## 1. Install JS Dependencies

```bash
cd NFCAPP
npm install
```

## 2. Install iOS Pods

```bash
cd ios
pod install
cd ..
```

## 3. Open in Xcode

```bash
open ios/TapIN.xcworkspace
```

In Xcode:
1. Select your team under **Signing & Capabilities**
2. Set **Bundle ID** to something unique (e.g. `com.yourname.tapin`)
3. Under **+ Capability**: Add **Near Field Communication Tag Reading**
4. Under **+ Capability**: Add **Wallet**

## 4. Run on Device

```bash
npx react-native run-ios --device
```

> ⚠️ NFC does NOT work on simulators — must use a real iPhone 7+

---

## Apple Wallet (Production)

For real `.pkpass` signing you need:
1. Go to [developer.apple.com](https://developer.apple.com)
2. Create a **Pass Type ID** (e.g. `pass.com.yourname.tapin`)
3. Generate a **Pass Type Certificate** (.p12)
4. Update `wallet.service.ts` with your `passTypeIdentifier` and `teamIdentifier`

---

## Project Structure

```
NFCAPP/
├── src/
│   ├── components/
│   │   ├── Card/        # PassCard, CardCarousel, NFCPulse
│   │   └── UI/          # GlassCard, GradientButton, MetroBadge
│   ├── screens/
│   │   ├── Onboarding/  # 3-slide intro
│   │   ├── Home/        # Wallet + carousel
│   │   ├── NFCScan/     # NFC reader screen
│   │   ├── QRScan/      # Camera QR scanner
│   │   ├── PassDetail/  # Full pass view + Apple Wallet CTA
│   │   └── Settings/    # Preferences + stats
│   ├── services/
│   │   ├── nfc.service.ts     # NFC read logic
│   │   ├── qr.service.ts      # QR decode + metro parser
│   │   ├── wallet.service.ts  # Apple Wallet / PassKit
│   │   └── storage.service.ts # MMKV local storage
│   ├── store/
│   │   └── passes.store.ts    # Zustand state
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   └── theme/
│       ├── colors.ts    # All colors + metro brands
│       ├── typography.ts
│       └── spacing.ts
├── ios/
│   ├── TapIN/
│   │   ├── Info.plist          # NFC + Camera permissions
│   │   └── TapIN.entitlements  # NFC + Wallet entitlements
│   └── Podfile
├── App.tsx
└── package.json
```

---

## Supported Metros

- 🔴 **DMRC** — Delhi Metro
- 🔵 **BMRC** — Namma Metro (Bengaluru)
- 🟠 **MMRC** — Mumbai Metro
- 🟢 **HMR** — Hyderabad Metro
- 🟣 **CMRL** — Chennai Metro
