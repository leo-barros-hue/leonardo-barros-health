import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InlineCropArea from "./InlineCropArea";

// Re-export CropState from InlineCropArea
export type { CropState } from "./InlineCropArea";

interface ImageCropEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  label: string;
  initialCrop?: { x: number; y: number; zoom: number };
  onSave: (crop: { x: number; y: number; zoom: number }) => void;
}

export default function ImageCropEditor({
  open,
  onOpenChange,
  imageUrl,
  label,
  initialCrop,
  onSave,
}: ImageCropEditorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-base">Ajustar enquadramento — {label}</DialogTitle>
        </DialogHeader>
        <div className="p-4 pt-2">
          <InlineCropArea
            imageUrl={imageUrl}
            label={label}
            initialCrop={initialCrop}
            onConfirm={(crop) => {
              onSave(crop);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
