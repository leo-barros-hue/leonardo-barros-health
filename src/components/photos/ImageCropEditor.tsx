import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ZoomIn, ZoomOut, Crosshair, Grid3X3 } from "lucide-react";

export interface CropState {
  x: number;
  y: number;
  zoom: number;
}

interface ImageCropEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  label: string;
  initialCrop?: CropState;
  onSave: (crop: CropState) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export default function ImageCropEditor({
  open,
  onOpenChange,
  imageUrl,
  label,
  initialCrop,
  onSave,
}: ImageCropEditorProps) {
  const [crop, setCrop] = useState<CropState>(initialCrop ?? { x: 0, y: 0, zoom: 1 });
  const [showGuides, setShowGuides] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setCrop(initialCrop ?? { x: 0, y: 0, zoom: 1 });
    }
  }, [open, initialCrop]);

  const clampPosition = useCallback(
    (x: number, y: number, zoom: number) => {
      if (!containerRef.current || imgNaturalSize.w === 0) return { x, y };
      const container = containerRef.current.getBoundingClientRect();
      const aspect = imgNaturalSize.w / imgNaturalSize.h;
      const containerAspect = container.width / container.height;

      let imgW: number, imgH: number;
      if (aspect > containerAspect) {
        imgH = container.height * zoom;
        imgW = imgH * aspect;
      } else {
        imgW = container.width * zoom;
        imgH = imgW / aspect;
      }

      const maxX = Math.max(0, (imgW - container.width) / 2);
      const maxY = Math.max(0, (imgH - container.height) / 2);

      return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
      };
    },
    [imgNaturalSize]
  );

  const handleZoom = useCallback(
    (delta: number) => {
      setCrop((prev) => {
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.zoom + delta));
        const clamped = clampPosition(prev.x, prev.y, newZoom);
        return { ...clamped, zoom: newZoom };
      });
    },
    [clampPosition]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      handleZoom(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
    },
    [handleZoom]
  );

  // Mouse drag
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(true);
      setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [crop.x, crop.y]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      const clamped = clampPosition(newX, newY, crop.zoom);
      setCrop((prev) => ({ ...prev, ...clamped }));
    },
    [dragging, dragStart, crop.zoom, clampPosition]
  );

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Touch pinch zoom
  const lastTouchDist = useRef<number | null>(null);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (lastTouchDist.current !== null) {
          const delta = (dist - lastTouchDist.current) * 0.005;
          handleZoom(delta);
        }
        lastTouchDist.current = dist;
      }
    },
    [handleZoom]
  );

  const onTouchEnd = useCallback(() => {
    lastTouchDist.current = null;
  }, []);

  const centerImage = () => {
    setCrop({ x: 0, y: 0, zoom: 1 });
  };

  const handleSave = () => {
    onSave(crop);
    onOpenChange(false);
  };

  const zoomPct = Math.round((crop.zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-base">Ajustar enquadramento — {label}</DialogTitle>
        </DialogHeader>

        {/* Crop area */}
        <div
          ref={containerRef}
          className="relative mx-4 aspect-[3/4] rounded-xl border-2 border-primary/30 overflow-hidden cursor-grab active:cursor-grabbing select-none bg-muted"
          onWheel={handleWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: "none" }}
        >
          <img
            src={imageUrl}
            alt={label}
            draggable={false}
            onLoad={(e) => {
              const img = e.currentTarget;
              setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
            }}
            className="absolute w-full h-full pointer-events-none"
            style={{
              objectFit: "cover",
              transform: `translate(${crop.x}px, ${crop.y}px) scale(${crop.zoom})`,
              transformOrigin: "center center",
              transition: dragging ? "none" : "transform 0.15s ease-out",
            }}
          />

          {/* Alignment guides */}
          {showGuides && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Vertical center */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/40 -translate-x-px" />
              {/* Shoulders line ~25% */}
              <div className="absolute top-[25%] left-0 right-0 h-px bg-primary/40" />
              {/* Hips line ~55% */}
              <div className="absolute top-[55%] left-0 right-0 h-px bg-primary/40" />
              {/* Feet line ~95% */}
              <div className="absolute top-[95%] left-0 right-0 h-px bg-primary/40" />
              {/* Labels */}
              <span className="absolute top-[25%] right-1.5 text-[9px] text-primary/60 -translate-y-3">Ombros</span>
              <span className="absolute top-[55%] right-1.5 text-[9px] text-primary/60 -translate-y-3">Quadril</span>
              <span className="absolute top-[95%] right-1.5 text-[9px] text-primary/60 -translate-y-3">Pés</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3">
          {/* Zoom controls */}
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleZoom(-ZOOM_STEP)}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="flex-1 h-1.5 rounded-full bg-muted relative">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all"
                style={{ width: `${zoomPct}%` }}
              />
            </div>
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleZoom(ZOOM_STEP)}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-right">{(crop.zoom * 100).toFixed(0)}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="guides" checked={showGuides} onCheckedChange={setShowGuides} />
              <Label htmlFor="guides" className="text-xs flex items-center gap-1.5 cursor-pointer">
                <Grid3X3 className="w-3.5 h-3.5" />
                Guias de alinhamento
              </Label>
            </div>

            <Button type="button" variant="ghost" size="sm" onClick={centerImage}>
              <Crosshair className="w-4 h-4 mr-1.5" />
              Centralizar
            </Button>
          </div>
        </div>

        <DialogFooter className="p-4 pt-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Aplicar enquadramento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
