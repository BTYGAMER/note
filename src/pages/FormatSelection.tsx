import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const formats = [
  {
    id: "outline",
    name: "Outline Format",
    description: "Hierarchical structure with main topics and subtopics",
    template: "# Main Topic\n\n## Subtopic 1\n- Point A\n- Point B\n\n## Subtopic 2\n- Point C\n- Point D"
  },
  {
    id: "cornell",
    name: "Cornell Method",
    description: "Three-section layout: cues, notes, and summary",
    template: "CUES | NOTES\n----- | -----\n      | \n\nSUMMARY:\n"
  },
  {
    id: "mindmap",
    name: "Mind Map Style",
    description: "Visual connections between concepts",
    template: "CENTRAL IDEA\n├─ Branch 1\n│  ├─ Detail A\n│  └─ Detail B\n└─ Branch 2\n   ├─ Detail C\n   └─ Detail D"
  },
  {
    id: "linear",
    name: "Linear Notes",
    description: "Sequential flow of information",
    template: "Date: [Today]\n\nTopic:\n\nNotes:\n1. \n2. \n3. "
  },
];

const FormatSelection = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const folderId = searchParams.get("folder");
  const fileName = searchParams.get("name");

  useEffect(() => {
    if (!folderId || !fileName) {
      navigate("/dashboard");
      return;
    }
    getSuggestion();
  }, [folderId, fileName]);

  const getSuggestion = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("suggest-format", {
        body: { fileName }
      });

      if (error) throw error;
      setAiSuggestion(data.suggestion);
    } catch (error: any) {
      console.error("Error getting AI suggestion:", error);
    }
  };

  const handleFormatSelect = async (formatId: string) => {
    if (!folderId || !fileName) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const format = formats.find(f => f.id === formatId);
      if (!format) throw new Error("Format not found");

      const { data: file, error: fileError } = await supabase
        .from("files")
        .insert({
          folder_id: folderId,
          user_id: user.id,
          name: fileName,
          note_format: format.name,
        })
        .select()
        .single();

      if (fileError) throw fileError;

      const { error: noteError } = await supabase
        .from("notes")
        .insert({
          file_id: file.id,
          user_id: user.id,
          content: format.template,
        });

      if (noteError) throw noteError;

      toast({ title: "File created successfully!" });
      navigate(`/note/${file.id}`);
    } catch (error: any) {
      toast({
        title: "Error creating file",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Choose Note Format</h1>
            <p className="text-sm text-muted-foreground">for "{fileName}"</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {aiSuggestion && (
          <Card className="mb-6 border shadow-sm bg-muted/20 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span className="text-lg">✨</span> AI Recommendation
              </CardTitle>
              <CardDescription>{aiSuggestion}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {formats.map((format) => (
            <Card
              key={format.id}
              className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">{format.name}</CardTitle>
                <CardDescription>{format.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto border">
                  {format.template}
                </pre>
                <Button
                  className="w-full"
                  onClick={() => handleFormatSelect(format.id)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Select This Format"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FormatSelection;
