# RAG2RICH Android port — implementation status

Last updated: 2026-11-25

## Scope

Rebuild the existing RAG2RICH game as a native Godot 4 Android application. Preserve at least 90% of the original presentation, assets, navigation, gameplay and economy. The existing web project remains untouched.

## Port status by module

Percentages estimate the portion of each module implemented in Godot. Audit work and imported files alone do not count as implemented gameplay. A runnable scaffold is not a completed screen.

| Module | Completion | Evidence / remaining |
|---|---:|---|
| Original source and asset audit | 75% | Bale/item rules, Studio minigames, marketplace probability, gifts, webshop, storage, upgrades and designer rewards have been checked against the source. Ads, GDPR/UMP and several peripheral flows remain. |
| Godot project foundation | 45% | Godot 4 portrait project, themed five-tab shell, content margins, screen routing, save/load foundation and pause/close saves. Android export/device validation remains. |
| Original visual recreation | 40% | Original bale art, all 26 item images and 55 designer images are in the project. Bale/item images, styled cards, progress bars and a 60-piece locked/unlocked designer gallery are wired into screens. Typography and visual-device review remain. |
| Bale / item gameplay | 50% | Bale prices, starting coins, 15 item templates, rarity-weighted selection, repeated tap reveal, bale/reveal progress, item weights, conditions, item variants, close and save state are implemented. Designer drops, animation/audio polish and fidelity validation remain. |
| Inventory and studio processing | 65% | Closet capacity and selection, original item images, wash/iron timing games, photo backdrops/lighting, listing handoff and the persistent designer gallery are implemented. Rewarded Magic Laundry, ad-triggered designer awards and device visual validation remain. |
| Marketplace and economy | 85% | Listing flow and fee, suggested pricing, market ticks, sale probability, reputation, five-upload gifts, webshop fee/speed bonuses and pull/unlist behavior are implemented. The ad-triggered instant-sale reward and visual/device validation remain. |
| Upgrades and webshop | 60% | All storage tiers, three equipment upgrade tracks and the webshop unlock use source prices, bonuses and thresholds. Progression balance and visual/device validation remain. |
| Save / cloud / offline progression | 75% | Local ConfigFile save/load covers coins, inventory, active bale, listings, sales/reputation, upgrades, storage, free uploads, webshop and discovered designers. Cloud sync and offline market progression remain out of scope for this standalone pass. |
| AdMob and GDPR/UMP | 0% | No Godot ad SDK, consent flow or Android privacy integration. |
| Android build, optimization and release tests | 3% | Godot 4.7.2 headless asset import and project launch succeeded. No APK/AAB export, Android device test, performance pass or release check. |

**Overall implementation estimate: 50%.** This is the equal-weight mean of the ten module estimates above (49.8%, rounded). The main bale-to-sale game loop, upgrades and local saves are playable. Ads/consent, cloud sync, complete visual fidelity and Android release validation remain.

## Assets

The Android project includes the original bale image, 26 clothing images, 55 designer images and a 60-item designer catalog exported from the web project. No substitute assets were created or introduced. Five designer data IDs have no matching image filename in the source asset folder; the Godot catalog uses their original emoji fallback.

## Verification

- Godot 4.7.2 headless project launch loaded `main.gd` and ran without script parse or runtime errors after marketplace, persistence and catalog changes.
- No Android APK/AAB export or real-device test has been performed.

## Next steps

1. Integrate rewarded-ad triggers with the designer-item award and listing-sale rewards.
2. Finish inventory and Studio polish, including the Magic Laundry flow.
3. Audit and tune bale, storage and marketplace progression together.
4. Recreate typography and remaining visual details using only original assets.
5. Integrate Android ads and the EEA consent flow.
6. Export and test APK/AAB on Android hardware.
