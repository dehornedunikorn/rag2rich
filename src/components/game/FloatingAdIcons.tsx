import { useEffect, useState } from "react";
import { Sparkles, Gem } from "lucide-react";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { playRewardedAd } from "@/game/ads";
import { AdModal } from "./AdModal";

/**
 * Periodic, time-limited rewarded-ad icons that float over the app.
 *
 *  • Golden Register — every 5 minutes, visible for 20 seconds.
 *      Watching the ad sells 5 RANDOM listings.
 *  • Designer Drop  — every 15 minutes, visible for 10 seconds.
 *      Watching the ad grants 1 random Designer item.
 *
 * Both icons disappear after their visibility window or after being claimed.
 */

const REGISTER_INTERVAL_MS = 5 * 60 * 1000; // 5 min
const REGISTER_VISIBLE_MS = 20 * 1000;       // 20 s

const DESIGNER_INTERVAL_MS = 15 * 60 * 1000; // 15 min
const DESIGNER_VISIBLE_MS = 10 * 1000;       // 10 s

export const FloatingAdIcons = () => {
  const sellRandom = useGame((s) => s.sellRandomListings);
  const awardDesigner = useGame((s) => s.awardDesigner);

  const [registerVisible, setRegisterVisible] = useState(false);
  const [designerVisible, setDesignerVisible] = useState(false);

  const [registerAdOpen, setRegisterAdOpen] = useState(false);
  const [designerAdOpen, setDesignerAdOpen] = useState(false);

  // tick countdown so we can render seconds remaining
  const [now, setNow] = useState(Date.now());
  const [registerHideAt, setRegisterHideAt] = useState<number | null>(null);
  const [designerHideAt, setDesignerHideAt] = useState<number | null>(null);

  // Schedule repeating reveal windows.
  useEffect(() => {
    const showRegister = () => {
      setRegisterVisible(true);
      setRegisterHideAt(Date.now() + REGISTER_VISIBLE_MS);
      setTimeout(() => {
        setRegisterVisible(false);
        setRegisterHideAt(null);
      }, REGISTER_VISIBLE_MS);
    };
    const showDesigner = () => {
      setDesignerVisible(true);
      setDesignerHideAt(Date.now() + DESIGNER_VISIBLE_MS);
      setTimeout(() => {
        setDesignerVisible(false);
        setDesignerHideAt(null);
      }, DESIGNER_VISIBLE_MS);
    };

    // First reveal happens after the interval (rare opportunities).
    const r = setInterval(showRegister, REGISTER_INTERVAL_MS);
    const d = setInterval(showDesigner, DESIGNER_INTERVAL_MS);
    return () => { clearInterval(r); clearInterval(d); };
  }, []);

  // 1Hz ticker only while an icon is visible
  useEffect(() => {
    if (!registerVisible && !designerVisible) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [registerVisible, designerVisible]);

  const registerSecondsLeft = registerHideAt ? Math.max(0, Math.ceil((registerHideAt - now) / 1000)) : 0;
  const designerSecondsLeft = designerHideAt ? Math.max(0, Math.ceil((designerHideAt - now) / 1000)) : 0;

  return (
    <>
      {/* Floating icons stacked above the bottom nav. */}
      <div className="pointer-events-none fixed inset-0 z-30 mx-auto max-w-md">
        {registerVisible && (
          <button
            onClick={() => { setRegisterVisible(false); setRegisterAdOpen(true); }}
            className={cn(
              "pointer-events-auto absolute right-3 bottom-28",
              "h-14 w-14 rounded-full grid place-items-center",
              "bg-gradient-to-br from-gold to-amber-500 text-gold-foreground",
              "border-2 border-gold shadow-[0_0_20px_hsl(var(--gold)/0.6)]",
              "animate-bounce tap-scale"
            )}
            aria-label="Golden Register — watch ad to sell 5 random listings"
          >
            <Sparkles className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-background border border-gold rounded-full px-1.5 py-0.5 tabular-nums">
              {registerSecondsLeft}s
            </span>
          </button>
        )}

        {designerVisible && (
          <button
            onClick={() => { setDesignerVisible(false); setDesignerAdOpen(true); }}
            className={cn(
              "pointer-events-auto absolute left-3 bottom-28",
              "h-14 w-14 rounded-full grid place-items-center",
              "bg-gradient-to-br from-primary to-accent text-primary-foreground",
              "border-2 border-primary-glow shadow-neon",
              "animate-bounce tap-scale"
            )}
            aria-label="Designer Drop — watch ad for 1 random designer item"
          >
            <Gem className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-background border border-primary rounded-full px-1.5 py-0.5 tabular-nums">
              {designerSecondsLeft}s
            </span>
          </button>
        )}
      </div>

      <AdModal
        open={registerAdOpen}
        title="Golden Register"
        duration={5}
        rewardLabel="Sell 5 random listings instantly"
        onComplete={async () => {
          await playRewardedAd("golden_register");
          const { sold, earned } = sellRandom(5);
          setRegisterAdOpen(false);
          if (sold > 0) toast.success("Register cha-ching!", { description: `${sold} sold · +${earned}c` });
          else toast("Nothing was listed to sell");
        }}
        onSkip={() => setRegisterAdOpen(false)}
      />

      <AdModal
        open={designerAdOpen}
        title="Designer Drop"
        duration={5}
        rewardLabel="1 random Designer item"
        onComplete={async () => {
          await playRewardedAd("designer_drop");
          setDesignerAdOpen(false);
          const got = awardDesigner();
          if (got) toast.success(`Designer Drop! ${got.name}`, { description: "Check your closet" });
          else toast.error("No room — upgrade storage first");
        }}
        onSkip={() => setDesignerAdOpen(false)}
      />
    </>
  );
};
