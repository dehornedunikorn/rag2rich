import { useState } from "react";
import { TopBar } from "@/components/game/TopBar";
import { BottomNav, Screen } from "@/components/game/BottomNav";
import { DashboardScreen } from "@/components/game/DashboardScreen";
import { InventoryScreen } from "@/components/game/InventoryScreen";
import { StudioScreen } from "@/components/game/StudioScreen";
import { MarketScreen } from "@/components/game/MarketScreen";
import { ShopScreen } from "@/components/game/ShopScreen";
import { InventoryItem } from "@/game/types";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [pendingList, setPendingList] = useState<InventoryItem | null>(null);

  return (
    <div className="min-h-dvh flex flex-col mx-auto max-w-md w-full bg-background relative">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-2">
        {screen === "dashboard" && (
          <DashboardScreen onOpenInventory={() => setScreen("inventory")} />
        )}
        {screen === "inventory" && (
          <InventoryScreen
            onSelectItem={(item) => {
              setSelected(item);
              setScreen("studio");
            }}
          />
        )}
        {screen === "studio" && (
          <StudioScreen
            selected={selected}
            onClose={() => { setSelected(null); setScreen("inventory"); }}
            onListItem={(item) => {
              setPendingList(item);
              setSelected(null);
              setScreen("market");
            }}
          />
        )}
        {screen === "market" && (
          <MarketScreen pendingList={pendingList} onClearPendingList={() => setPendingList(null)} />
        )}
        {screen === "shop" && <ShopScreen />}
      </main>
      <BottomNav active={screen} onChange={(s) => { setSelected(null); setScreen(s); }} />
    </div>
  );
};

export default Index;
