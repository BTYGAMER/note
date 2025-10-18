import { Card } from "@/components/ui/card";
import { FileText, Clock, Hash } from "lucide-react";

interface NoteStatsProps {
  content: string;
}

export const NoteStats = ({ content }: NoteStatsProps) => {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const readingTime = Math.ceil(wordCount / 200);

  const stats = [
    { label: "Words", value: wordCount, icon: FileText },
    { label: "Reading time", value: `${readingTime} min`, icon: Clock },
    { label: "Characters", value: charCount, icon: Hash },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-3 border shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-lg font-semibold">{stat.value}</p>
          </Card>
        );
      })}
    </div>
  );
};
