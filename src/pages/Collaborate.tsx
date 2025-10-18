import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, UserPlus, Trash2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Database } from "@/integrations/supabase/types";

type Collaborator = Database['public']['Tables']['note_collaborators']['Row'];

const Collaborate = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasFeature } = useSubscription();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!hasFeature("collaboration")) return;
    loadCollaborators();
  }, [fileId]);

  const loadCollaborators = async () => {
    if (!fileId) return;

    try {
      const { data: file } = await supabase
        .from("files")
        .select("name")
        .eq("id", fileId)
        .single();

      if (file) setFileName(file.name);

      const { data, error } = await supabase
        .from("note_collaborators")
        .select("*")
        .eq("file_id", fileId);

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading collaborators",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addCollaborator = async () => {
    if (!fileId || !email) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("note_collaborators")
        .insert({
          file_id: fileId,
          email: email.toLowerCase(),
          permission: "edit",
          invited_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Collaborator Added",
        description: `${email} has been invited to collaborate.`,
      });

      setEmail("");
      loadCollaborators();
    } catch (error: any) {
      toast({
        title: "Error adding collaborator",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from("note_collaborators")
        .delete()
        .eq("id", collaboratorId);

      if (error) throw error;

      toast({
        title: "Collaborator Removed",
        description: "Collaborator has been removed from this note.",
      });

      loadCollaborators();
    } catch (error: any) {
      toast({
        title: "Error removing collaborator",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!hasFeature("collaboration")) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Collaboration</h1>
          </div>
        </header>
        <div className="container mx-auto px-6 py-8 max-w-2xl">
          <UpgradePrompt feature="Collaboration" requiredTier="platinum" />
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
              <Users className="w-6 h-6" />
              Collaboration
            </h1>
            <p className="text-sm text-muted-foreground">{fileName}</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Invite Collaborators</CardTitle>
            <CardDescription>
              Share this note with others and collaborate in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCollaborator()}
                  className="pl-10"
                />
              </div>
              <Button onClick={addCollaborator} disabled={loading || !email}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Collaborators</CardTitle>
            <CardDescription>
              {collaborators.length} {collaborators.length === 1 ? "person" : "people"} with access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {collaborators.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No collaborators yet. Invite someone to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {collaborator.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{collaborator.email}</p>
                        <Badge variant="secondary" className="mt-1">
                          {collaborator.permission}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCollaborator(collaborator.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Collaborate;
