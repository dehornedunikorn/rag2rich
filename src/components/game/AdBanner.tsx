import { Capacitor } from "@capacitor/core";

/**
 * On native: AdMob renders the real banner overlayed at the bottom of the
 * webview — this component just reserves the equivalent vertical space so the
 * app content isn't covered.
 * On web: shows a small "Ad" placeholder so layout is consistent in preview.
 */
export const AdBanner = () => {
  if (Capacitor.isNativePlatform()) {
    // ~50dp adaptive banner; AdMob draws over the webview at BOTTOM_CENTER.
    return <div aria-hidden className="h-[60px] w-full" />;
  }
  return (
    <div
      aria-label="Advertisement"
      className="mx-3 mb-2 mt-1 rounded-xl border border-dashed border-border bg-secondary/40 h-12 grid place-items-center"
    >
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Ad · banner (AdMob on device)
      </p>
    </div>
  );
};
