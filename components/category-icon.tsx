import { getCategoryIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function CategoryIcon({
  icon,
  color,
  size = "md",
  className,
}: {
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = getCategoryIcon(icon);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl",
        size === "sm" && "size-7 rounded-lg [&_svg]:size-3.5",
        size === "md" && "size-10 [&_svg]:size-4.5",
        size === "lg" && "size-12 [&_svg]:size-5.5",
        className,
      )}
      style={{ backgroundColor: `${color}1f`, color }}
    >
      <Icon />
    </span>
  );
}
