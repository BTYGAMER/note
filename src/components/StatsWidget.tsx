import { Card, CardContent } from "@/components/ui/card";
import { FileText, Folder, Hash } from "lucide-react";

interface StatsWidgetProps {
  folderCount: number;
  fileCount: number;
  totalNotes: number;
}

export const StatsWidget = ({ folderCount, fileCount, totalNotes }: StatsWidgetProps) => {
  const stats = [
    {
      label: "Folders",
      value: folderCount,
      icon: Folder,
    },
    {
      label: "Notes",
      value: fileCount,
      icon: FileText,
    },
    {
      label: "Words",
      value: totalNotes.toLocaleString(),
      icon: Hash,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
