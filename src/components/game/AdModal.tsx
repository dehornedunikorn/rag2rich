import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  duration?: number;          // seconds
  onComplete: () => void;     // called when timer hits 0
  onSkip?: () => void;        // optional skip handler
  rewardLabel?: string;
}

/**
 * Stub full-screen ad placeholder.
 * Replace with AdSense/AdMob SDK calls in production.
 */
export const AdModal = ({ open, title, duration = 5, onComplete, onSkip, rewardLabel }: Props) => {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (!open) return;
    setRemaining(duration);
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          onComplete();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md grid place-items-center animate-fade-in p-6">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 text-center">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sponsored</p>
        <h2 className="text-xl font-display font-bold neon-text">{title}</h2>
        <div className="aspect-video rounded-2xl border border-dashed border-border bg-secondary/40 grid place-items-center">
          <p className="text-xs text-muted-foreground">Ad placeholder ({duration}s)</p>
        </div>
        {rewardLabel && (
          <p className="text-sm">
            Reward on completion: <span className="font-bold text-primary">{rewardLabel}</span>
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {remaining > 0 ? `Closes in ${remaining}s` : "Done"}
          </span>
          {onSkip && (
            <button
              onClick={onSkip}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-semibold tap-scale"
            >
              <X className="h-3 w-3" /> Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
