import {
  HeartPulse,
  Sparkles,
  Target,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  heart: HeartPulse,
  sparkles: Sparkles,
  target: Target,
  wallet: WalletCards,
};

export function ObjectiveIcon({
  icon,
  className,
}: {
  icon?: string | null;
  className?: string;
}) {
  const Icon = icon ? (icons[icon] ?? Target) : Target;
  return <Icon aria-hidden="true" className={className} />;
}
