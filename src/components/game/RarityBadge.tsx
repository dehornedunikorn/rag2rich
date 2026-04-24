import { cn } from "@/lib/utils";
import type { Rarity } from "@/game/types";

export const RarityBadge = ({ rarity, className }: { rarity: Rarity; className?: string }) => {
  const styles: Record<Rarity, string> = {
    common:   "bg-muted text-muted-foreground",
    uncommon: "bg-success/15 text-success border border-success/30",
    rare:     "bg-accent/15 text-accent border border-accent/30",
    epic:     "bg-gradient-primary text-primary-foreground shadow-neon",
    designer: "bg-gold text-gold-foreground border border-gold shadow-[0_0_12px_hsl(var(--gold)/0.6)]",
  };
  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md", styles[rarity], className)}>
      {rarity}
    </span>
  );
};
