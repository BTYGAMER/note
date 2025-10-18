import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureLockedCardProps {
  feature: string;
  description: string;
  requiredTier: "gold" | "platinum";
}

export const FeatureLockedCard = ({ feature, description, requiredTier }: FeatureLockedCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="text-center pb-3">
        <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-lg flex items-center justify-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          {feature}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => navigate("/pricing")} className="w-full" size="lg">
          Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
        </Button>
      </CardContent>
    </Card>
  );
};
