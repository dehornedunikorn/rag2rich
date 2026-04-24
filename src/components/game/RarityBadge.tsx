import { cn } from "@/lib/utils";
import type { Rarity } from "@/game/types";

export const RarityBadge = ({ rarity, className }: { rarity: Rarity; className?: string }) => {
  const styles: Record<Rarity, string> = {
    common:   "bg-muted text-muted-foreground",
    uncommon: "bg-success/15 text-success border border-success/30",
    rare:     "bg-accent/15 text-accent border border-accent/30",
    epic:     "bg-gradient-primary text-primary-foreground shadow-neon",
    designer: "bg-gradient-to-r from-yellow-500 to-amber-300 text-amber-950 shadow-[0_0_12px_hsl(45_95%_55%/0.6)] border border-yellow-300",
  };
  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md", styles[rarity], className)}>
      {rarity}
    </span>
  );
};
