# RAG2RICH Android port — implementation status

Last updated: 2026-11-25

## Scope
Rebuild the existing RAG2RICH game as a native Godot 4 Android application. Preserve at least 90% of the original presentation, assets, navigation, gameplay and economy. The existing web project is not being overwritten.

## Source audit completed
- Root stack: React 18 + TypeScript + Vite + Zustand + Firebase + Capacitor.
- Original screens: Unbox/Dashboard, Closet/Inventory, Processing Studio, Marketplace, Shop.
- Navigation: five bottom tabs.
- Core item categories: 15 clothing types; item image variants are loaded from src/assets/items/*.jpg.
- Designer collection: 50 designer items; images loaded from src/assets/designer/*.jpg.
- Bale types: Mixed (120 coins), Vintage (480), Premium (1500), each 15kg.
- Starting wallet: 350 coins.
- Storage tiers: Closet (15), Room (30), Garage (100), Container (200).
- Equipment: Washing Machine, Steam Iron, Studio Lights.
- Market includes listing fees, pricing, sale ticks, reputation, webshop unlock and free-upload gifts.
- Ads in original: banner, interstitial and rewarded; rewarded flow includes Magic Laundry.
- Original visual system: dark purple/charcoal surfaces, neon purple primary, cyan accent, gold designer tier, Inter + Space Grotesk typography, rounded glass-like cards and glow effects.

## Port status by module
Percentages reflect actual ported work, not source-audit coverage.

| Module | Completion | Evidence / remaining |
|---|---:|---|
| Original source and asset audit | 25% | Main screen flow, design tokens, core data models and asset import paths inspected; full asset manifest and all component states still need inventory. |
| Godot project foundation | 15% | Project config, main scene, navigation shell and first-pass unbox/closet scaffold committed; not yet run in Godot. |
| Original visual recreation | 2% | Color tokens and layout intent mapped; original image/font files not yet imported. |
| Bale / item gameplay | 5% | Basic purchase/reveal scaffold; original weighted rarity, click-to-reveal progression, weight handling and designer drops not ported. |
| Inventory and studio processing | 0% | Not ported. |
| Marketplace and economy | 0% | Not ported. |
| Upgrades and webshop | 0% | Not ported. |
| Save / cloud / offline progression | 0% | Not ported. |
| AdMob and GDPR/UMP | 0% | Not ported; plugin and consent integration still to be selected and implemented. |
| Android build, optimization and release tests | 0% | No APK/AAB built or device-tested. |

Overall implementation estimate: **3%** (early scaffolding only; not a playable port).

## Immediate next steps
1. Obtain and import the original item/designer/background/font assets without substitution.
2. Complete source audit of all screens, dialogs, mini-games, progression and balancing.
3. Recreate the original visual system and screen geometry in Godot.
4. Port the complete Zustand game state and rules.
5. Port persistence, cloud sync and offline-safe market progression.
6. Integrate AdMob with test ad units and EEA consent flow.
7. Build, install and test Android APK/AAB on a real device.

## Verification
No Godot editor/runtime validation, Android export, real-device test, or ad request has been performed yet.
