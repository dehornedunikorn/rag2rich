import { Package, Shirt, Sparkles, Store, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export type Screen = "dashboard" | "inventory" | "studio" | "market" | "shop";

const tabs: { key: Screen; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Unbox",   icon: Package },
  { key: "inventory", label: "Closet",  icon: Shirt },
  { key: "studio",    label: "Studio",  icon: Sparkles },
  { key: "market",    label: "Market",  icon: Store },
  { key: "shop",      label: "Shop",    icon: ShoppingBag },
];

export const BottomNav = ({ active, onChange }: { active: Screen; onChange: (s: Screen) => void }) => (
  <nav className="sticky bottom-0 z-30 px-3 pb-3 pt-2 bg-background/85 backdrop-blur-xl border-t border-border">
    <ul className="flex items-end justify-between gap-1">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.key;
        return (
          <li key={t.key} className="flex-1">
            <button
              onClick={() => onChange(t.key)}
              className={cn(
                "w-full flex flex-col items-center gap-0.5 py-1.5 rounded-xl tap-scale transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={t.label}
            >
              <span
                className={cn(
                  "h-9 w-9 grid place-items-center rounded-xl transition-all",
                  isActive ? "bg-gradient-primary text-primary-foreground shadow-neon" : "bg-transparent"
                )}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
              </span>
              <span className="text-[10px] font-semibold tracking-wide">{t.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);
