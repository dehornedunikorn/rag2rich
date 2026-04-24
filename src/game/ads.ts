/**
 * Ad system stubs.
 *
 * In production these would call AdSense / AdMob / Unity Ads / etc.
 * For now they just resolve immediately so the game loop is testable.
 *
 * To wire a real provider:
 *   1. Replace the body of `playRewardedAd` to await the SDK callback.
 *   2. Replace `playInterstitialAd` similarly.
 *   3. Replace the AdBanner component (src/components/game/AdBanner.tsx)
 *      with the real banner script tag.
 */

export type AdSlot =
  | "designer_drop"      // 30s rewarded — 1 random Designer item
  | "magic_laundry"      // rewarded — repair all inventory to 100%
  | "golden_register"    // rewarded — instantly sell up to 5 listings
  | "interstitial";      // 10-min full-screen

export interface AdResult {
  slot: AdSlot;
  watched: boolean; // false = user skipped / no fill
}

export async function playRewardedAd(slot: AdSlot): Promise<AdResult> {
  // TODO: integrate AdSense / AdMob SDK here.
  // For now we resolve as if the user watched the full ad.
  console.info(`[ads] (stub) playing rewarded ad for slot: ${slot}`);
  return { slot, watched: true };
}

export async function playInterstitialAd(): Promise<AdResult> {
  console.info("[ads] (stub) playing interstitial");
  return { slot: "interstitial", watched: true };
}
