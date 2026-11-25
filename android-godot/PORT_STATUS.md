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
| Save / cloud / offline progression | 90% | Versioned local ConfigFile saves cover game state and listing ticks. Full reset now deletes both the current save and backup before writing defaults, preventing an old backup from restoring pre-reset progress. Cloud sync and offline market progression remain unimplemented. |
| AdMob and GDPR/UMP | 70% | Godot AdMob v7 remains integrated with test IDs, startup UMP consent, banner/interstitial/rewarded ads and source-matched reward actions. A persistent in-app advertising opt-out now blocks ad requests, removes loaded ads and hides rewarded entry points. Important limitation: this plugin version exposes consent reset for testing but does not expose Google's dedicated UMP privacy-options form; the local opt-out is not equivalent to changing or erasing the UMP consent record. Android/device ad validation remains. |
| Android build, optimization and release tests | 40% | GitHub Actions successfully exported a Godot 4.7.2 Android debug APK with Java 17, API 36, min API 24 and ARM64. The `rag2rich-debug-apk` artifact is available from the [successful Actions run](https://github.com/dehornedunikorn/rag2rich/actions/runs/45601733188) for 14 days. Android installation/runtime test, performance pass and release signing remain. |

**Overall implementation estimate: 85%.** This is the equal-weight mean of the ten module estimates above (84.5%, rounded). Bale/item, inventory/studio, marketplace/economy and upgrades/webshop have full source-defined feature coverage, and the first Android debug APK has been built. Cloud account sync and Android device/release validation remain.

## Latest targeted fixes (2026-11-25)

- Marketplace: sale ticks and timed listing gifts no longer rebuild the Market screen while a listing price editor is open, preserving the user's in-progress price entry.
- Designer catalog: the JSON catalog is read at startup, but original designer JPGs are now loaded on demand when an owned gallery card, designer detail, or designer item thumbnail needs one. No substitute artwork was added.
- Advertising: a persistent device-local opt-out now stops banner/interstitial/rewarded ad requests, removes already loaded ads and hides rewarded-ad entry points. This is a practical app-level ad stop, **not** the official UMP privacy-options form.
- Reset: reset removes both savegame.cfg and savegame.bak before writing fresh defaults, and the next save skips copying pre-reset state into the backup.
- Verification caveat: these changes have been statically inspected in the GitHub source only. No Godot editor import, runtime playtest, APK export or Android device test was run for these latest fixes. The dedicated UMP privacy-options UI remains unimplemented because the installed Cengiz AdMob v7 wrapper exposes reset_consent_info() (documented as a testing/debugging operation) but no show_privacy_options_form() API; do not use the testing reset as a production consent-revocation mechanism.

## Assets

The Android project includes the original bale image, 26 clothing images, 55 designer images and a 60-item designer catalog exported from the web project. No substitute assets were created or introduced. Five designer data IDs have no matching image filename in the source asset folder; the Godot catalog uses their original emoji fallback.

## Verification

- Godot 4.7.2 headless editor import and project launch completed with the AdMob v7 plugin enabled and no script parse errors before the latest font, export-preset, bale-feedback and interstitial changes.
- GitHub Actions successfully imported and exported the Android project and uploaded a debug APK artifact. The latest build confirms Godot project import, Android Gradle template setup and APK generation.
- The Android AdMob v7.0 archive SHA-256 was verified against its GitHub release metadata before importing the plugin and AAR files.
- No Android APK/AAB export or real-device test has been performed.

## Next steps

1. Install the debug APK on Android hardware and check launch, navigation, ads and saved progress.
2. Configure the Firebase Android app and authentication client, then connect cloud saves.
3. Complete the visual/performance review and prepare a signed release build.
