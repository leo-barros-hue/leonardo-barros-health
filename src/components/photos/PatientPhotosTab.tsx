import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Camera, Plus, Trash2, Eye, GitCompareArrows, X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ImageCropEditor, { type CropState } from "./ImageCropEditor";

interface CropData {
  [slotKey: string]: CropState;
}

interface PhotoSession {
  id: string;
  patient_id: string;
  session_date: string;
  front_url: string | null;
  back_url: string | null;
  left_url: string | null;
  right_url: string | null;
  crop_data: CropData | null;
  created_at: string;
}

const PHOTO_SLOTS = [
  { key: "front_url" as const, label: "Frente" },
  { key: "back_url" as const, label: "Costas" },
  { key: "left_url" as const, label: "Lado Esquerdo" },
  { key: "right_url" as const, label: "Lado Direito" },
];

export default function PatientPhotosTab({ patientId }: { patientId: string }) {
  const [sessions, setSessions] = useState<PhotoSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New session state
  const [sessionDate, setSessionDate] = useState<Date>(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [photos, setPhotos] = useState<Record<string, File | null>>({
    front_url: null, back_url: null, left_url: null, right_url: null,
  });
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [cropData, setCropData] = useState<CropData>({});

  // Crop editor state
  const [editingSlot, setEditingSlot] = useState<{ url: string; key: string; label: string; sessionId?: string } | null>(null);

  // View/compare state
  const [viewSession, setViewSession] = useState<PhotoSession | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    const { data } = await supabase
      .from("photo_sessions")
      .select("*")
      .eq("patient_id", patientId)
      .order("session_date", { ascending: false });
    setSessions((data as unknown as PhotoSession[]) || []);
    setLoading(false);
  }, [patientId]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleFileChange = (slotKey: string, file: File | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast({ title: "Formato inválido", description: "Apenas JPG e PNG são aceitos.", variant: "destructive" });
      return;
    }
    setPhotos((prev) => ({ ...prev, [slotKey]: file }));
    const url = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [slotKey]: url }));
    // Reset crop when new file is added
    setCropData((prev) => { const c = { ...prev }; delete c[slotKey]; return c; });
  };

  const removePhoto = (slotKey: string) => {
    setPhotos((prev) => ({ ...prev, [slotKey]: null }));
    setPreviews((prev) => {
      const copy = { ...prev };
      if (copy[slotKey]) URL.revokeObjectURL(copy[slotKey]);
      delete copy[slotKey];
      return copy;
    });
    setCropData((prev) => { const c = { ...prev }; delete c[slotKey]; return c; });
  };

  const handleDrop = (slotKey: string, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(slotKey, file);
  };

  const saveSession = async () => {
    const hasAnyPhoto = Object.values(photos).some(Boolean);
    if (!hasAnyPhoto) {
      toast({ title: "Nenhuma foto", description: "Adicione pelo menos uma foto.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const urls: Record<string, string | null> = {
        front_url: null, back_url: null, left_url: null, right_url: null,
      };

      for (const slot of PHOTO_SLOTS) {
        const file = photos[slot.key];
        if (!file) continue;
        const ext = file.name.split(".").pop();
        const path = `${patientId}/${Date.now()}-${slot.key}.${ext}`;
        const { error } = await supabase.storage.from("patient-photos").upload(path, file);
        if (error) throw error;
        const { data: publicData } = supabase.storage.from("patient-photos").getPublicUrl(path);
        urls[slot.key] = publicData.publicUrl;
      }

      const { error } = await supabase.from("photo_sessions").insert({
        patient_id: patientId,
        session_date: format(sessionDate, "yyyy-MM-dd"),
        ...urls,
        crop_data: Object.keys(cropData).length > 0 ? cropData : null,
      } as any);
      if (error) throw error;

      toast({ title: "Sessão salva com sucesso!" });
      setPhotos({ front_url: null, back_url: null, left_url: null, right_url: null });
      setPreviews({});
      setCropData({});
      setSessionDate(new Date());
      fetchSessions();
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteSession = async (session: PhotoSession) => {
    for (const slot of PHOTO_SLOTS) {
      const url = session[slot.key];
      if (!url) continue;
      const parts = url.split("/patient-photos/");
      if (parts[1]) {
        await supabase.storage.from("patient-photos").remove([decodeURIComponent(parts[1])]);
      }
    }
    await supabase.from("photo_sessions").delete().eq("id", session.id);
    toast({ title: "Sessão excluída" });
    fetchSessions();
  };

  // Save crop for an existing session
  const saveCropForSession = async (sessionId: string, slotKey: string, crop: CropState) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const existing = (session.crop_data as CropData) || {};
    const updated = { ...existing, [slotKey]: crop };
    await supabase.from("photo_sessions").update({ crop_data: updated } as any).eq("id", sessionId);
    fetchSessions();
    toast({ title: "Enquadramento salvo!" });
  };

  const compareSessionA = sessions.find((s) => s.id === compareA);
  const compareSessionB = sessions.find((s) => s.id === compareB);

  return (
    <div className="space-y-6">
      {/* New session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="w-5 h-5 text-primary" />
            Nova sessão de fotos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Data da avaliação:</span>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(sessionDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={sessionDate}
                  onSelect={(d) => { if (d) { setSessionDate(d); setDateOpen(false); } }}
                  locale={ptBR}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PHOTO_SLOTS.map((slot) => (
              <PhotoUploadSlot
                key={slot.key}
                label={slot.label}
                preview={previews[slot.key]}
                cropState={cropData[slot.key]}
                onFileChange={(f) => handleFileChange(slot.key, f)}
                onRemove={() => removePhoto(slot.key)}
                onDrop={(e) => handleDrop(slot.key, e)}
                onEdit={() => {
                  if (previews[slot.key]) {
                    setEditingSlot({ url: previews[slot.key], key: slot.key, label: slot.label });
                  }
                }}
              />
            ))}
          </div>

          <Button onClick={saveSession} disabled={saving} className="w-full sm:w-auto">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Salvar sessão
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Histórico de fotos</CardTitle>
          {sessions.length >= 2 && (
            <Button variant="outline" size="sm" onClick={() => { setCompareMode(true); setCompareA(null); setCompareB(null); }}>
              <GitCompareArrows className="w-4 h-4 mr-2" />
              Comparar evolução
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma sessão de fotos registrada.</p>
          ) : (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl border bg-card hover:bg-accent/30 transition-colors group",
                    compareMode && (compareA === session.id || compareB === session.id) && "ring-2 ring-primary"
                  )}
                >
                  {compareMode && (
                    <Button
                      size="sm"
                      variant={compareA === session.id || compareB === session.id ? "default" : "outline"}
                      className="shrink-0"
                      onClick={() => {
                        if (compareA === session.id) setCompareA(null);
                        else if (compareB === session.id) setCompareB(null);
                        else if (!compareA) setCompareA(session.id);
                        else if (!compareB) setCompareB(session.id);
                      }}
                    >
                      {compareA === session.id ? "A" : compareB === session.id ? "B" : "Selecionar"}
                    </Button>
                  )}

                  <div className="shrink-0">
                    <span className="text-sm font-medium text-foreground">
                      {format(new Date(session.session_date + "T12:00:00"), "dd/MM/yyyy")}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-1 min-w-0">
                    {PHOTO_SLOTS.map((slot) => (
                      <div key={slot.key} className="w-12 h-12 rounded-lg border bg-muted overflow-hidden shrink-0">
                        {session[slot.key] ? (
                          <CroppedImage
                            src={session[slot.key]!}
                            alt={slot.label}
                            crop={session.crop_data?.[slot.key]}
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewSession(session)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir sessão de fotos?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação é irreversível. Todas as fotos desta sessão serão removidas.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteSession(session)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compare mode controls */}
      {compareMode && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Comparar evolução</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setCompareMode(false)}>
              <X className="w-4 h-4 mr-1" /> Fechar
            </Button>
          </CardHeader>
          <CardContent>
            {compareA && compareB && compareSessionA && compareSessionB ? (
              <div className="space-y-6">
                {PHOTO_SLOTS.map((slot) => (
                  <div key={slot.key}>
                    <h4 className="text-sm font-semibold text-foreground mb-2">{slot.label}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ComparePhoto url={compareSessionA[slot.key]} date={compareSessionA.session_date} label="A" crop={compareSessionA.crop_data?.[slot.key]} />
                      <ComparePhoto url={compareSessionB[slot.key]} date={compareSessionB.session_date} label="B" crop={compareSessionB.crop_data?.[slot.key]} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Selecione duas sessões no histórico acima para comparar.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Expanded view dialog */}
      <Dialog open={!!viewSession} onOpenChange={() => setViewSession(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Sessão de {viewSession && format(new Date(viewSession.session_date + "T12:00:00"), "dd/MM/yyyy")}
            </DialogTitle>
          </DialogHeader>
          {viewSession && (
            <div className="grid grid-cols-2 gap-4">
              {PHOTO_SLOTS.map((slot) => (
                <div key={slot.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{slot.label}</span>
                    {viewSession[slot.key] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => {
                          setEditingSlot({
                            url: viewSession[slot.key]!,
                            key: slot.key,
                            label: slot.label,
                            sessionId: viewSession.id,
                          });
                        }}
                      >
                        Ajustar
                      </Button>
                    )}
                  </div>
                  <div className="aspect-[3/4] rounded-xl border bg-muted overflow-hidden">
                    {viewSession[slot.key] ? (
                      <CroppedImage
                        src={viewSession[slot.key]!}
                        alt={slot.label}
                        crop={viewSession.crop_data?.[slot.key]}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Camera className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Crop editor */}
      {editingSlot && (
        <ImageCropEditor
          open={!!editingSlot}
          onOpenChange={(open) => { if (!open) setEditingSlot(null); }}
          imageUrl={editingSlot.url}
          label={editingSlot.label}
          initialCrop={
            editingSlot.sessionId
              ? sessions.find((s) => s.id === editingSlot.sessionId)?.crop_data?.[editingSlot.key]
              : cropData[editingSlot.key]
          }
          onSave={(crop) => {
            if (editingSlot.sessionId) {
              saveCropForSession(editingSlot.sessionId, editingSlot.key, crop);
              // Also update viewSession locally
              setViewSession((prev) => {
                if (!prev) return prev;
                return { ...prev, crop_data: { ...(prev.crop_data || {}), [editingSlot.key]: crop } };
              });
            } else {
              setCropData((prev) => ({ ...prev, [editingSlot.key]: crop }));
            }
            setEditingSlot(null);
          }}
        />
      )}
    </div>
  );
}

// Reusable component to display a photo with saved crop transforms
function CroppedImage({ src, alt, crop, className }: { src: string; alt: string; crop?: CropState; className?: string }) {
  const style: React.CSSProperties = {
    objectFit: "cover",
  };
  if (crop) {
    style.transform = `translate(${crop.x}px, ${crop.y}px) scale(${crop.zoom})`;
    style.transformOrigin = "center center";
  }
  return <img src={src} alt={alt} className={cn("pointer-events-none", className)} style={style} />;
}

function ComparePhoto({ url, date, label, crop }: { url: string | null; date: string; label: string; crop?: CropState }) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground">
        {label} — {format(new Date(date + "T12:00:00"), "dd/MM/yyyy")}
      </span>
      <div className="aspect-[3/4] rounded-xl border bg-muted overflow-hidden">
        {url ? (
          <CroppedImage src={url} alt={label} crop={crop} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Camera className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoUploadSlot({
  label,
  preview,
  cropState,
  onFileChange,
  onRemove,
  onDrop,
  onEdit,
}: {
  label: string;
  preview?: string;
  cropState?: CropState;
  onFileChange: (f: File | null) => void;
  onRemove: () => void;
  onDrop: (e: React.DragEvent) => void;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {preview ? (
        <div className="relative aspect-[3/4] rounded-xl border overflow-hidden group cursor-pointer" onClick={onEdit}>
          <CroppedImage src={preview} alt={label} crop={cropState} className="w-full h-full" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded">
              Ajustar
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-1.5 right-1.5 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <label
          className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <Upload className="w-6 h-6 text-muted-foreground mb-1" />
          <span className="text-xs text-muted-foreground">Adicionar</span>
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          />
        </label>
      )}
    </div>
  );
}
