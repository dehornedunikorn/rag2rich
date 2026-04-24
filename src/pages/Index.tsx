import { useEffect, useState } from "react";
import { TopBar } from "@/components/game/TopBar";
import { BottomNav, Screen } from "@/components/game/BottomNav";
import { DashboardScreen } from "@/components/game/DashboardScreen";
import { InventoryScreen } from "@/components/game/InventoryScreen";
import { StudioScreen } from "@/components/game/StudioScreen";
import { MarketScreen } from "@/components/game/MarketScreen";
import { ShopScreen } from "@/components/game/ShopScreen";
import { StudioGallery } from "@/components/game/StudioGallery";
import { AdBanner } from "@/components/game/AdBanner";
import { AdModal } from "@/components/game/AdModal";
import { InventoryItem } from "@/game/types";
import { useFirebaseUser, useFirestoreSync } from "@/game/firestoreSync";
import { playInterstitialAd } from "@/game/ads";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [pendingList, setPendingList] = useState<InventoryItem | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [interstitialOpen, setInterstitialOpen] = useState(false);

  const { user } = useFirebaseUser();
  useFirestoreSync(user);

  // 10-min interstitial loop
  useEffect(() => {
    const t = setInterval(() => setInterstitialOpen(true), 10 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-dvh flex flex-col mx-auto max-w-md w-full bg-background relative">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-2">
        {galleryOpen ? (
          <StudioGallery onClose={() => setGalleryOpen(false)} />
        ) : (
          <>
            {screen === "dashboard" && (
              <DashboardScreen onOpenInventory={() => setScreen("inventory")} />
            )}
            {screen === "inventory" && (
              <InventoryScreen
                onSelectItem={(item) => { setSelected(item); setScreen("studio"); }}
                onOpenGallery={() => setGalleryOpen(true)}
              />
            )}
            {screen === "studio" && (
              <StudioScreen
                selected={selected}
                onClose={() => { setSelected(null); setScreen("inventory"); }}
                onListItem={(item) => { setPendingList(item); setSelected(null); setScreen("market"); }}
                onOpenGallery={() => setGalleryOpen(true)}
              />
            )}
            {screen === "market" && (
              <MarketScreen pendingList={pendingList} onClearPendingList={() => setPendingList(null)} />
            )}
            {screen === "shop" && <ShopScreen />}
          </>
        )}
      </main>
      <AdBanner />
      <BottomNav active={screen} onChange={(s) => { setSelected(null); setGalleryOpen(false); setScreen(s); }} />

      <AdModal
        open={interstitialOpen}
        title="Sponsored Break"
        duration={5}
        onComplete={async () => { await playInterstitialAd(); setInterstitialOpen(false); }}
        onSkip={() => setInterstitialOpen(false)}
      />
    </div>
  );
};

export default Index;
