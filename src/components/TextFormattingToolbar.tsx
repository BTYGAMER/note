import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Sigma, Wand2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TextFormattingToolbarProps {
  onFormat: (type: string, value?: string) => void;
  onBeautify: () => void;
  beautifying: boolean;
}

const mathSymbols = [
  { symbol: "∑", name: "Sum" },
  { symbol: "∫", name: "Integral" },
  { symbol: "∂", name: "Partial Derivative" },
  { symbol: "∆", name: "Delta" },
  { symbol: "π", name: "Pi" },
  { symbol: "√", name: "Square Root" },
  { symbol: "∞", name: "Infinity" },
  { symbol: "≈", name: "Approximately" },
  { symbol: "≠", name: "Not Equal" },
  { symbol: "≤", name: "Less Than or Equal" },
  { symbol: "≥", name: "Greater Than or Equal" },
  { symbol: "±", name: "Plus Minus" },
  { symbol: "×", name: "Multiply" },
  { symbol: "÷", name: "Divide" },
  { symbol: "α", name: "Alpha" },
  { symbol: "β", name: "Beta" },
  { symbol: "γ", name: "Gamma" },
  { symbol: "θ", name: "Theta" },
  { symbol: "λ", name: "Lambda" },
  { symbol: "μ", name: "Mu" },
  { symbol: "σ", name: "Sigma" },
  { symbol: "Ω", name: "Omega" },
  { symbol: "∈", name: "Element Of" },
  { symbol: "∉", name: "Not Element Of" },
  { symbol: "⊂", name: "Subset Of" },
  { symbol: "⊃", name: "Superset Of" },
  { symbol: "∪", name: "Union" },
  { symbol: "∩", name: "Intersection" },
  { symbol: "∀", name: "For All" },
  { symbol: "∃", name: "There Exists" },
];

const fonts = [
  { value: "mono", label: "Monospace" },
  { value: "sans", label: "Sans Serif" },
  { value: "serif", label: "Serif" },
];

export const TextFormattingToolbar = ({ onFormat, onBeautify, beautifying }: TextFormattingToolbarProps) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-card border rounded-lg shadow-soft flex-wrap">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onFormat("bold")}
          title="Bold"
          className="h-9 w-9"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onFormat("italic")}
          title="Italic"
          className="h-9 w-9"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onFormat("underline")}
          title="Underline"
          className="h-9 w-9"
        >
          <Underline className="w-4 h-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onFormat("align-left")}
          title="Align Left"
          className="h-9 w-9"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onFormat("align-center")}
          title="Align Center"
          className="h-9 w-9"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onFormat("align-right")}
          title="Align Right"
          className="h-9 w-9"
        >
          <AlignRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-border" />

      <Select onValueChange={(value) => onFormat("font", value)}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {fonts.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="h-6 w-px bg-border" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Sigma className="w-4 h-4 mr-2" />
            Math Symbols
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <Card className="p-3">
            <h4 className="text-sm font-semibold mb-3">Mathematical Symbols</h4>
            <div className="grid grid-cols-6 gap-2">
              {mathSymbols.map((item) => (
                <Button
                  key={item.symbol}
                  variant="ghost"
                  size="sm"
                  onClick={() => onFormat("insert", item.symbol)}
                  title={item.name}
                  className="h-10 w-10 text-lg hover:bg-accent"
                >
                  {item.symbol}
                </Button>
              ))}
            </div>
          </Card>
        </PopoverContent>
      </Popover>

      <div className="h-6 w-px bg-border" />

      <Button
        variant="default"
        size="sm"
        onClick={onBeautify}
        disabled={beautifying}
        className="h-9 bg-gradient-hero hover:opacity-90 text-black"
      >
        <Wand2 className="w-4 h-4 mr-2" />
        {beautifying ? "Beautifying..." : "Beautify Notes"}
      </Button>
    </div>
  );
};
