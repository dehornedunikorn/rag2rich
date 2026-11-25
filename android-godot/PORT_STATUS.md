# RAG2RICH Android port — implementation status

Last updated: 2026-11-25

## Scope

Rebuild the existing RAG2RICH game as a native Godot 4 Android application. Preserve at least 90% of the original presentation, assets, navigation, gameplay and economy. The existing web project remains untouched.

## Port status by module

Percentages estimate the portion of each module implemented in Godot. Audit work and imported files alone do not count as implemented gameplay. A runnable scaffold is not a completed screen.

| Module | Completion | Evidence / remaining |
|---|---:|---|
| Original source and asset audit | 80% | Bale/item rules, Studio minigames, marketplace probability, ad rewards, gifts, webshop, storage, upgrades, reset behavior and designer rewards have been checked against the source. Auth/cloud edge cases and several peripheral flows remain. |
| Godot project foundation | 65% | Godot 4.7 portrait project, themed five-tab shell, nested gallery navigation, Android back navigation, local saves and the Android AdMob plugin are integrated. Android export/device validation remains. |
| Original visual recreation | 60% | Original bale art, all 26 item images and 55 designer images are in the project. Inventory and Studio use image cards with rarity accents; photo mode now has a live item preview, backdrop choices and quality estimate. Typography and visual-device review remain. |
| Bale / item gameplay | 60% | Bale prices, starting coins, 15 item templates, rarity-weighted selection, repeated tap reveal, bale/reveal progress, item weights, conditions, item variants, close/save state and reveal feedback are implemented. Animation/audio polish and fidelity validation remain. |
| Inventory and studio processing | 90% | Closet capacity and selection, original item images, wash/iron timing games, photo composition with backdrop and lighting selection, explicit photo capture, listing handoff, persistent designer discovery and rewarded Magic Laundry/designer drops are implemented. Android device visual validation remains. |
| Marketplace and economy | 95% | Listing flow and fee, suggested pricing, persisted market ticks, sale probability, reputation, five-upload gifts, webshop fee/speed bonuses, pull/unlist behavior, rewarded five-listing sales and sale feedback are implemented. Android device validation remains. |
| Upgrades and webshop | 83% | Sequential storage tiers, all three equipment tracks, source prices/effects, webshop unlock and confirmed progress reset are implemented. Progression balance and device validation remain. |
| Save / cloud / offline progression | 85% | Versioned local ConfigFile saves cover game state and listing ticks; save loads validate values and recover from a backup file. Cloud sync and offline market progression remain unimplemented. |
| AdMob and GDPR/UMP | 75% | Godot AdMob v7 is integrated with test IDs by default, startup UMP consent, a banner, rewarded ads, editor-only preview ads and all three reward actions. A dedicated privacy-options entry point and Android/device ad validation remain. |
| Android build, optimization and release tests | 8% | Godot 4.7.2 headless import and project launch succeeded with the AdMob plugin enabled. No JDK/Android SDK/ADB is available here, so APK/AAB export, Android device test, performance pass and release check remain. |

**Overall implementation estimate: 70%.** This is the equal-weight mean of the ten module estimates above (70.1%, rounded). The main bale-to-sale loop, Studio processing, upgrades, local saves and rewarded actions are playable. Cloud sync, the UMP privacy-options entry point, complete visual fidelity and Android release validation remain.

## Assets

The Android project includes the original bale image, 26 clothing images, 55 designer images and a 60-item designer catalog exported from the web project. No substitute assets were created or introduced. Five designer data IDs have no matching image filename in the source asset folder; the Godot catalog uses their original emoji fallback.

## Verification

- Godot 4.7.2 headless editor import and project launch completed with the AdMob v7 plugin enabled and no script parse errors.
- The Android AdMob v7.0 archive SHA-256 was verified against its GitHub release metadata before importing the plugin and AAR files.
- No Android APK/AAB export or real-device test has been performed.

## Next steps

1. Install/configure the Android export toolchain, then produce and test an APK/AAB on Android hardware.
2. Add a user-accessible UMP privacy-options entry point and validate the consent flow on device.
3. Recreate typography and remaining visual details using only original assets.
4. Audit and tune bale, storage and marketplace progression together.
5. Complete the visual, performance and release validation passes.
