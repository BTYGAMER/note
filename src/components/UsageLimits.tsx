import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UsageLimitsProps {
  noteCount: number;
  folderCount: number;
}

export const UsageLimits = ({ noteCount, folderCount }: UsageLimitsProps) => {
  const { tier, getFeatureLimits } = useSubscription();
  const navigate = useNavigate();
  const limits = getFeatureLimits();

  // Only show for free tier
  if (tier !== "free") return null;

  const notePercentage = (noteCount / limits.maxNotes) * 100;
  const folderPercentage = (folderCount / limits.maxFolders) * 100;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Crown className="w-4 h-4 text-primary" />
          Your Usage
        </CardTitle>
        <CardDescription>Track your plan limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Notes</span>
            <span className="text-muted-foreground">
              {noteCount}/{limits.maxNotes}
            </span>
          </div>
          <Progress value={notePercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Folders</span>
            <span className="text-muted-foreground">
              {folderCount}/{limits.maxFolders}
            </span>
          </div>
          <Progress value={folderPercentage} className="h-2" />
        </div>

        {(notePercentage > 80 || folderPercentage > 80) && (
          <div className="pt-2">
            <Button onClick={() => navigate("/pricing")} size="sm" className="w-full">
              Upgrade for Unlimited
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
