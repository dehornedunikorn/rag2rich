# RAG2RICH Android port — implementation status

Last updated: 2026-11-25

## Scope

Rebuild the existing RAG2RICH game as a native Godot 4 Android application. Preserve at least 90% of the original presentation, assets, navigation, gameplay and economy. The existing web project remains untouched.

## Port status by module

Percentages estimate the portion of each module implemented in Godot. Audit work and imported files alone do not count as implemented gameplay. A runnable scaffold is not a completed screen.

| Module | Completion | Evidence / remaining |
|---|---:|---|
| Original source and asset audit | 80% | Bale/item rules, Studio minigames, marketplace probability, ad rewards, gifts, webshop, storage, upgrades, reset behavior and designer rewards have been checked against the source. Auth/cloud edge cases and several peripheral flows remain. |
| Godot project foundation | 80% | Godot 4.7 portrait project, five-tab shell, nested gallery and Android back navigation, local saves, AdMob plugin and Gradle Android debug APK preset are integrated. Export and device validation remain. |
| Original visual recreation | 80% | Original bale art, all 26 item images and 55 designer images are in the project. Inter and Space Grotesk are bundled with their licenses; image grids, rarity accents, live bale hints and the photo preview/backdrop/quality controls are implemented. Device visual review and remaining detail polish remain. |
| Bale / item gameplay | 80% | Bale prices, starting coins, 15 item templates, rarity-weighted selection, repeated tap reveal, bale/reveal progress, item weights, conditions, variants, in-place reveal updates, tap animation, close/save state and storage feedback are implemented. Audio polish and gameplay balance validation remain. |
| Inventory and studio processing | 90% | Closet capacity and selection, original item images, wash/iron timing games, photo composition with backdrop and lighting selection, explicit photo capture, listing handoff, persistent designer discovery and rewarded Magic Laundry/designer drops are implemented. Android device visual validation remains. |
| Marketplace and economy | 100% | Source-matched listing fee and suggested price, live fair/pricey/overpriced quote, market sale probability/ticks, reputation milestones, five-upload gifts, webshop fee/speed bonuses, pull/unlist flow and rewarded five-listing sales are implemented. Android device QA is tracked in the build/release module. |
| Upgrades and webshop | 83% | Sequential storage tiers, all three equipment tracks, source prices/effects, webshop unlock and confirmed progress reset are implemented. Progression balance and device validation remain. |
| Save / cloud / offline progression | 85% | Versioned local ConfigFile saves cover game state and listing ticks; save loads validate values and recover from a backup file. Cloud sync and offline market progression remain unimplemented. |
| AdMob and GDPR/UMP | 80% | Godot AdMob v7 is integrated with test IDs by default, startup UMP consent, banner and rewarded ads, all three reward actions, and source-matched 10-minute interstitials. A dedicated privacy-options entry point and Android/device ad validation remain. |
| Android build, optimization and release tests | 15% | A Gradle Android debug APK preset is configured for package `com.ragtorich.game`, ARM64 and target API 36. Godot can import and launch the project, but no JDK/Android SDK/ADB is available here, so APK export, Android device test, performance pass and release check remain. |

**Overall implementation estimate: 77%.** This is the equal-weight mean of the ten module estimates above (77.3%, rounded). All modules that can be advanced without the unavailable Android toolchain or external cloud credentials are now at or above 80%; the Android build and release module remains below that threshold. Cloud sync, a UMP privacy-options entry point and Android release validation remain.

## Assets

The Android project includes the original bale image, 26 clothing images, 55 designer images and a 60-item designer catalog exported from the web project. No substitute assets were created or introduced. Five designer data IDs have no matching image filename in the source asset folder; the Godot catalog uses their original emoji fallback.

## Verification

- Godot 4.7.2 headless editor import and project launch completed with the AdMob v7 plugin enabled and no script parse errors before the latest font, export-preset, bale-feedback and interstitial changes.
- `git diff --check` passed after the latest changes. The Android export preset and latest runtime changes have not been validated in Godot in this environment.
- The Android AdMob v7.0 archive SHA-256 was verified against its GitHub release metadata before importing the plugin and AAR files.
- No Android APK/AAB export or real-device test has been performed.

## Next steps

1. Install/configure the Android export toolchain, then produce and test an APK/AAB on Android hardware.
2. Add a user-accessible UMP privacy-options entry point and validate consent on device.
3. Audit and tune bale, storage and marketplace progression together.
4. Complete the visual, performance and release validation passes.
