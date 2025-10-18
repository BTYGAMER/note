import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import goldBadge from "@/assets/gold-badge.png";
import platinumBadge from "@/assets/platinum-badge.png";
import { useState } from "react";

const Pricing = () => {
  const navigate = useNavigate();
  const { tier } = useSubscription();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async (newTier: "free" | "gold" | "platinum") => {
    console.log("Starting tier change to:", newTier);
    setUpgrading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found");
        throw new Error("Not authenticated");
      }

      console.log("User ID:", user.id);

      // Use upsert with proper conflict resolution
      const { data, error } = await supabase
        .from("user_subscriptions")
        .upsert(
          {
            user_id: user.id,
            tier: newTier,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
            ignoreDuplicates: false,
          }
        )
        .select();

      if (error) {
        console.error("Upsert error:", error);
        throw error;
      }

      console.log("Tier change successful:", data);
      
      if (newTier === "free") {
        toast.success("Downgraded to Free plan");
      } else {
        toast.success(`Successfully upgraded to ${newTier.toUpperCase()}!`);
      }
      
      // Wait a moment for realtime to propagate, then navigate
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error: any) {
      console.error("Tier change failed:", error);
      toast.error(`Failed to change plan: ${error.message || "Unknown error"}`);
    } finally {
      setUpgrading(false);
    }
  };

  const plans = [
    {
      name: "Free",
      tier: "free" as const,
      price: "$0",
      description: "Perfect for getting started",
      badge: null,
      features: [
        "10 notes maximum",
        "1 folder only",
        "5 quiz generations per month",
        "Basic export (TXT only)",
        "Manual save only",
        "Basic note editor",
      ],
      buttonText: "Downgrade to Free",
      disabled: false,
    },
    {
      name: "Gold",
      tier: "gold" as const,
      price: "$9.99",
      period: "/month",
      description: "For serious note-takers",
      badge: goldBadge,
      features: [
        "100 notes maximum",
        "Unlimited folders",
        "50 quiz generations per month",
        "✨ AI beautification with images",
        "📊 Importance analysis",
        "📥 Export to PDF, DOCX, MD",
        "💾 Auto-save every 30 seconds",
        "📝 Note templates library",
        "📚 Quiz history tracking",
        "🎯 Focus mode & study timer",
        "Priority email support",
      ],
      buttonText: "Upgrade to Gold",
      popular: true,
    },
    {
      name: "Platinum",
      tier: "platinum" as const,
      price: "$19.99",
      period: "/month",
      description: "Unlimited everything",
      badge: platinumBadge,
      features: [
        "♾️ Unlimited notes",
        "♾️ Unlimited folders",
        "♾️ Unlimited quiz generations",
        "✨ AI beautification with images",
        "📊 Advanced importance analysis",
        "🤖 AI-powered summaries",
        "📥 Export to all formats + HTML",
        "💾 Auto-save every 10 seconds",
        "📝 Custom note templates",
        "📚 Complete quiz history",
        "🎯 Advanced study mode",
        "🔍 Smart search across all notes",
        "👥 Collaboration features",
        "📜 Version history (30 days)",
        "🎨 Custom themes",
        "⚡ Priority AI processing",
        "24/7 premium support",
      ],
      buttonText: "Upgrade to Platinum",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Unlock more features and take your note-taking to the next level
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center">
                {plan.badge && (
                  <img
                    src={plan.badge}
                    alt={`${plan.name} badge`}
                    className="w-32 h-auto mx-auto mb-4"
                  />
                )}
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={tier === plan.tier || upgrading}
                  onClick={() => handleUpgrade(plan.tier)}
                >
                  {tier === plan.tier
                    ? "Current Plan"
                    : upgrading
                    ? "Processing..."
                    : plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
