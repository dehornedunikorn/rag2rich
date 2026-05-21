/**
 * Compatibility shim — re-exports the AdMob wrapper using the old API names
 * so existing call sites keep working.
 */
import { showInterstitial, showRewarded, type RewardSlot } from "./admob";

export type AdSlot = RewardSlot | "interstitial";

export interface AdResult {
  slot: AdSlot;
  watched: boolean;
}

export async function playRewardedAd(slot: RewardSlot): Promise<AdResult> {
  const reward = await showRewarded(slot);
  return { slot, watched: reward !== null };
}

export async function playInterstitialAd(): Promise<AdResult> {
  const ok = await showInterstitial();
  return { slot: "interstitial", watched: ok };
}
