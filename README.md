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

```bash
cd Asset-Capture
npm install
npm start
```

Then scan the QR code with Expo Go on your phone, or run:

```bash
npm run android
npm run ios
```

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

## Detection Engine

The current detection layer uses a catalog-based scanner that simulates on-device identification during walkthrough mode. It is structured so a production ML model (Apple Vision, Google ML Kit, or a cloud vision API) can replace `lib/detection.ts` without changing the UI workflow.

## Threshold Logic

An item is recommended for registration when its estimated value meets the greater of:

1. Your configured cost basis threshold (Settings slider)
2. The applicable IRS de minimis safe harbor amount

Users with audited financial statements use the $5,000 de minimis limit; others use $2,500.