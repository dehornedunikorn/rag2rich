# RAG2RICH — native Android / Godot rebuild

This directory contains the native Godot port. The original React/Vite game remains untouched.

## Source of truth

The original gameplay, copy, balance values and visual assets are defined in the existing web project. This Godot port reproduces that experience rather than redesigning it.

## Current implementation

- Godot 4 project configuration and portrait mobile viewport.
- Five original navigation destinations: Unbox, Closet, Studio, Market and Shop.
- Bale purchase and tap-to-reveal loop with original clothing images.
- Closet and Studio image-card grids, wash/iron timing games, live photo composition and equipment upgrades.
- Marketplace listings with live price guidance, fees, saved sale rolls, reputation, gifts and webshop unlock.
- Versioned local saves with backup recovery, plus the original 60-piece designer catalog.
- AdMob banner, interstitial and rewarded ads, EEA consent flow and rewarded game actions.
- Sequential storage progression, confirmed progress reset and Android back navigation through nested screens.
- Bundled Inter and Space Grotesk fonts for offline visual fidelity, plus an Android Gradle debug APK export preset.

## Remaining work

Android builds use the Godot AdMob v7 plugin. Development builds use Google's test app/ad IDs; the Admob node must be switched to real IDs in the release configuration before production. The game editor includes a five-second preview flow for reward testing without showing a real ad.

The Android build toolchain is not available in this environment, so APK export and device validation are still pending. Cloud account sync, a UMP privacy-options entry point and final visual review also need follow-up. See [PORT_STATUS.md](PORT_STATUS.md) for module percentages and verification notes, and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for third-party licenses.
