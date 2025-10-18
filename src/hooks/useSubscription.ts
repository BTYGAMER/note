import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "free" | "gold" | "platinum";

export const useSubscription = () => {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTier();

    const channel = supabase
      .channel("subscription_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_subscriptions",
        },
        () => {
          fetchTier();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTier = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setTier("free");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("tier")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setTier(data.tier as SubscriptionTier);
    } else if (error && error.code !== 'PGRST116') {
      console.error("Error fetching subscription:", error);
      setTier("free");
    } else {
      // No subscription found, create one
      const { error: insertError } = await supabase
        .from("user_subscriptions")
        .insert({ user_id: user.id, tier: "free" });
      
      if (insertError) {
        console.error("Error creating subscription:", insertError);
      }
      setTier("free");
    }
    setLoading(false);
  };

  const hasFeature = (feature: string): boolean => {
    const features: Record<SubscriptionTier, string[]> = {
      free: ["basic_notes", "basic_quiz"],
      gold: [
        "basic_notes",
        "basic_quiz",
        "unlimited_folders",
        "ai_beautification",
        "importance_analysis",
        "advanced_export",
        "auto_save",
        "note_templates",
        "quiz_history",
        "study_mode",
      ],
      platinum: [
        "basic_notes",
        "basic_quiz",
        "unlimited_folders",
        "unlimited_notes",
        "ai_beautification",
        "importance_analysis",
        "advanced_export",
        "auto_save",
        "note_templates",
        "quiz_history",
        "study_mode",
        "ai_summaries",
        "smart_search",
        "collaboration",
        "version_history",
        "priority_support",
        "custom_themes",
      ],
    };

    return features[tier]?.includes(feature) || false;
  };

  const getFeatureLimits = () => {
    const limits = {
      free: {
        maxNotes: 10,
        maxFolders: 1,
        maxQuizzes: 5,
        autoSave: false,
        aiBeautify: false,
        exportFormats: ["txt"],
      },
      gold: {
        maxNotes: 100,
        maxFolders: Infinity,
        maxQuizzes: 50,
        autoSave: true,
        aiBeautify: true,
        exportFormats: ["txt", "pdf", "docx", "md"],
      },
      platinum: {
        maxNotes: Infinity,
        maxFolders: Infinity,
        maxQuizzes: Infinity,
        autoSave: true,
        aiBeautify: true,
        exportFormats: ["txt", "pdf", "docx", "md", "html"],
      },
    };
    return limits[tier];
  };

  return { tier, loading, hasFeature, getFeatureLimits };
};
