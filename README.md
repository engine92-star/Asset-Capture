# Asset-Capture

Asset-Capture is a mobile app for identifying, documenting, and tracking high-value **assets** and **liabilities** while walking through a business, home, storage facility, or any location where valuable items may exist.

## Features

- **Camera scan mode** — Walk through a location while the app analyzes the scene and prompts you when a potential asset or liability is detected.
- **Threshold-aware registration** — Uses standard business capitalization rules ($5,000 default), IRS de minimis safe harbor ($2,500 / $5,000), and your custom cost basis setting.
- **Configurable cost basis slider** — Adjust the minimum item value from $250 up to $1 billion in Settings.
- **Guided capture workflow** — After accepting a detection, capture primary photos, ID tag photos, make/model/year, condition, purchase price, annual revenue/cost, custom fields, and document uploads.
- **Asset and liability registries** — Separate lists with rich detail screens for ongoing documentation.

## Tech Stack

- React Native + Expo SDK 56
- Expo Router (tabs + modal workflow)
- Expo Camera / Image Picker / Document Picker
- AsyncStorage for local persistence

## Getting Started

ML Kit requires a **development build** (it does not run in Expo Go).

```bash
cd Asset-Capture
npm install
npm run prebuild
npm run android
```

For day-to-day development after the first native build:

```bash
npm start
npm run android:dev
```

Connect your Android device with USB debugging enabled, or use an emulator with a camera feed.

## Project Structure

```
app/
  (tabs)/          # Home, Scan, Assets, Liabilities, Settings
  capture/         # Multi-step capture workflow
  item/            # Item detail editor
components/        # Shared UI and detection prompt
context/           # Settings and registry providers
lib/               # Threshold logic, storage, detection engine
types/             # Shared TypeScript types
```

## Detection Engine (Phase 1 — ML Kit)

**Android (primary):** Scan mode captures camera frames and runs Google ML Kit object detection on-device via `@infinitered/react-native-mlkit-object-detection`. Detected labels are mapped to asset categories and estimated values in `lib/label-map.ts`, then filtered against your capitalization threshold.

**ID tag OCR:** During capture workflow, `@infinitered/react-native-mlkit-text-recognition` reads serial plates and auto-fills make, model, year, and markings.

**Fallback:** If ML Kit is unavailable (web, model still loading), the app falls back to the catalog simulator in `lib/detection.ts`.

Key files:

- `lib/ml-detection.ts` — frame analysis pipeline
- `lib/label-map.ts` — ML label → asset category/value mapping
- `lib/ocr.ts` — ID tag text recognition and parsing
- `context/MLKitProvider.tsx` — loads the default ML Kit object detector

## Threshold Logic

An item is recommended for registration when its estimated value meets the greater of:

1. Your configured cost basis threshold (Settings slider)
2. The applicable IRS de minimis safe harbor amount

Users with audited financial statements use the $5,000 de minimis limit; others use $2,500.