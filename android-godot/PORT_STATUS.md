# RAG2RICH Android port — implementation status

Last updated: 2026-11-25

## Scope

Rebuild the existing RAG2RICH game as a native Godot 4 Android application. Preserve at least 90% of the original presentation, assets, navigation, gameplay and economy. The existing web project remains untouched.

## Port status by module

Percentages estimate the portion of each module implemented in Godot. Audit work and imported files alone do not count as implemented gameplay. A runnable scaffold is not a completed screen.

| Module | Completion | Evidence / remaining |
|---|---:|---|
| Original source and asset audit | 45% | Main screens, models, asset paths and bale/item rules inspected. Detailed processing, market, storage/equipment and ad states still need a complete audit. |
| Godot project foundation | 35% | Godot 4 project, portrait configuration, main scene, five-tab shell and bale/closet scaffold. Headless project launch succeeds; Android export/device validation remains. |
| Original visual recreation | 15% | Original bale art, all 26 item images and 55 designer images are copied into the Godot project. Bale and item-variant images are wired into UI. Original fonts, full screen styling and designer collection presentation remain. |
| Bale / item gameplay | 25% | Bale prices, starting coins, 15 item templates, rarity-weighted selection, repeated tap reveal, item weights, conditions and item variants implemented. Designer drops, full state handling and fidelity validation remain. |
| Inventory and studio processing | 35% | Closet item selection, item status, original item image, wash/iron timing games, photo backdrops/lighting and condition/quality updates are implemented. Processing controls are not yet visually validated on a device; item gallery and reward ad flow remain. |
| Marketplace and economy | 0% | Listings, upload fees, market ticks, sale probability, reputation, gifts and webshop flow not ported. |
| Upgrades and webshop | 20% | Storage purchases and three equipment upgrade tracks are implemented with original prices/bonuses; washer, iron and lighting upgrades affect Studio outcomes. Webshop unlock and full progression remain. |
| Save / cloud / offline progression | 0% | No local save, cloud sync or offline market progression in Godot. |
| AdMob and GDPR/UMP | 0% | No Godot ad SDK, consent flow or Android privacy integration. |
| Android build, optimization and release tests | 3% | Godot 4.7.2 headless asset import and project launch succeeded. No APK/AAB export, Android device test, performance pass or release check. |

**Overall implementation estimate: 18%.** This is a weighted estimate across modules; the five-tab scaffold is runnable, but the port is not yet a playable replica.

## Assets

The Android project includes the original bale image, 26 clothing images and 55 designer images from the web project. No substitute assets were created or introduced. Five designer data IDs have no matching image filename in the source asset folder; the original web game uses its emoji fallback for those items.

## Verification

- Godot 4.7.2 headless import processed the imported image assets.
- Godot 4.7.2 headless project launch exited successfully without script parse or image-loading errors after the Studio and equipment changes.
- No Android APK/AAB export or real-device test has been performed.

## Next steps

1. Finish the source audit for screen states, processing mini-games, marketplace balance and progression.
2. Port inventory selection and full Studio processing.
3. Port marketplace listings, sales, reputation and free-upload events.
4. Port equipment, webshop and complete storage upgrade rules.
5. Add local persistence and evaluate cloud/offline behavior for a standalone Android build.
6. Integrate Android ads and the EEA consent flow.
7. Recreate typography, remaining visual details and designer collection UI using only original assets.
8. Export and test APK/AAB on Android hardware.
