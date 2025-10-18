import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Sparkles, GraduationCap, Loader2, Eye, EyeOff, Users, History as HistoryIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TextFormattingToolbar } from "@/components/TextFormattingToolbar";
import { NoteStats } from "@/components/NoteStats";
import { ExportMenu } from "@/components/ExportMenu";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";

interface Note {
  id: string;
  content: string;
  importance_data: any;
}

interface File {
  id: string;
  name: string;
  note_format: string;
}

const NoteEditor = () => {
  const { fileId } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [beautifying, setBeautifying] = useState(false);
  const [importanceHighlights, setImportanceHighlights] = useState<any[]>([]);
  const [fontFamily, setFontFamily] = useState("mono");
  const [isBeautified, setIsBeautified] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tier, hasFeature, getFeatureLimits } = useSubscription();

  // Auto-save for Gold and Platinum users
  useEffect(() => {
    const limits = getFeatureLimits();
    if (!limits.autoSave || !content || !note) return;

    const autoSaveInterval = tier === "platinum" ? 10000 : 30000; // 10s for Platinum, 30s for Gold
    const timer = setTimeout(() => {
      saveNote(true); // silent save
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [content, tier, note]);

  useEffect(() => {
    fetchNoteAndFile();
  }, [fileId]);

  const fetchNoteAndFile = async () => {
    if (!fileId) return;

    const [noteResult, fileResult] = await Promise.all([
      supabase.from("notes").select("*").eq("file_id", fileId).single(),
      supabase.from("files").select("*").eq("id", fileId).single(),
    ]);

    if (noteResult.error || fileResult.error) {
      toast({ title: "Error loading note", variant: "destructive" });
      navigate("/dashboard");
      return;
    }

    setNote(noteResult.data);
    setFile(fileResult.data);
    setContent(noteResult.data.content);
    const highlights = Array.isArray(noteResult.data.importance_data) 
      ? noteResult.data.importance_data 
      : [];
    setImportanceHighlights(highlights);
  };

  const saveNote = async (silent = false) => {
    if (!note) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("notes")
        .update({ content })
        .eq("id", note.id);

      if (error) throw error;
      if (!silent) {
        toast({ title: "Note saved successfully!" });
      }
    } catch (error: any) {
      toast({
        title: "Error saving note",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const analyzeImportance = async () => {
    if (!hasFeature("importance_analysis")) {
      toast({ 
        title: "Upgrade Required", 
        description: "Importance Analysis is available with Gold or Platinum subscription",
        variant: "destructive" 
      });
      navigate("/pricing");
      return;
    }

    if (!note || !content.trim()) return;

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-importance", {
        body: { content }
      });

      if (error) throw error;

      const highlights = data.highlights || [];
      setImportanceHighlights(highlights);

      const { error: updateError } = await supabase
        .from("notes")
        .update({ importance_data: highlights })
        .eq("id", note.id);

      if (updateError) throw updateError;

      toast({ title: "Analysis complete!" });
    } catch (error: any) {
      toast({
        title: "Error analyzing note",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const startQuiz = () => {
    navigate(`/quiz/${fileId}`);
  };

  const handleFormat = (type: string, value?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newContent = content;
    let cursorOffset = 0;

    switch (type) {
      case "bold":
        if (selectedText) {
          newContent = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
          cursorOffset = 2;
        } else {
          newContent = content.substring(0, start) + `****` + content.substring(end);
          cursorOffset = 2;
        }
        break;
      case "italic":
        if (selectedText) {
          newContent = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
          cursorOffset = 1;
        } else {
          newContent = content.substring(0, start) + `**` + content.substring(end);
          cursorOffset = 1;
        }
        break;
      case "underline":
        if (selectedText) {
          newContent = content.substring(0, start) + `__${selectedText}__` + content.substring(end);
          cursorOffset = 2;
        } else {
          newContent = content.substring(0, start) + `____` + content.substring(end);
          cursorOffset = 2;
        }
        break;
      case "insert":
        newContent = content.substring(0, start) + value + content.substring(end);
        break;
      case "font":
        setFontFamily(value || "mono");
        return;
      default:
        break;
    }

    setContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      if (type === "insert") {
        const insertLength = value?.length || 0;
        textarea.setSelectionRange(start + insertLength, start + insertLength);
      } else if (type === "font") {
        return;
      } else {
        if (selectedText) {
          textarea.setSelectionRange(start + cursorOffset, end + cursorOffset);
        } else {
          textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
        }
      }
      textarea.focus();
    }, 10);
  };

  const beautifyNotes = async () => {
    if (!hasFeature("ai_beautification")) {
      toast({ 
        title: "Upgrade Required", 
        description: "AI Beautification is available with Gold or Platinum subscription",
        variant: "destructive" 
      });
      navigate("/pricing");
      return;
    }

    if (!content.trim()) {
      toast({ title: "No content to beautify", variant: "destructive" });
      return;
    }

    setBeautifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("beautify-notes", {
        body: { content }
      });

      if (error) throw error;

      setContent(data.beautifiedContent);
      setIsBeautified(true);
      toast({ title: "Notes beautified with images and colors!" });
    } catch (error: any) {
      toast({
        title: "Error beautifying notes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBeautifying(false);
    }
  };

  return (
    <div className={`min-h-screen bg-background ${focusMode ? 'bg-background' : ''}`}>
      <header className={`border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10 transition-opacity ${focusMode ? 'opacity-50 hover:opacity-100' : ''}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{file?.name}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{file?.note_format}</span>
                  <span>•</span>
                  <span>{getFeatureLimits().autoSave ? "Auto-saved" : "Manual save"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFocusMode(!focusMode)}
              >
                {focusMode ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                {focusMode ? "Exit Focus" : "Focus"}
              </Button>
              <ExportMenu content={content} fileName={file?.name || "note"} />
              <Button
                variant="ghost"
                size="sm"
                onClick={analyzeImportance}
                disabled={analyzing || !content.trim()}
              >
                {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Analyze
              </Button>
              <Button size="sm" onClick={() => saveNote()} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>
              <Button onClick={startQuiz} size="sm" variant="outline">
                <GraduationCap className="w-4 h-4 mr-2" />
                Quiz
              </Button>
              {hasFeature("collaboration") && (
                <Button onClick={() => navigate(`/collaborate/${fileId}`)} size="sm" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
              {hasFeature("version_history") && (
                <Button onClick={() => navigate(`/history/${fileId}`)} size="sm" variant="outline">
                  <HistoryIcon className="w-4 h-4 mr-2" />
                  History
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={`container mx-auto px-6 py-8 ${focusMode ? 'max-w-4xl' : ''}`}>
        <div className={`grid gap-6 ${focusMode ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
          <div className={`space-y-4 ${focusMode ? 'col-span-1' : 'md:col-span-2'}`}>
            <TextFormattingToolbar
              onFormat={handleFormat}
              onBeautify={beautifyNotes}
              beautifying={beautifying}
            />
            <Card className="p-6 border shadow-sm">
              {isBeautified ? (
                <div 
                  className="min-h-[600px] prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                  onClick={() => {
                    setIsBeautified(false);
                    toast({ title: "Switched to edit mode" });
                  }}
                  style={{ cursor: 'pointer' }}
                />
              ) : (
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setIsBeautified(false);
                  }}
                  className={`min-h-[600px] text-sm resize-none border-0 focus-visible:ring-0 ${
                    fontFamily === "mono" ? "font-mono" : fontFamily === "serif" ? "font-serif" : "font-sans"
                  }`}
                  placeholder="Start taking your notes here..."
                />
              )}
            </Card>
          </div>

          {!focusMode && (
            <div className="space-y-4">
              <NoteStats content={content} />
              
              <Card className="p-4 border shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4" />
                  AI Insights
                </h3>
                {importanceHighlights.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Click "Analyze" to get AI insights
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Important Points</h4>
                      <ul className="space-y-1">
                        {importanceHighlights
                          .filter(h => h.level === "high")
                          .map((h, i) => (
                            <li key={i} className="text-important">• {h.text}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NoteEditor;

