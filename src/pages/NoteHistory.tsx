import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, History, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { Database } from "@/integrations/supabase/types";

type Version = Database['public']['Tables']['note_versions']['Row'];

const NoteHistory = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasFeature } = useSubscription();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!hasFeature("version_history")) return;
    loadVersions();
  }, [fileId]);

  const loadVersions = async () => {
    if (!fileId) return;

    try {
      // Get file name
      const { data: file } = await supabase
        .from("files")
        .select("name")
        .eq("id", fileId)
        .single();

      if (file) setFileName(file.name);

      // Get version history
      const { data, error } = await supabase
        .from("note_versions")
        .select("*")
        .eq("file_id", fileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading version history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreVersion = async (version: Version) => {
    if (!fileId) return;

    try {
      const { error } = await supabase
        .from("notes")
        .update({ content: version.content })
        .eq("file_id", fileId);

      if (error) throw error;

      toast({
        title: "Version Restored",
        description: "Your note has been restored to this version.",
      });

      navigate(`/note/${fileId}`);
    } catch (error: any) {
      toast({
        title: "Error restoring version",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!hasFeature("version_history")) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Version History</h1>
          </div>
        </header>
        <div className="container mx-auto px-6 py-8 max-w-2xl">
          <UpgradePrompt feature="Version History" requiredTier="platinum" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/note/${fileId}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <History className="w-6 h-6" />
              Version History
            </h1>
            <p className="text-sm text-muted-foreground">{fileName}</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading version history...</p>
          </div>
        ) : versions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No Version History Yet</p>
              <p className="text-muted-foreground">
                Version history will appear here as you make changes to your note.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {versions.map((version) => (
              <Card key={version.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Version {version.version_number}
                      </CardTitle>
                      <CardDescription>
                        {new Date(version.created_at).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreVersion(version)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-md max-h-40 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">
                      {version.content.slice(0, 500)}
                      {version.content.length > 500 && "..."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteHistory;
