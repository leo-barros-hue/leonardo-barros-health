import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FoodOption {
  id: string;
  name: string;
  measure: string;
  protein_per_unit: number;
  carbs_per_unit: number;
  fat_per_unit: number;
}

interface FoodAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (food: FoodOption) => void;
  foodCatalog: FoodOption[];
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export default function FoodAutocomplete({
  value,
  onChange,
  onSelect,
  foodCatalog,
  placeholder = "Nome do alimento...",
  className,
  onKeyDown,
}: FoodAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = value.trim().toLowerCase();
  const suggestions =
    query.length > 2
      ? foodCatalog.filter((f) => f.name.toLowerCase().includes(query)).slice(0, 15)
      : [];

  useEffect(() => {
    setOpen(suggestions.length > 0);
    setHighlightIndex(0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectFood = (food: FoodOption) => {
    onSelect(food);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (open && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        selectFood(suggestions[highlightIndex]);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
    }
    onKeyDown?.(e);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        className={cn("h-8 text-sm border-0 bg-transparent px-0 focus-visible:ring-0", className)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-md border bg-popover shadow-lg">
          <ScrollArea className="max-h-48">
            <div className="p-1">
              {suggestions.map((food, i) => (
                <button
                  key={food.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectFood(food)}
                  onMouseEnter={() => setHighlightIndex(i)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm cursor-pointer",
                    i === highlightIndex
                      ? "bg-accent text-accent-foreground"
                      : "text-popover-foreground hover:bg-accent/50"
                  )}
                >
                  <span className="truncate">{food.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground shrink-0">
                    {food.measure}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
