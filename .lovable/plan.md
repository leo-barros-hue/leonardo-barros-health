

## Plan: Inline crop tools in upload slots + enhanced alignment guides

### What changes

1. **Embed crop controls directly in `PhotoUploadSlot`** (in `PatientPhotosTab.tsx`)
   - When a photo is uploaded and the user clicks on it, instead of opening the `ImageCropEditor` dialog, expand an inline editing panel below the image within the same card.
   - The inline panel includes: zoom +/- buttons with progress bar, guides toggle, and centralize button — same controls currently in the dialog but rendered inline.
   - Add drag-to-move and scroll-to-zoom directly on the upload slot image (reuse the same pointer/wheel event logic from `ImageCropEditor`).
   - The slot transitions from a static preview to an interactive crop area when clicked, with a small "Concluir" button to confirm.

2. **Refactor `ImageCropEditor.tsx`** into two parts:
   - Extract a **`InlineCropArea`** component that contains the image container with drag/zoom/pinch logic and the controls bar (zoom, guides, centralize). This component does NOT use a Dialog — it renders inline.
   - Keep `ImageCropEditor` as a wrapper that puts `InlineCropArea` inside a Dialog (for the expanded view in history sessions).

3. **Enhanced alignment guides** (in the extracted `InlineCropArea`)
   - Replace the current 4-line guide overlay with a denser grid:
     - **Vertical lines**: 3 lines at 25%, 50%, 75%
     - **Horizontal lines**: 5 lines at 15% (head), 30% (shoulders), 50% (waist), 70% (hips), 90% (feet)
     - Add a subtle 3x3 rule-of-thirds grid as thin dotted lines
   - Keep the labeled reference lines (Ombros, Quadril, Pés) but add Cabeça and Cintura labels

### Technical details

- **New component**: `InlineCropArea` extracted from `ImageCropEditor.tsx` — contains `containerRef`, drag/zoom/pinch handlers, guides overlay, zoom bar, guides toggle, centralize button
- **`ImageCropEditor`**: simplified to Dialog wrapper around `InlineCropArea` + save/cancel footer
- **`PhotoUploadSlot`**: gains `editing` state. When `editing=true`, renders `InlineCropArea` instead of static preview. On "Concluir", calls `onCropChange(crop)` callback and exits edit mode.
- **Files modified**: `src/components/photos/ImageCropEditor.tsx`, `src/components/photos/PatientPhotosTab.tsx`
- No database changes needed — `crop_data` JSONB column already stores `{x, y, zoom}` per slot

