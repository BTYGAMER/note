import { useSubscription } from "@/hooks/useSubscription";
import goldBadge from "@/assets/gold-badge.png";
import platinumBadge from "@/assets/platinum-badge.png";
import { Sparkles } from "lucide-react";

export const SubscriptionBadge = () => {
  const { tier, loading } = useSubscription();

  if (loading) return null;

  if (tier === "free") {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Sparkles className="w-4 h-4" />
        <span>Free Plan</span>
      </div>
    );
  }

  const badge = tier === "gold" ? goldBadge : platinumBadge;

  return (
    <img
      src={badge}
      alt={`${tier} subscription`}
      className="h-6 w-auto"
    />
  );
};
