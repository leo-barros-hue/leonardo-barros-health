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
  onBlur?: () => void;
  inputClassName?: string;
}

const MUSCLE_GROUP_ORDER = [
  "PEITO", "DORSAL", "OMBROS", "BRAÇOS", "ANTEBRAÇO",
  "QUADRÍCEPS", "ISQUIOTIBIAIS", "ADUTORES", "GLÚTEOS", "ABDOME", "PANTURRILHA",
];

export default function ExerciseAutocomplete({
  value,
  onChange,
  onSelect,
  exerciseCatalog,
  placeholder = "Adicionar exercício...",
  onKeyDown,
  onBlur,
  inputClassName,
}: ExerciseAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Show all when no filter, or filter by typed text
  const filtered = value.length >= 1
    ? exerciseCatalog.filter((ex) => ex.name.toLowerCase().includes(value.toLowerCase()))
    : exerciseCatalog;

  // Group by muscle group
  const grouped = MUSCLE_GROUP_ORDER.reduce((acc, group) => {
    const items = filtered.filter((ex) => ex.muscle_group === group);
    if (items.length > 0) acc.push({ group, items });
    return acc;
  }, [] as { group: string; items: ExerciseCatalogItem[] }[]);

  // Flat list for keyboard navigation
  const flatList = grouped.flatMap((g) => g.items);

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

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-exercise-item]");
      items[highlightIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatList.length > 0 && open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) => (prev + 1) % flatList.length);
        return;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) => (prev <= 0 ? flatList.length - 1 : prev - 1));
        return;
      } else if (e.key === "Enter" && highlightIndex >= 0) {
        e.preventDefault();
        onSelect(flatList[highlightIndex]);
        setOpen(false);
        return;
      } else if (e.key === "Escape") {
        setOpen(false);
        return;
      }
    }
    onKeyDown?.(e);
  };

  let flatIdx = -1;

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-8 text-sm border-0 bg-transparent px-1 focus-visible:ring-0"
      />
      {open && flatList.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 top-full left-0 w-[360px] mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {grouped.map(({ group, items }) => (
            <div key={group}>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-primary bg-muted/50 sticky top-0">
                {group}
              </div>
              {items.map((ex) => {
                flatIdx++;
                const idx = flatIdx;
                return (
                  <button
                    key={ex.id}
                    type="button"
                    data-exercise-item
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors ${
                      idx === highlightIndex ? "bg-accent" : ""
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSelect(ex);
                      setOpen(false);
                    }}
                  >
                    <span className="text-foreground">{ex.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
