import { cn } from "@/lib/utils";

export const RarityBadge = ({ rarity, className }: { rarity: "common" | "uncommon" | "rare" | "epic"; className?: string }) => {
  const styles: Record<string, string> = {
    common:   "bg-muted text-muted-foreground",
    uncommon: "bg-success/15 text-success border border-success/30",
    rare:     "bg-accent/15 text-accent border border-accent/30",
    epic:     "bg-gradient-primary text-primary-foreground shadow-neon",
  };
  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md", styles[rarity], className)}>
      {rarity}
    </span>
  );
};
