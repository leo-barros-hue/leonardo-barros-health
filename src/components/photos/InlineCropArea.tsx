import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ZoomIn, ZoomOut, Crosshair, Grid3X3, Check } from "lucide-react";

export interface CropState {
  x: number;
  y: number;
  zoom: number;
}

interface InlineCropAreaProps {
  imageUrl: string;
  label: string;
  initialCrop?: CropState;
  onConfirm: (crop: CropState) => void;
  onCancel?: () => void;
  /** Show confirm/cancel buttons. Default true */
  showActions?: boolean;
  /** Aspect ratio class. Default "aspect-[3/4]" */
  aspectClass?: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export default function InlineCropArea({
  imageUrl,
  label,
  initialCrop,
  onConfirm,
  onCancel,
  showActions = true,
  aspectClass = "aspect-[3/4]",
}: InlineCropAreaProps) {
  const [crop, setCrop] = useState<CropState>(initialCrop ?? { x: 0, y: 0, zoom: 1 });
  const [showGuides, setShowGuides] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCrop(initialCrop ?? { x: 0, y: 0, zoom: 1 });
  }, [initialCrop]);

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

  const zoomPct = Math.round(((crop.zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100);

  return (
    <div className="space-y-2">
      {/* Crop container */}
      <div
        ref={containerRef}
        className={`relative ${aspectClass} rounded-xl border-2 border-primary/40 overflow-hidden cursor-grab active:cursor-grabbing select-none bg-muted`}
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

        {/* Enhanced alignment guides */}
        {showGuides && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Vertical lines at 25%, 50%, 75% */}
            <div className="absolute left-1/4 top-0 bottom-0 w-px bg-primary/25" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/50 -translate-x-px" />
            <div className="absolute left-3/4 top-0 bottom-0 w-px bg-primary/25" />

            {/* Horizontal reference lines with labels */}
            {/* Head ~15% */}
            <div className="absolute top-[15%] left-0 right-0 h-px bg-primary/35" />
            <span className="absolute top-[15%] right-1 text-[8px] text-primary/60 -translate-y-3">Cabeça</span>

            {/* Shoulders ~30% */}
            <div className="absolute top-[30%] left-0 right-0 h-px bg-primary/40" />
            <span className="absolute top-[30%] right-1 text-[8px] text-primary/60 -translate-y-3">Ombros</span>

            {/* Waist ~50% */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/40" />
            <span className="absolute top-1/2 right-1 text-[8px] text-primary/60 -translate-y-3">Cintura</span>

            {/* Hips ~70% */}
            <div className="absolute top-[70%] left-0 right-0 h-px bg-primary/35" />
            <span className="absolute top-[70%] right-1 text-[8px] text-primary/60 -translate-y-3">Quadril</span>

            {/* Feet ~90% */}
            <div className="absolute top-[90%] left-0 right-0 h-px bg-primary/35" />
            <span className="absolute top-[90%] right-1 text-[8px] text-primary/60 -translate-y-3">Pés</span>

            {/* Rule-of-thirds dotted grid */}
            <div className="absolute top-1/3 left-0 right-0 border-t border-dotted border-primary/15" />
            <div className="absolute top-2/3 left-0 right-0 border-t border-dotted border-primary/15" />
            <div className="absolute left-1/3 top-0 bottom-0 border-l border-dotted border-primary/15" />
            <div className="absolute left-2/3 top-0 bottom-0 border-l border-dotted border-primary/15" />
          </div>
        )}
      </div>

      {/* Compact controls */}
      <div className="space-y-1.5">
        {/* Zoom bar */}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => handleZoom(-ZOOM_STEP)}>
            <ZoomOut className="w-3 h-3" />
          </Button>
          <div className="flex-1 h-1 rounded-full bg-muted relative">
            <div className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all" style={{ width: `${zoomPct}%` }} />
          </div>
          <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => handleZoom(ZOOM_STEP)}>
            <ZoomIn className="w-3 h-3" />
          </Button>
          <span className="text-[10px] text-muted-foreground w-8 text-right">{(crop.zoom * 100).toFixed(0)}%</span>
        </div>

        {/* Guides + center */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Switch id={`guides-${label}`} checked={showGuides} onCheckedChange={setShowGuides} className="scale-75 origin-left" />
            <Label htmlFor={`guides-${label}`} className="text-[10px] flex items-center gap-1 cursor-pointer text-muted-foreground">
              <Grid3X3 className="w-3 h-3" />
              Guias
            </Label>
          </div>

          <Button type="button" variant="ghost" size="sm" className="h-6 text-[10px] px-1.5" onClick={centerImage}>
            <Crosshair className="w-3 h-3 mr-1" />
            Centralizar
          </Button>
        </div>

        {/* Action buttons */}
        {showActions && (
          <div className="flex gap-1.5">
            {onCancel && (
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="button" size="sm" className="h-7 text-xs flex-1" onClick={() => onConfirm(crop)}>
              <Check className="w-3 h-3 mr-1" />
              Concluir
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
