import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ onSearch, placeholder = "Search notes..." }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative w-full max-w-md group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 h-10"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
