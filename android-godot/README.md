# RAG2RICH — native Android / Godot rebuild

This directory contains the native Godot port. The original React/Vite game remains untouched.

## Source of truth

The original gameplay, copy, balance values and visual assets are defined in the existing web project. This Godot port reproduces that experience rather than redesigning it.

## Current implementation

- Godot 4 project configuration and portrait mobile viewport.
- Five original navigation destinations: Unbox, Closet, Studio, Market and Shop.
- Bale purchase and tap-to-reveal loop with original clothing images.
- Closet item selection, wash/iron timing games, photo backdrops and equipment upgrades.
- Marketplace listings, fees, sale rolls, reputation, gifts and webshop unlock.
- Local save/load for gameplay state, plus the original 60-piece designer catalog.
- AdMob banner/rewarded-ad wiring, EEA consent flow and rewarded game actions.

## Remaining work

Android builds use the Godot AdMob v7 plugin. Development builds use Google's test app/ad IDs; the Admob node must be switched to real IDs in the release configuration before production. The game editor includes a five-second preview flow for reward testing without showing a real ad.

Android Gradle export and device validation are still pending. The cloud account sync, privacy-options entry point and final visual fidelity also need follow-up. See [PORT_STATUS.md](PORT_STATUS.md) for module percentages and verification notes, and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the AdMob plugin license and checksum.
