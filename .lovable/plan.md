

## Plan: Add edit date functionality to Anamnesis module

### What changes

1. **`src/components/anamnesis/AnamnesisTab.tsx`** - Add date editing capability in two places:

   - **Editor header (registration date bar, line 268-276)**: Add a pencil/edit icon button next to the date. Clicking it opens a Popover with a Calendar date picker. On date select, update `created_at` in the database and local state.

   - **History sidebar (line 198-219)**: Add a small edit icon button on each history item (visible on hover). Clicking it opens the same Popover/Calendar to edit that record's `created_at` date. Use `e.stopPropagation()` to prevent switching the active record when clicking edit.

2. **State management**: Add `editingDateId` state to track which record's date is being edited. On date selection, call `supabase.update()` on the `anamneses` table to update `created_at`, then update local `records` state and show a success toast.

### Technical details

- Uses existing `Calendar` component (with `pointer-events-auto` class), `Popover`, `PopoverTrigger`, `PopoverContent` from shadcn
- Uses `Pencil` icon from lucide-react
- Updates `created_at` column in `anamneses` table (timestamp with time zone) - will convert the selected date to ISO string preserving the time portion
- Re-sorts records after date change since the list is ordered by `created_at desc`

