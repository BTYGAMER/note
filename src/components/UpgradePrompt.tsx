import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  feature: string;
  requiredTier: "gold" | "platinum";
}

export const UpgradePrompt = ({ feature, requiredTier }: UpgradePromptProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Upgrade Required</CardTitle>
        </div>
        <CardDescription>
          {feature} is available with {requiredTier.toUpperCase()} subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => navigate("/pricing")} className="w-full">
          View Plans
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
