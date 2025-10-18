import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FolderPlus, FilePlus, LogOut, Folder, FileText, Trash2, Sparkles, Clock, Settings as SettingsIcon } from "lucide-react";
import logo from "@/assets/logo.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SearchBar } from "@/components/SearchBar";
import { StatsWidget } from "@/components/StatsWidget";
import { QuickActions } from "@/components/QuickActions";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { UsageLimits } from "@/components/UsageLimits";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import goldBadge from "@/assets/gold-badge.png";
import platinumBadge from "@/assets/platinum-badge.png";

interface Folder {
  id: string;
  name: string;
}

interface File {
  id: string;
  name: string;
  folder_id: string;
  note_format: string;
}

const Dashboard = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isNewFileOpen, setIsNewFileOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tier, hasFeature, getFeatureLimits } = useSubscription();

  useEffect(() => {
    checkUser();
    fetchFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      fetchFiles(selectedFolder);
    }
  }, [selectedFolder]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
    setLoading(false);
  };

  const fetchFolders = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching folders", variant: "destructive" });
    } else {
      setFolders(data || []);
    }
  };

  const fetchFiles = async (folderId: string) => {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("folder_id", folderId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching files", variant: "destructive" });
    } else {
      setFiles(data || []);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const limits = getFeatureLimits();
    if (folders.length >= limits.maxFolders) {
      toast({ 
        title: "Folder Limit Reached", 
        description: `${tier === "free" ? "Free tier is limited to 1 folder" : `You've reached your ${tier} plan limit of ${limits.maxFolders} folders`}. Upgrade for more!`,
        variant: "destructive" 
      });
      navigate("/pricing");
      return;
    }

    const { error } = await supabase.from("folders").insert({
      name: newFolderName,
      user_id: user.id,
    });

    if (error) {
      toast({ title: "Error creating folder", variant: "destructive" });
    } else {
      toast({ title: "Folder created successfully!" });
      setNewFolderName("");
      setIsNewFolderOpen(false);
      fetchFolders();
    }
  };

  const createFile = async () => {
    if (!newFileName.trim() || !selectedFolder) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const limits = getFeatureLimits();
    if (files.length >= limits.maxNotes) {
      toast({ 
        title: "Note Limit Reached", 
        description: `${tier === "free" ? "Free tier is limited to 10 notes" : `You've reached your ${tier} plan limit of ${limits.maxNotes} notes`}. Upgrade for unlimited notes!`,
        variant: "destructive" 
      });
      navigate("/pricing");
      return;
    }

    navigate(`/format-selection?folder=${selectedFolder}&name=${encodeURIComponent(newFileName)}`);
  };

  const deleteFolder = async (folderId: string) => {
    const { error } = await supabase.from("folders").delete().eq("id", folderId);
    
    if (error) {
      toast({ title: "Error deleting folder", variant: "destructive" });
    } else {
      toast({ title: "Folder deleted successfully!" });
      fetchFolders();
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
        setFiles([]);
      }
    }
  };

  const deleteFile = async (fileId: string) => {
    const { error } = await supabase.from("files").delete().eq("id", fileId);
    
    if (error) {
      toast({ title: "Error deleting file", variant: "destructive" });
    } else {
      toast({ title: "File deleted successfully!" });
      if (selectedFolder) {
        fetchFiles(selectedFolder);
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="NoteTaker" className="w-10 h-10 rounded-lg" />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">NoteTaker</h1>
                <p className="text-xs text-muted-foreground">Your workspace</p>
              </div>
              {tier === "gold" && (
                <img src={goldBadge} alt="Gold" className="h-6 cursor-pointer" onClick={() => navigate("/pricing")} />
              )}
              {tier === "platinum" && (
                <img src={platinumBadge} alt="Platinum" className="h-6 cursor-pointer" onClick={() => navigate("/pricing")} />
              )}
              {tier === "free" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/pricing")}
                  className="text-xs"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Upgrade
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/settings")}
                className="text-muted-foreground hover:text-foreground"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut} 
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          <SearchBar onSearch={setSearchQuery} placeholder="Search folders and files..." />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        <UpgradeBanner />
        
        <StatsWidget
          folderCount={folders.length} 
          fileCount={files.length} 
          totalNotes={files.length * 250}
        />
        
        <QuickActions 
          onNewFolder={() => setIsNewFolderOpen(true)}
          onNewNote={() => {
            if (selectedFolder) {
              setIsNewFileOpen(true);
            } else {
              toast({ title: "Please select a folder first", variant: "destructive" });
            }
          }}
        />

        <UsageLimits noteCount={files.length} folderCount={folders.length} />

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Folder className="w-5 h-5 text-muted-foreground" />
                  Folders
                  <span className="text-xs text-muted-foreground font-normal">
                    ({folders.length}{getFeatureLimits().maxFolders !== Infinity ? `/${getFeatureLimits().maxFolders}` : ""})
                  </span>
                </CardTitle>
                <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <FolderPlus className="w-4 h-4 mr-2" />
                      New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="folderName">Folder Name</Label>
                        <Input
                          id="folderName"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="e.g., Biology 101"
                        />
                      </div>
                      <Button onClick={createFolder} className="w-full">
                        Create Folder
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {filteredFolders.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No folders match your search" : "No folders yet"}
                  </p>
                </div>
              ) : (
                filteredFolders.map((folder) => (
                  <div key={folder.id} className="flex items-center gap-2 group">
                    <Button
                      variant={selectedFolder === folder.id ? "secondary" : "ghost"}
                      className="flex-1 justify-start h-9 font-normal"
                      onClick={() => setSelectedFolder(folder.id)}
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      {folder.name}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this folder and all its files.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteFolder(folder.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  Notes
                  <span className="text-xs text-muted-foreground font-normal">
                    ({files.length}{getFeatureLimits().maxNotes !== Infinity ? `/${getFeatureLimits().maxNotes}` : ""})
                  </span>
                </CardTitle>
                {selectedFolder && (
                  <Dialog open={isNewFileOpen} onOpenChange={setIsNewFileOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <FilePlus className="w-4 h-4 mr-2" />
                        New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New File</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="fileName">File Name</Label>
                          <Input
                            id="fileName"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="e.g., Lecture 1"
                          />
                        </div>
                        <Button onClick={createFile} className="w-full">
                          Continue to Format Selection
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {!selectedFolder ? (
                <div className="text-center py-12">
                  <Sparkles className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Select a folder to view notes
                  </p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No notes match your search" : "No notes yet"}
                  </p>
                </div>
              ) : (
                filteredFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 group">
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start h-auto py-2 font-normal"
                      onClick={() => navigate(`/note/${file.id}`)}
                    >
                      <FileText className="w-4 h-4 mr-2 shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="text-sm">{file.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{file.note_format}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>Recently edited</span>
                        </div>
                      </div>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete File?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this file and all its notes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteFile(file.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
