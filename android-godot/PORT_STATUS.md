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
| Original visual recreation | 85% | Original bale art, all 26 item images and 55 designer images are in the project. Inter and Space Grotesk are bundled with their licenses; image grids, rarity accents, live bale hints, animated tap/reveal effects, progress indicators, heat/safe zones and photo controls are implemented. Device visual review remains. |
| Bale / item gameplay | 100% | The original bale prices, item table and weighted rarity formula, leftover-weight fallback, tap counts, storage cap, item variants/condition, reveal state and save/close behavior match the source. In-place progress, tap animation, sparkle/reveal pops and storage feedback are implemented. Android playtest is tracked separately under build/release. |
| Inventory and studio processing | 100% | Closet capacity and selection, readiness markers, original item images, condition/photo meters, source-matched wash/iron timing games, photo composition with backdrop and lighting selection, explicit capture, listing handoff, persistent designer discovery and rewarded Magic Laundry/designer drops are implemented. Android device validation is tracked in the build/release module. |
| Marketplace and economy | 100% | Source-matched listing fee and suggested price, live fair/pricey/overpriced quote, market sale probability/ticks, reputation milestones, five-upload gifts, webshop fee/speed bonuses, pull/unlist flow and rewarded five-listing sales are implemented. Android device QA is tracked in the build/release module. |
| Upgrades and webshop | 100% | All four storage capacities/costs and sequential purchase rules, three equipment tracks with every source level/price/effect, webshop price/reputation gate/benefits, and confirmed full reset match the source. Android playtest is tracked separately under build/release. |
| Save / cloud / offline progression | 85% | Versioned local ConfigFile saves cover game state and listing ticks; save loads validate values and recover from a backup file. Cloud sync and offline market progression remain unimplemented. |
| AdMob and GDPR/UMP | 85% | Godot AdMob v7 is integrated with test IDs by default, startup and user-accessible Shop-screen UMP consent, banner and rewarded ads, all three reward actions, and source-matched 10-minute interstitials. Android/device ad validation remains. |
| Android build, optimization and release tests | 20% | A GitHub Actions workflow now provisions Godot 4.7.2, Java 17 and Android API 36, then exports an unsigned debug APK artifact; the preset uses min API 24 and ARM64. The export is still being resolved through CI, and Android device test, performance pass and release signing remain. |

**Overall implementation estimate: 83%.** This is the equal-weight mean of the ten module estimates above (83.0%). Bale/item, inventory/studio, marketplace/economy and upgrades/webshop now have full source-defined feature coverage. Cloud account sync and Android release validation remain.

## Assets

The Android project includes the original bale image, 26 clothing images, 55 designer images and a 60-item designer catalog exported from the web project. No substitute assets were created or introduced. Five designer data IDs have no matching image filename in the source asset folder; the Godot catalog uses their original emoji fallback.

## Verification

- Godot 4.7.2 headless editor import and project launch completed with the AdMob v7 plugin enabled and no script parse errors before the latest font, export-preset, bale-feedback and interstitial changes.
- No Godot executable, Java, Android SDK or ADB is available in this environment. The latest UI and animation changes have not been validated in the editor or on device.
- The Android AdMob v7.0 archive SHA-256 was verified against its GitHub release metadata before importing the plugin and AAR files.
- No Android APK/AAB export or real-device test has been performed.

## Next steps

1. Install/configure the Android export toolchain, then produce and test an APK/AAB on Android hardware.
2. Connect cloud saves after configuring the Firebase Android app and authentication client.
3. Complete the visual and performance review on Android hardware.
