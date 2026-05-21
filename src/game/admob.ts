/**
 * Capacitor AdMob integration.
 *
 * On native platforms this calls the real @capacitor-community/admob SDK.
 * On the web (preview / desktop) every call is a graceful no-op that resolves
 * as if the user successfully watched the ad, so the in-app rewards still fire
 * during development.
 */

import { Capacitor } from "@capacitor/core";
import {
  AdMob,
  AdmobConsentStatus,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
  RewardAdPluginEvents,
  type AdMobRewardItem,
  type BannerAdOptions,
  type RewardAdOptions,
  type InterstitialAdOptions,
} from "@capacitor-community/admob";

export const ADMOB_IDS = {
  appId: "ca-app-pub-9803076819193345~9013349574",
  banner: "ca-app-pub-9803076819193345/8899696714",
  interstitial: "ca-app-pub-9803076819193345/8367693765",
  rewarded: "ca-app-pub-9803076819193345/2142716678",
} as const;

const isNative = () => Capacitor.isNativePlatform();

let initialized = false;
let bannerShown = false;

/** Initialize the SDK once at app startup. Safe to call multiple times. */
export async function initAdMob(): Promise<void> {
  if (initialized || !isNative()) {
    initialized = true;
    return;
  }
  try {
    await AdMob.initialize({
      initializeForTesting: false,
    });

    // Request consent / tracking if required (GDPR / ATT). Failures are non-fatal.
    try {
      const consent = await AdMob.requestConsentInfo();
      if (
        consent.isConsentFormAvailable &&
        consent.status === AdmobConsentStatus.REQUIRED
      ) {
        await AdMob.showConsentForm();
      }
    } catch (e) {
      console.warn("[admob] consent flow skipped", e);
    }
    try {
      await AdMob.trackingAuthorizationStatus();
    } catch (e) {
      console.warn("[admob] ATT skipped", e);
    }

    initialized = true;
    console.info("[admob] initialized");
  } catch (e) {
    console.error("[admob] init failed", e);
  }
}

/* -------------------------------------------------------------------------- */
/* Banner                                                                      */
/* -------------------------------------------------------------------------- */

export async function showBanner(): Promise<void> {
  if (!isNative() || bannerShown) return;
  await initAdMob();
  const options: BannerAdOptions = {
    adId: ADMOB_IDS.banner,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: false,
  };
  try {
    await AdMob.showBanner(options);
    bannerShown = true;
    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (info) => {
      console.warn("[admob] banner failed to load", info);
    });
  } catch (e) {
    console.error("[admob] showBanner failed", e);
  }
}

export async function hideBanner(): Promise<void> {
  if (!isNative() || !bannerShown) return;
  try {
    await AdMob.hideBanner();
    bannerShown = false;
  } catch (e) {
    console.error("[admob] hideBanner failed", e);
  }
}

/* -------------------------------------------------------------------------- */
/* Interstitial                                                                */
/* -------------------------------------------------------------------------- */

export async function showInterstitial(): Promise<boolean> {
  if (!isNative()) {
    console.info("[admob] (web stub) interstitial shown");
    return true;
  }
  await initAdMob();
  const options: InterstitialAdOptions = {
    adId: ADMOB_IDS.interstitial,
    isTesting: false,
  };
  try {
    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
    return true;
  } catch (e) {
    console.error("[admob] interstitial failed", e);
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* Rewarded                                                                    */
/* -------------------------------------------------------------------------- */

export type RewardSlot = "magic_laundry" | "golden_register" | "designer_drop";

/**
 * Show a rewarded video. Resolves with the AdMobRewardItem ONLY when the user
 * actually earned the reward (onAdRewardReceived). Resolves with `null` if the
 * user dismissed the ad early or it failed to load.
 *
 * On web preview this resolves with a synthetic reward so dev flows still work.
 */
export async function showRewarded(
  slot: RewardSlot,
): Promise<AdMobRewardItem | null> {
  if (!isNative()) {
    console.info(`[admob] (web stub) rewarded granted for ${slot}`);
    return { type: slot, amount: 1 };
  }
  await initAdMob();

  const options: RewardAdOptions = {
    adId: ADMOB_IDS.rewarded,
    isTesting: false,
  };

  return new Promise<AdMobRewardItem | null>(async (resolve) => {
    let settled = false;
    const settle = (value: AdMobRewardItem | null) => {
      if (settled) return;
      settled = true;
      rewardListener?.remove();
      dismissListener?.remove();
      failedListener?.remove();
      resolve(value);
    };

    const rewardListener = await AdMob.addListener(
      RewardAdPluginEvents.Rewarded,
      (reward: AdMobRewardItem) => settle(reward),
    );
    const dismissListener = await AdMob.addListener(
      RewardAdPluginEvents.Dismissed,
      () => settle(null),
    );
    const failedListener = await AdMob.addListener(
      RewardAdPluginEvents.FailedToLoad,
      (err) => {
        console.warn("[admob] rewarded failed to load", err);
        settle(null);
      },
    );

    try {
      await AdMob.prepareRewardVideoAd(options);
      await AdMob.showRewardVideoAd();
    } catch (e) {
      console.error("[admob] rewarded failed", e);
      settle(null);
    }
  });
}
