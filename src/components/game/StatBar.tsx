import { cn } from "@/lib/utils";

export const StatBar = ({
  value,
  label,
  color = "primary",
  className,
}: {
  value: number;
  label?: string;
  color?: "primary" | "accent" | "success" | "warning";
  className?: string;
}) => {
  const colorMap = {
    primary: "bg-gradient-primary",
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
  };
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between text-[11px] mb-1 text-muted-foreground">
          <span>{label}</span>
          <span className="tabular-nums font-semibold text-foreground">{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", colorMap[color])}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
};
