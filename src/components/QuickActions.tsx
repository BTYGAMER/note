import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, FolderPlus } from "lucide-react";

interface QuickActionsProps {
  onNewFolder: () => void;
  onNewNote: () => void;
  onExport?: () => void;
}

export const QuickActions = ({ onNewFolder, onNewNote }: QuickActionsProps) => {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onNewFolder}
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
              <Button
                size="sm"
                onClick={onNewNote}
              >
                <FileText className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
