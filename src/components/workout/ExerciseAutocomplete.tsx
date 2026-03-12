import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface ExerciseCatalogItem {
  id: string;
  name: string;
  muscle_group: string;
}

interface ExerciseAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (exercise: ExerciseCatalogItem) => void;
  exerciseCatalog: ExerciseCatalogItem[];
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export default function ExerciseAutocomplete({
  value,
  onChange,
  onSelect,
  exerciseCatalog,
  placeholder = "Nome do exercício...",
  onKeyDown,
}: ExerciseAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions =
    value.length >= 2
      ? exerciseCatalog
          .filter((ex) => ex.name.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 8)
      : [];

  useEffect(() => {
    setHighlightIndex(-1);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0 && open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      } else if (e.key === "Enter" && highlightIndex >= 0) {
        e.preventDefault();
        onSelect(suggestions[highlightIndex]);
        setOpen(false);
        return;
      }
    }
    onKeyDown?.(e);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => value.length >= 2 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-8 text-sm border-0 bg-transparent px-1 focus-visible:ring-0"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((ex, idx) => (
            <button
              key={ex.id}
              type="button"
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-accent transition-colors ${
                idx === highlightIndex ? "bg-accent" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(ex);
                setOpen(false);
              }}
            >
              <span className="text-foreground">{ex.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase">{ex.muscle_group}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
