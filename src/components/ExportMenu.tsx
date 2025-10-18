import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

interface ExportMenuProps {
  content: string;
  fileName: string;
}

export const ExportMenu = ({ content, fileName }: ExportMenuProps) => {
  const { toast } = useToast();
  const { getFeatureLimits } = useSubscription();
  const navigate = useNavigate();
  const limits = getFeatureLimits();

  const handleExport = (format: string, exportFn: () => void) => {
    if (!limits.exportFormats.includes(format)) {
      toast({
        title: "Upgrade Required",
        description: `Export to ${format.toUpperCase()} is available with Gold or Platinum subscription`,
        variant: "destructive",
      });
      navigate("/pricing");
      return;
    }
    exportFn();
  };

  const exportAsMarkdown = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as Markdown!" });
  };

  const exportAsTxt = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as Text!" });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("md", exportAsMarkdown)}>
          <FileText className="w-4 h-4 mr-2" />
          Markdown (.md) {!limits.exportFormats.includes("md") && "🔒"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("txt", exportAsTxt)}>
          <File className="w-4 h-4 mr-2" />
          Text (.txt)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyToClipboard}>
          Copy to Clipboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
