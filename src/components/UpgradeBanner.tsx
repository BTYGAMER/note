import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

export const UpgradeBanner = () => {
  const { tier } = useSubscription();
  const navigate = useNavigate();

  if (tier !== "free") return null;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Unlock Premium Features
                <Sparkles className="w-4 h-4 text-primary" />
              </h3>
              <p className="text-sm text-muted-foreground">
                Get unlimited notes, AI beautification, auto-save, and more with Gold or Platinum
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/pricing")} size="lg" className="shrink-0">
            <Zap className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
