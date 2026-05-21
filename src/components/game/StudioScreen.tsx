import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/store";
import { InventoryItem, UPGRADES } from "@/game/types";
import { getItemImage } from "@/game/itemImages";
import { DESIGNER_BY_ID } from "@/game/designer";
import { StatBar } from "./StatBar";
import { RarityBadge } from "./RarityBadge";
import { cn } from "@/lib/utils";
import { Camera, Droplets, Flame, Tag, X, Check, Wand2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { showRewarded } from "@/game/admob";

type Mode = "menu" | "wash" | "iron" | "photo";

const BACKDROPS = [
  { id: "white",  label: "White",  emoji: "⬜", quality: 30 },
  { id: "studio", label: "Studio", emoji: "🎬", quality: 60 },
  { id: "nature", label: "Nature", emoji: "🌿", quality: 80 },
  { id: "neon",   label: "Neon",   emoji: "💜", quality: 95 },
];

const itemImage = (item: InventoryItem): string | null => {
  if (item.designerId) return DESIGNER_BY_ID[item.designerId]?.image ?? null;
  return getItemImage(item.kind, item.variant);
};

export const StudioScreen = ({
  selected,
  onClose,
  onListItem,
  onOpenGallery,
}: {
  selected: InventoryItem | null;
  onClose: () => void;
  onListItem: (item: InventoryItem) => void;
  onOpenGallery: () => void;
}) => {
  const inventory = useGame((s) => s.inventory);
  const setItemCondition = useGame((s) => s.setItemCondition);
  const setItemPhoto = useGame((s) => s.setItemPhoto);
  const markWashed = useGame((s) => s.markWashed);
  const markIroned = useGame((s) => s.markIroned);
  const markPhotographed = useGame((s) => s.markPhotographed);
  const upgradeLevels = useGame((s) => s.upgradeLevels);
  const repairAll = useGame((s) => s.repairAllInventory);

  const item = selected ? inventory.find((i) => i.id === selected.id) ?? null : null;

  const [mode, setMode] = useState<Mode>("menu");
  useEffect(() => setMode("menu"), [selected?.id]);

  if (!item) {
    return (
      <div className="px-4 py-4 animate-fade-in space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold neon-text">Processing Studio</h1>
            <p className="text-sm text-muted-foreground">Pick an item from your closet to start refurbishing.</p>
          </div>
          <button
            onClick={onOpenGallery}
            className="px-3 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-bold tap-scale flex items-center gap-1"
          >
            <ImageIcon className="h-3 w-3" /> Gallery
          </button>
        </div>

        <button
          onClick={async () => {
            const reward = await showRewarded("magic_laundry");
            if (!reward) {
              toast("Ad skipped — no reward");
              return;
            }
            const n = repairAll();
            toast.success("Magic Laundry done!", { description: `${n} items refreshed` });
          }}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/40 tap-scale flex items-center gap-3"
        >
          <Wand2 className="h-6 w-6 text-accent" />
          <div className="flex-1 text-left">
            <p className="font-display font-bold">Magic Laundry</p>
            <p className="text-xs text-muted-foreground">Watch an ad to repair every item to 100%.</p>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-accent font-bold">Ad</span>
        </button>

        <StudioPicks />
      </div>
    );
  }


  const washerBonus = UPGRADES[0].levels[upgradeLevels.washer].bonus;
  const ironBonus = UPGRADES[1].levels[upgradeLevels.iron].bonus;
  const lightsCap = UPGRADES[2].levels[upgradeLevels.lights].bonus;
  const img = itemImage(item);

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold">Studio</h1>
        <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-full bg-secondary border border-border tap-scale">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className={cn(
        "rounded-2xl glass p-4",
        item.rarity === "designer" && "border-gold/50"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-20 w-20 rounded-xl overflow-hidden border bg-card",
            item.rarity === "designer" ? "border-gold/60" : "border-border"
          )}>
            {img ? (
              <img src={img} alt={item.name} width={512} height={512} loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center text-3xl">{item.emoji}</div>
            )}
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
          <ProcessButton
            done={item.washed}
            disabled={item.washed}
            onClick={() => setMode("wash")}
            icon={<Droplets className="h-6 w-6 text-accent" />}
            title="Wash"
            subtitle={item.washed ? "Already washed" : "Stop slider in green zone."}
          />
          <ProcessButton
            done={item.ironed}
            disabled={item.ironed || !item.washed}
            onClick={() => setMode("iron")}
            icon={<Flame className="h-6 w-6 text-warning" />}
            title="Iron"
            subtitle={
              item.ironed ? "Already ironed"
              : !item.washed ? "Wash first"
              : "Tap when heat is perfect."
            }
          />
          <ProcessButton
            done={item.photographed}
            disabled={item.photographed}
            onClick={() => setMode("photo")}
            icon={<Camera className="h-6 w-6 text-primary" />}
            title="Photo"
            subtitle={item.photographed ? "Already shot" : "Pick backdrop & lighting."}
            className="col-span-2"
          />
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
          onDone={(newCond, success) => {
            setItemCondition(item.id, newCond);
            markWashed(item.id);
            setMode("menu");
            toast.success(success ? "Squeaky clean!" : "Washed — could be better.", { description: `Condition: ${Math.round(newCond)}%` });
          }}
          onCancel={() => setMode("menu")}
        />
      )}

      {mode === "iron" && (
        <IronGame
          item={item}
          ironBonus={ironBonus}
          onDone={(newCond, success) => {
            setItemCondition(item.id, newCond);
            markIroned(item.id);
            setMode("menu");
            toast.success(success ? "Crisp creases!" : "Ironed — a few wrinkles left.", { description: `Condition: ${Math.round(newCond)}%` });
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

const ProcessButton = ({
  icon, title, subtitle, onClick, disabled, done, className,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  disabled?: boolean;
  done?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "relative rounded-2xl p-4 bg-gradient-surface border border-border tap-scale flex flex-col items-start gap-2 hover:border-primary/60",
      disabled && "opacity-60 cursor-not-allowed hover:border-border",
      done && "border-success/60",
      className,
    )}
  >
    {done && (
      <span className="absolute top-2 right-2 h-6 w-6 rounded-full bg-success/20 border border-success grid place-items-center">
        <Check className="h-3.5 w-3.5 text-success" />
      </span>
    )}
    {icon}
    <p className="font-display font-bold">{title}</p>
    <p className="text-xs text-muted-foreground text-left">{subtitle}</p>
  </button>
);

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
      {inventory.map((i) => {
        const img = itemImage(i);
        return (
          <div key={i.id} className={cn(
            "aspect-square rounded-2xl overflow-hidden border bg-card",
            i.rarity === "designer" ? "border-gold/60" : "border-border"
          )}>
            {img ? (
              <img src={img} alt={i.name} width={512} height={512} loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center text-3xl">{i.emoji}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---- Mini-games (HARDER & FASTER) ----

const WashGame = ({
  item,
  washerBonus,
  onDone,
  onCancel,
}: {
  item: InventoryItem;
  washerBonus: number;
  onDone: (newCondition: number, success: boolean) => void;
  onCancel: () => void;
}) => {
  const [pos, setPos] = useState(0);
  const [stopped, setStopped] = useState<number | null>(null);
  const dirRef = useRef(1);
  const rafRef = useRef<number>();

  // Tighter zone, much faster slider.
  const halfZone = 0.05 + washerBonus; // was 0.1
  const zoneStart = 0.5 - halfZone;
  const zoneEnd = 0.5 + halfZone;
  const SPEED = 2.2; // was 0.9

  useEffect(() => {
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setPos((p) => {
        let np = p + dirRef.current * dt * SPEED;
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
    const baseGain = inZone ? Math.max(15, 45 - distFromCenter * 220) : 2;
    const newCond = Math.min(100, item.condition + baseGain);
    setTimeout(() => onDone(newCond, inZone), 500);
  };

  return (
    <div className="rounded-2xl glass p-4 space-y-4 animate-scale-in">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Wash mini-game</p>
        <p className="font-display font-bold">Stop in the green zone — fast!</p>
      </div>
      <div className="relative h-12 w-full rounded-full bg-secondary border border-border overflow-hidden">
        <div
          className="absolute top-0 bottom-0 bg-success/25 border-x border-success"
          style={{ left: `${zoneStart * 100}%`, width: `${(zoneEnd - zoneStart) * 100}%` }}
        />
        <div
          className={cn(
            "absolute top-1 bottom-1 w-2 rounded-full bg-gradient-primary shadow-neon transition-none",
            stopped !== null && "ring-2 ring-primary-glow"
          )}
          style={{ left: `calc(${pos * 100}% - 4px)` }}
        />
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-secondary border border-border font-semibold tap-scale">
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

const IronGame = ({
  item,
  ironBonus,
  onDone,
  onCancel,
}: {
  item: InventoryItem;
  ironBonus: number;
  onDone: (newCondition: number, success: boolean) => void;
  onCancel: () => void;
}) => {
  const [heat, setHeat] = useState(0);
  const [stopped, setStopped] = useState<number | null>(null);
  const dirRef = useRef(1);
  const rafRef = useRef<number>();

  const halfZone = 0.045 + ironBonus / 300; // tighter (was 0.08)
  const zoneCenter = 0.72;
  const zoneStart = zoneCenter - halfZone;
  const zoneEnd = zoneCenter + halfZone;
  const SPEED = 1.4; // was 0.55

  useEffect(() => {
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setHeat((p) => {
        let np = p + dirRef.current * dt * SPEED;
        if (np >= 1) { np = 1; dirRef.current = -1; }
        if (np <= 0) { np = 0; dirRef.current = 1; }
        return np;
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    if (stopped === null) rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stopped]);

  const press = () => {
    if (stopped !== null) return;
    setStopped(heat);
    const inZone = heat >= zoneStart && heat <= zoneEnd;
    const distFromCenter = Math.abs(heat - zoneCenter);
    const burned = heat > 0.9;
    const baseGain = burned ? -12 : inZone ? Math.max(12, 35 - distFromCenter * 240) + ironBonus : 1;
    const newCond = Math.max(0, Math.min(100, item.condition + baseGain));
    setTimeout(() => onDone(newCond, inZone && !burned), 500);
  };

  const heatColor = heat < 0.4 ? "hsl(200 80% 55%)" : heat < 0.6 ? "hsl(45 90% 55%)" : heat < 0.85 ? "hsl(20 90% 55%)" : "hsl(0 90% 55%)";

  return (
    <div className="rounded-2xl glass p-4 space-y-4 animate-scale-in">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Iron mini-game</p>
        <p className="font-display font-bold">Press when heat is just right — careful, it's racing!</p>
      </div>

      <div className="flex items-end gap-3">
        <div className="relative h-40 w-10 rounded-full bg-secondary border border-border overflow-hidden">
          <div
            className="absolute left-0 right-0 bg-success/25 border-y border-success"
            style={{ bottom: `${zoneStart * 100}%`, height: `${(zoneEnd - zoneStart) * 100}%` }}
          />
          <div
            className="absolute left-0 right-0 bg-destructive/20 border-t border-destructive"
            style={{ bottom: `90%`, height: `10%` }}
          />
          <div
            className="absolute left-0 right-0 bottom-0 transition-none"
            style={{ height: `${heat * 100}%`, background: `linear-gradient(to top, hsl(200 80% 50%), ${heatColor})` }}
          />
          <div
            className="absolute left-0 right-0 h-1 bg-foreground/90 shadow-neon"
            style={{ bottom: `calc(${heat * 100}% - 2px)` }}
          />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-xs text-muted-foreground">Aim for the green band. Don't go red — you'll scorch the fabric.</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-success" /> Perfect heat
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-destructive" /> Too hot
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-secondary border border-border font-semibold tap-scale">
          Cancel
        </button>
        <button
          onClick={press}
          disabled={stopped !== null}
          className="flex-[2] py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold tap-scale shadow-neon disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <Flame className="h-4 w-4" /> PRESS
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
  const img = itemImage(item);

  return (
    <div className="rounded-2xl glass p-4 space-y-4 animate-scale-in">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Photo mode</p>
        <p className="font-display font-bold">Compose your shot</p>
      </div>

      <div className="aspect-square rounded-2xl border border-border grid place-items-center relative overflow-hidden"
           style={{
             background: backdrop === "white" ? "hsl(0 0% 96%)"
               : backdrop === "studio" ? "linear-gradient(135deg, hsl(252 18% 14%), hsl(252 18% 22%))"
               : backdrop === "nature" ? "linear-gradient(135deg, hsl(140 40% 25%), hsl(160 50% 35%))"
               : "linear-gradient(135deg, hsl(280 90% 35%), hsl(195 90% 40%))"
           }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 30%, hsl(0 0% 100% / ${light/180}), transparent 60%)` }} />
        {img ? (
          <img
            src={img}
            alt={item.name}
            width={512}
            height={512}
            loading="lazy"
            className="relative h-3/4 w-3/4 object-contain drop-shadow-2xl"
            style={{ mixBlendMode: backdrop === "white" ? "multiply" : "normal" }}
          />
        ) : (
          <span className="relative text-7xl">{item.emoji}</span>
        )}
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
          <span className="tabular-nums font-semibold">{light}</span>
        </div>
        <input
          type="range" min={0} max={100} value={light}
          onChange={(e) => setLight(Number(e.target.value))}
          className="w-full accent-[hsl(var(--primary))]"
        />
      </div>

      <div className="rounded-xl bg-secondary p-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Estimated photo quality</span>
        <span className="text-lg font-display font-bold tabular-nums">{Math.round(quality)}%</span>
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-secondary border border-border font-semibold tap-scale">
          Cancel
        </button>
        <button
          onClick={() => onDone(quality)}
          className="flex-[2] py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold tap-scale shadow-neon flex items-center justify-center gap-2"
        >
          <Camera className="h-4 w-4" /> SHOOT
        </button>
      </div>
    </div>
  );
};
