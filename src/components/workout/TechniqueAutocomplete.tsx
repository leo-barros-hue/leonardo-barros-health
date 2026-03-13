import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface TechniqueCatalogItem {
  id: string;
  name: string;
  description: string;
}

interface TechniqueAutocompleteProps {
  value: string | null;
  onSelect: (technique: TechniqueCatalogItem | null) => void;
  techniqueCatalog: TechniqueCatalogItem[];
  onDescriptionClick?: (technique: TechniqueCatalogItem) => void;
}

export default function TechniqueAutocomplete({
  value,
  onSelect,
  techniqueCatalog,
  onDescriptionClick,
}: TechniqueAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = filter.length >= 1
    ? techniqueCatalog.filter((t) => t.name.toLowerCase().includes(filter.toLowerCase()))
    : techniqueCatalog;

  useEffect(() => { setHighlightIndex(-1); }, [filter]);

  useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [open, filter]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setFilter("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-technique-item]");
      items[highlightIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length > 0 && open) {
      if (e.key === "ArrowDown") { e.preventDefault(); setHighlightIndex((p) => (p + 1) % filtered.length); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setHighlightIndex((p) => (p <= 0 ? filtered.length - 1 : p - 1)); return; }
      if (e.key === "Enter" && highlightIndex >= 0) { e.preventDefault(); onSelect(filtered[highlightIndex]); setOpen(false); setFilter(""); return; }
      if (e.key === "Escape") { setOpen(false); setFilter(""); return; }
    }
  };

  const selectedTechnique = value ? techniqueCatalog.find((t) => t.name === value) : null;

  // If a technique is selected, show it as a clickable label
  if (selectedTechnique) {
    return (
      <div className="flex items-center gap-1 h-8 px-1">
        <button
          type="button"
          className="text-xs text-primary font-medium truncate hover:underline cursor-pointer flex-1 text-left"
          onClick={() => onDescriptionClick?.(selectedTechnique)}
          title="Clique para ver a explicação"
        >
          {selectedTechnique.name}
        </button>
        <button
          type="button"
          className="text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => onSelect(null)}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  const dropdown = open && filtered.length > 0 && dropdownPos
    ? createPortal(
        <div
          ref={listRef}
          className="fixed w-[300px] bg-popover border border-border rounded-lg shadow-lg max-h-52 overflow-y-auto"
          style={{ top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999 }}
        >
          {filtered.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              data-technique-item
              className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${idx === highlightIndex ? "bg-accent" : ""}`}
              onMouseDown={(e) => { e.preventDefault(); onSelect(t); setOpen(false); setFilter(""); }}
            >
              <span className="text-foreground font-medium block">{t.name}</span>
              {t.description && <span className="text-[10px] text-muted-foreground line-clamp-1">{t.description}</span>}
            </button>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={filter}
        onChange={(e) => { setFilter(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="—"
        className="h-8 text-xs text-center border-0 bg-transparent px-1 focus-visible:ring-1 focus-visible:ring-primary/30"
      />
      {dropdown}
    </div>
  );
}
