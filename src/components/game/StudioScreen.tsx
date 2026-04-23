import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/store";
import { InventoryItem, UPGRADES } from "@/game/types";
import { StatBar } from "./StatBar";
import { RarityBadge } from "./RarityBadge";
import { cn } from "@/lib/utils";
import { Camera, Droplets, Tag, X } from "lucide-react";
import { toast } from "sonner";

type Mode = "menu" | "wash" | "photo";

const BACKDROPS = [
  { id: "white",  label: "White",  emoji: "⬜", quality: 30 },
  { id: "studio", label: "Studio", emoji: "🎬", quality: 60 },
  { id: "nature", label: "Nature", emoji: "🌿", quality: 80 },
  { id: "neon",   label: "Neon",   emoji: "💜", quality: 95 },
];

export const StudioScreen = ({
  selected,
  onClose,
  onListItem,
}: {
  selected: InventoryItem | null;
  onClose: () => void;
  onListItem: (item: InventoryItem) => void;
}) => {
  const inventory = useGame((s) => s.inventory);
  const setItemCondition = useGame((s) => s.setItemCondition);
  const setItemPhoto = useGame((s) => s.setItemPhoto);
  const markWashed = useGame((s) => s.markWashed);
  const markPhotographed = useGame((s) => s.markPhotographed);
  const upgradeLevels = useGame((s) => s.upgradeLevels);

  const item = selected ? inventory.find((i) => i.id === selected.id) ?? null : null;

  const [mode, setMode] = useState<Mode>("menu");
  useEffect(() => setMode("menu"), [selected?.id]);

  if (!item) {
    return (
      <div className="px-4 py-4 animate-fade-in">
        <h1 className="text-2xl font-display font-bold neon-text mb-1">Processing Studio</h1>
        <p className="text-sm text-muted-foreground mb-6">Pick an item from your closet to start refurbishing.</p>
        <StudioPicks />
      </div>
    );
  }

  const washerBonus = UPGRADES[0].levels[upgradeLevels.washer].bonus;
  const ironBonus = UPGRADES[1].levels[upgradeLevels.iron].bonus;
  const lightsCap = UPGRADES[2].levels[upgradeLevels.lights].bonus;

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold">Studio</h1>
        <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-full bg-secondary border border-border tap-scale">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-2xl glass p-4">
        <div className="flex items-center gap-3">
          <div className="h-20 w-20 grid place-items-center rounded-xl bg-gradient-bale text-5xl border border-border">
            {item.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-display font-bold truncate">{item.name}</h2>
              <RarityBadge rarity={item.rarity} />
            </div>
            <StatBar value={item.condition} color={item.condition > 70 ? "success" : "warning"} label="Condition" />
            <StatBar value={item.photoQuality} color="accent" label="Photo" className="mt-2" />
          </div>
        </div>
      </div>

      {mode === "menu" && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode("wash")}
            className="rounded-2xl p-4 bg-gradient-surface border border-border tap-scale flex flex-col items-start gap-2 hover:border-accent/60"
          >
            <Droplets className="h-6 w-6 text-accent" />
            <p className="font-display font-bold">Wash & Iron</p>
            <p className="text-xs text-muted-foreground">Mini-game to boost condition.</p>
          </button>
          <button
            onClick={() => setMode("photo")}
            className="rounded-2xl p-4 bg-gradient-surface border border-border tap-scale flex flex-col items-start gap-2 hover:border-primary/60"
          >
            <Camera className="h-6 w-6 text-primary" />
            <p className="font-display font-bold">Photo Mode</p>
            <p className="text-xs text-muted-foreground">Pick a backdrop & lighting.</p>
          </button>
          <button
            onClick={() => onListItem(item)}
            className="col-span-2 rounded-2xl p-4 bg-gradient-primary text-primary-foreground tap-scale flex items-center justify-center gap-2 shadow-neon font-bold"
          >
            <Tag className="h-4 w-4" /> List on Marketplace
          </button>
        </div>
      )}

      {mode === "wash" && (
        <WashGame
          item={item}
          washerBonus={washerBonus}
          ironBonus={ironBonus}
          onDone={(newCond, success) => {
            setItemCondition(item.id, newCond);
            if (success) markWashed(item.id);
            setMode("menu");
            toast.success(success ? "Looking fresh!" : "Decent. Try again.", { description: `Condition: ${Math.round(newCond)}%` });
          }}
          onCancel={() => setMode("menu")}
        />
      )}

      {mode === "photo" && (
        <PhotoMode
          item={item}
          lightsCap={lightsCap}
          onDone={(quality) => {
            setItemPhoto(item.id, quality);
            markPhotographed(item.id);
            setMode("menu");
            toast.success("Picture-perfect!", { description: `Photo: ${Math.round(quality)}%` });
          }}
          onCancel={() => setMode("menu")}
        />
      )}
    </div>
  );
};

const StudioPicks = () => {
  const inventory = useGame((s) => s.inventory);
  if (inventory.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/40">
        <p className="text-4xl mb-2">🧼</p>
        <p className="text-sm text-muted-foreground">No items yet.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-3">
      {inventory.map((i) => (
        <div key={i.id} className="aspect-square rounded-2xl bg-gradient-surface border border-border p-2 grid place-items-center">
          <span className="text-4xl">{i.emoji}</span>
        </div>
      ))}
    </div>
  );
};

const WashGame = ({
  item,
  washerBonus,
  ironBonus,
  onDone,
  onCancel,
}: {
  item: InventoryItem;
  washerBonus: number;
  ironBonus: number;
  onDone: (newCondition: number, success: boolean) => void;
  onCancel: () => void;
}) => {
  const [pos, setPos] = useState(0);
  const [stopped, setStopped] = useState<number | null>(null);
  const dirRef = useRef(1);
  const rafRef = useRef<number>();

  // green zone center 0.5 ± 0.1 (widened by upgrade)
  const halfZone = 0.1 + washerBonus;
  const zoneStart = 0.5 - halfZone;
  const zoneEnd = 0.5 + halfZone;

  useEffect(() => {
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setPos((p) => {
        let np = p + dirRef.current * dt * 0.9;
        if (np >= 1) { np = 1; dirRef.current = -1; }
        if (np <= 0) { np = 0; dirRef.current = 1; }
        return np;
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    if (stopped === null) rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stopped]);

  const stop = () => {
    if (stopped !== null) return;
    setStopped(pos);
    const inZone = pos >= zoneStart && pos <= zoneEnd;
    const distFromCenter = Math.abs(pos - 0.5);
    // gain: max 60 in perfect center, scaled
    const baseGain = inZone ? Math.max(20, 60 - distFromCenter * 200) : 5;
    const newCond = Math.min(100, item.condition + baseGain + ironBonus);
    setTimeout(() => onDone(newCond, inZone), 600);
  };

  return (
    <div className="rounded-2xl glass p-4 space-y-4 animate-scale-in">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Wash mini-game</p>
        <p className="font-display font-bold">Stop in the green zone</p>
      </div>
      <div className="relative h-12 w-full rounded-full bg-secondary border border-border overflow-hidden">
        {/* green zone */}
        <div
          className="absolute top-0 bottom-0 bg-success/25 border-x border-success"
          style={{ left: `${zoneStart * 100}%`, width: `${(zoneEnd - zoneStart) * 100}%` }}
        />
        {/* slider */}
        <div
          className={cn(
            "absolute top-1 bottom-1 w-2 rounded-full bg-gradient-primary shadow-neon transition-none",
            stopped !== null && "ring-2 ring-primary-glow"
          )}
          style={{ left: `calc(${pos * 100}% - 4px)` }}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-secondary border border-border font-semibold tap-scale"
        >
          Cancel
        </button>
        <button
          onClick={stop}
          disabled={stopped !== null}
          className="flex-[2] py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold tap-scale shadow-neon disabled:opacity-60"
        >
          STOP
        </button>
      </div>
    </div>
  );
};

const PhotoMode = ({
  item,
  lightsCap,
  onDone,
  onCancel,
}: {
  item: InventoryItem;
  lightsCap: number;
  onDone: (quality: number) => void;
  onCancel: () => void;
}) => {
  const [backdrop, setBackdrop] = useState(BACKDROPS[0].id);
  const [light, setLight] = useState(50);
  const chosen = BACKDROPS.find((b) => b.id === backdrop)!;
  const quality = Math.min(lightsCap, chosen.quality * 0.6 + light * 0.4);

  return (
    <div className="rounded-2xl glass p-4 space-y-4 animate-scale-in">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Photo mode</p>
        <p className="font-display font-bold">Compose your shot</p>
      </div>

      <div className="aspect-square rounded-2xl border border-border grid place-items-center text-7xl relative overflow-hidden"
           style={{
             background: backdrop === "white" ? "hsl(0 0% 96%)"
               : backdrop === "studio" ? "linear-gradient(135deg, hsl(252 18% 14%), hsl(252 18% 22%))"
               : backdrop === "nature" ? "linear-gradient(135deg, hsl(140 40% 25%), hsl(160 50% 35%))"
               : "linear-gradient(135deg, hsl(280 90% 35%), hsl(195 90% 40%))"
           }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 30%, hsl(0 0% 100% / ${light/180}), transparent 60%)` }} />
        <span className="relative drop-shadow-2xl">{item.emoji}</span>
      </div>

      <div>
        <p className="text-xs font-semibold mb-2">Backdrop</p>
        <div className="grid grid-cols-4 gap-2">
          {BACKDROPS.map((b) => (
            <button
              key={b.id}
              onClick={() => setBackdrop(b.id)}
              className={cn(
                "py-2 rounded-xl border tap-scale text-center",
                backdrop === b.id ? "border-primary bg-primary/15" : "border-border bg-secondary"
              )}
            >
              <div className="text-lg">{b.emoji}</div>
              <div className="text-[10px] text-muted-foreground">{b.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>Lighting</span>
          <span className="tabular-nums font-semibold">{light}%</span>
        </div>
        <input
          type="range" min={0} max={100} value={light}
          onChange={(e) => setLight(Number(e.target.value))}
          className="w-full accent-[hsl(var(--primary))]"
        />
      </div>

      <StatBar value={quality} color="accent" label="Predicted photo quality" />

      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-secondary border border-border font-semibold tap-scale">
          Cancel
        </button>
        <button
          onClick={() => onDone(quality)}
          className="flex-[2] py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold tap-scale shadow-neon"
        >
          📸 Capture
        </button>
      </div>
    </div>
  );
};
