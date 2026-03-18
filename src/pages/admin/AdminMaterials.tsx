import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, Video, Download, ExternalLink, Trash2, Pencil } from "lucide-react";
import PdfUploadDialog from "@/components/materials/PdfUploadDialog";
import VideoAddDialog from "@/components/materials/VideoAddDialog";
import EditPdfDialog from "@/components/materials/EditPdfDialog";
import EditVideoDialog from "@/components/materials/EditVideoDialog";
import { toast } from "@/components/ui/sonner";

const AdminMaterials = () => {
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [editingPdf, setEditingPdf] = useState<any>(null);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: pdfs = [] } = useQuery({
    queryKey: ["materials-pdfs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials_pdfs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: videos = [] } = useQuery({
    queryKey: ["materials-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials_videos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["materials-pdfs"] });
    queryClient.invalidateQueries({ queryKey: ["materials-videos"] });
  };

  const deletePdf = async (id: string, fileName: string) => {
    if (!confirm("Deseja excluir este material?")) return;
    await supabase.storage.from("materials").remove([fileName]);
    await supabase.from("materials_pdfs").delete().eq("id", id);
    toast.success("PDF removido.");
    invalidate();
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Deseja remover este vídeo?")) return;
    await supabase.from("materials_videos").delete().eq("id", id);
    toast.success("Vídeo removido.");
    invalidate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">📚 Materiais</h1>
        <p className="text-muted-foreground">Biblioteca de conteúdos educativos</p>
      </div>

      <Tabs defaultValue="pdfs">
        <TabsList>
          <TabsTrigger value="pdfs" className="gap-2">
            <FileText className="w-4 h-4" /> PDFs
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Video className="w-4 h-4" /> Vídeos
          </TabsTrigger>
        </TabsList>

        {/* PDFs Tab */}
        <TabsContent value="pdfs" className="space-y-4">
          <Button onClick={() => setPdfDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar PDF
          </Button>

          {pdfs.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum PDF adicionado ainda.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pdfs.map((pdf) => (
                <Card key={pdf.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground truncate">{pdf.name}</h3>
                        {pdf.category && (
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{pdf.category}</span>
                        )}
                      </div>
                    </div>
                    {pdf.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{pdf.description}</p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <Button variant="outline" size="sm" asChild className="gap-1.5">
                        <a href={pdf.file_url} download>
                          <Download className="w-3.5 h-3.5" /> Baixar
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="gap-1.5">
                        <a href={pdf.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5" /> Visualizar
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => setEditingPdf(pdf)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deletePdf(pdf.id, pdf.file_name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <Button onClick={() => setVideoDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar Vídeo
          </Button>

          {videos.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum vídeo adicionado ainda.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <Card key={video.id} className="group hover:shadow-md transition-shadow overflow-hidden">
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtube_id}`}
                      className="w-full h-full"
                      allowFullScreen
                      title={video.title}
                    />
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-foreground">{video.title}</h3>
                    {video.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <Button variant="outline" size="sm" asChild className="gap-1.5">
                        <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5" /> Assistir
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteVideo(video.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <PdfUploadDialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen} onSuccess={invalidate} />
      <VideoAddDialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen} onSuccess={invalidate} />
    </div>
  );
};

export default AdminMaterials;
